import Stripe from "stripe";

const stripeApiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2024-06-20" as any,
  appInfo: {
    name: "NexaHR-AI",
    version: "0.1.0",
  },
});

export default stripe;
