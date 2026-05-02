import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const current = await getCurrentUserFromCookie();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan: "monthly" | "annual" = body.plan === "annual" ? "annual" : "monthly";

    const dbUser = await prisma.user.findUnique({ where: { id: current.userId } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.tier === "premium") {
      return NextResponse.json({ error: "Already premium" }, { status: 400 });
    }

    const stripe = getStripe();
    let customerId = dbUser.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        metadata: { userId: dbUser.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = plan === "annual"
      ? process.env.STRIPE_PRICE_PREMIUM_ANNUAL!
      : process.env.STRIPE_PRICE_PREMIUM_MONTHLY!;

    const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cas3.app").replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/upgrade?canceled=1`,
      allow_promotion_codes: true,
      metadata: { userId: dbUser.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    const msg = error?.message ?? "Failed to create checkout session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
