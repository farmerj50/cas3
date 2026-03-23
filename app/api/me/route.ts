import { NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const current = await getCurrentUserFromCookie();

  if (!current) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: current.userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      picks: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  return NextResponse.json({ user });
}
