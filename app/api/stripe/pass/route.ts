import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PASS_OPTIONS = {
  "1day": { priceId: process.env.STRIPE_PRICE_PASS_1DAY!, days: 1 },
  "7day": { priceId: process.env.STRIPE_PRICE_PASS_7DAY!, days: 7 },
} as const;

type PassType = keyof typeof PASS_OPTIONS;

export async function POST(req: Request) {
  try {
    const current = await getCurrentUserFromCookie();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type } = (await req.json()) as { type: PassType };
    const pass = PASS_OPTIONS[type];
    if (!pass) return NextResponse.json({ error: "Invalid pass type" }, { status: 400 });

    const user = await (prisma.user.findUnique as any)({
      where: { id: current.userId },
      select: { id: true, email: true, stripeCustomerId: true },
    }) as { id: string; email: string; stripeCustomerId: string | null };

    const stripe = getStripe();
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      await (prisma.user.update as any)({
        where: { id: current.userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: pass.priceId, quantity: 1 }],
      metadata: {
        userId: current.userId,
        passType: type,
        passDays: String(pass.days),
      },
      success_url: `${base}/billing/success?type=pass&days=${pass.days}`,
      cancel_url: `${base}/upgrade`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe pass error:", error);
    const msg = error?.message ?? "Failed to create checkout session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
