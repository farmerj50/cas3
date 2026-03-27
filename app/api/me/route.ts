import { NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const current = await getCurrentUserFromCookie();

  if (!current) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (prisma.user.findUnique as any)({
    where: { id: current.userId },
    select: {
      id: true,
      email: true,
      tier: true,
      state: true,
      subscriptionStatus: true,
      premiumExpiresAt: true,
      createdAt: true,
      picks: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  return NextResponse.json({ user });
}
