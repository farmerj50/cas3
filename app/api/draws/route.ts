import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const draws = await prisma.draw.findMany({
    orderBy: [{ drawDate: "desc" }, { createdAt: "desc" }],
    take: Math.min(limit, 200),
  });

  return NextResponse.json({ draws });
}

export async function POST(req: Request) {
  const current = await getCurrentUserFromCookie();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { numbers, drawDate, period } = await req.json();

  if (!numbers || typeof numbers !== "string" || !/^\d{3}$/.test(numbers)) {
    return NextResponse.json({ error: "numbers must be exactly 3 digits" }, { status: 400 });
  }
  if (!drawDate || !period) {
    return NextResponse.json({ error: "drawDate and period are required" }, { status: 400 });
  }

  const draw = await prisma.draw.create({
    data: { numbers, drawDate, period },
  });

  // Auto-check picks from this user saved on or before this draw date
  const userPicks = await prisma.pick.findMany({
    where: { userId: current.userId, isHit: null },
  });

  const checksorted = numbers.split("").sort().join("");
  const updates = userPicks.map((pick) => {
    const exact = pick.numbers === numbers;
    const box = pick.numbers.split("").sort().join("") === checksorted;
    const isHit = exact || box;
    return prisma.pick.update({
      where: { id: pick.id },
      data: { isHit, drawResult: numbers, checkedAt: new Date() },
    });
  });

  await Promise.all(updates);

  await prisma.auditLog.create({
    data: {
      event: "ADD_DRAW",
      userId: current.userId,
      meta: `numbers=${numbers} period=${period} date=${drawDate}`,
    },
  });

  return NextResponse.json({ ok: true, draw, picksChecked: updates.length });
}
