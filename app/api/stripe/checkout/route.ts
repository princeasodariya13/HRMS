import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const checkoutRateLimit = redisUrl && redisToken 
  ? new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
    })
  : null;

const checkoutSchema = z.object({
  priceId: z.string().min(1, "Price ID is required").startsWith("price_", "Invalid Price ID format"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (checkoutRateLimit) {
      const identifier = `checkout_${user.id}`;
      const { success } = await checkoutRateLimit.limit(identifier);
      if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
      }
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "COMPANY_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const rawJson = await req.json();
    const parsed = checkoutSchema.safeParse(rawJson);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { priceId } = parsed.data;

    // Determine the base URL for success/cancel redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Find if they already have a stripe customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: dbUser.companyId }
    });

    let customerId = subscription?.stripeCustomerId;
    
    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId || undefined,
      client_reference_id: dbUser.companyId, // To identify in webhook
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/admin/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/admin/settings`,
      metadata: {
        companyId: dbUser.companyId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
