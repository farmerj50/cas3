import Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Webhook signature invalid", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        if (session.mode === "subscription" && session.subscription) {
          // Full subscription purchase
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier: "premium",
              stripeCustomerId: String(session.customer),
              stripeSubscriptionId: String(session.subscription),
              subscriptionStatus: "active",
            },
          });
        } else if (session.mode === "payment" && session.metadata?.passType) {
          // Day / week pass purchase
          const days = parseInt(session.metadata.passDays || "1", 10);
          const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
          await (prisma.user.update as any)({
            where: { id: userId },
            data: { premiumExpiresAt: expiresAt },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const isActive = sub.status === "active" || sub.status === "trialing";
        await prisma.user.updateMany({
          where: { stripeCustomerId: String(sub.customer) },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id ?? null,
            subscriptionStatus: sub.status,
            tier: isActive ? "premium" : "free",
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: String(sub.customer) },
          data: {
            subscriptionStatus: sub.status,
            tier: "free",
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: String(invoice.customer) },
            data: { subscriptionStatus: "past_due" },
          });
        }
        break;
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Webhook handler failed", { status: 500 });
  }
}
