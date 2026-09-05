import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const sseRateLimit = redisUrl && redisToken 
  ? new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(5, "1 m"), // Max 5 SSE connections per minute per user
      analytics: true,
    })
  : null;

/**
 * Server-Sent Events (SSE) endpoint for real-time notifications via MongoDB.
 * Provides a Next.js native stream for live MongoDB-backed notifications.
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = token.id as string;

  if (sseRateLimit) {
    const { success } = await sseRateLimit.limit(`sse_${userId}`);
    if (!success) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;
      const startedAt = Date.now();

      // Handle client disconnect to prevent memory leaks
      req.signal.addEventListener("abort", () => {
        isClosed = true;
      });

      // Track the newest notification we've sent
      let lastNotifDate = new Date();

      while (!isClosed && Date.now() - startedAt < 55_000) {
        try {
          // Poll MongoDB for notifications created after our last check
          const newNotifs = await prisma.notification.findMany({
            where: {
              userId,
              createdAt: { gt: lastNotifDate },
            },
            orderBy: { createdAt: "asc" },
          });

          if (newNotifs.length > 0) {
            lastNotifDate = newNotifs[newNotifs.length - 1].createdAt;
            // Push the new records to the client
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(newNotifs)}\n\n`)
            );
          } else {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          }
        } catch (e) {
          console.error("[SSE] Error polling notifications:", e);
          if (!isClosed) controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        }

        // Wait 3 seconds before polling again to avoid DB overload
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      if (!isClosed) controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
