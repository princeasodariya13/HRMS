import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder"
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;
        const status = subscription.status;
        const cancelAtPeriodEnd = subscription.cancel_at_period_end;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Map priceId to PlanTier (assuming IDs are set in env or known)
        let planTier = "STARTER";
        if (priceId === process.env.STRIPE_GROWTH_PRICE_ID_MONTHLY || priceId === process.env.STRIPE_GROWTH_PRICE_ID_YEARLY) {
          planTier = "GROWTH";
        } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID_MONTHLY || priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID_YEARLY) {
          planTier = "ENTERPRISE";
        }

        // Find the company by stripeCustomerId
        // Or if we attach metadata.companyId during checkout, use that
        const companyId = subscription.metadata?.companyId;
        
        if (companyId) {
          await prisma.subscription.upsert({
            where: { companyId },
            create: {
              companyId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              status,
              planTier: planTier as any,
              currentPeriodEnd,
              cancelAtPeriodEnd,
            },
            update: {
              stripeSubscriptionId: subscription.id,
              status,
              planTier: planTier as any,
              currentPeriodEnd,
              cancelAtPeriodEnd,
            },
          });
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "canceled",
            planTier: "STARTER", // Downgrade to Starter
            cancelAtPeriodEnd: false
          }
        });
        break;
      }
      
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode === "subscription") {
          const companyId = session.client_reference_id;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          
          if (companyId) {
            await prisma.subscription.update({
              where: { companyId },
              data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId
              }
            }).catch(() => {
              // If subscription doesn't exist, it will be created by customer.subscription.created event
              console.warn("Subscription not found during checkout.session.completed, waiting for subscription.created event");
            });
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse("Webhook processed", { status: 200 });
}
