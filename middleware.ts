import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis Ratelimiter (only runs if env vars are present)
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const authRateLimit = redisUrl && redisToken 
  ? new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
    })
  : null;

/**
 * NexaHR-AI — Edge Middleware (RBAC fast path + Security)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ── 0. Rate Limiting for Auth ──────────────────────────────────────────
  if (pathname.startsWith("/api/auth/")) {
    if (authRateLimit) {
      // Use IP for auth rate limiting
      const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await authRateLimit.limit(`auth_${ip}`);
      if (!success) {
        return new NextResponse("Too Many Requests - Try again later.", { status: 429 });
      }
    }
    // Allow NextAuth to handle the request if not rate limited
    return NextResponse.next();
  }

  // Read JWT from cookie — no DB call, runs entirely at the Edge
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── 1. No valid session → redirect to /login ─────────────────────────────
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // ── 2. /dashboard/admin/** → block EMPLOYEE role ─────────────────────────
  if (pathname.startsWith("/dashboard/admin")) {
    if (role === "EMPLOYEE") {
      return NextResponse.redirect(new URL("/dashboard/employee", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
