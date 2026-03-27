import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const state = searchParams.get("state");

  const where: Record<string, unknown> = {};
  if (state) where.state = state;

  const draws = await prisma.draw.findMany({
    where,
    orderBy: [{ drawDate: "desc" }, { createdAt: "desc" }],
    take: Math.min(limit, 200),
  });

  return NextResponse.json({ draws });
}

function isHitForPlayType(pickNumbers: string, drawNumbers: string, playType: string): boolean {
  const exact = pickNumbers === drawNumbers;
  const box = pickNumbers.split("").sort().join("") === drawNumbers.split("").sort().join("");
  if (playType === "straight") return exact;
  if (playType === "box") return box;
  if (playType === "combo") return exact || box;
  return box;
}

export async function DELETE(req: Request) {
  const current = await getCurrentUserFromCookie();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");
  if (!state) return NextResponse.json({ error: "state is required" }, { status: 400 });

  const result = await (prisma.draw.deleteMany as any)({ where: { state } });
  return NextResponse.json({ deleted: result.count });
}

export async function POST(req: Request) {
  const current = await getCurrentUserFromCookie();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { numbers, drawDate, period, state } = await req.json();

  if (!numbers || typeof numbers !== "string" || !/^\d{3}$/.test(numbers)) {
    return NextResponse.json({ error: "numbers must be exactly 3 digits" }, { status: 400 });
  }
  if (!drawDate || !period) {
    return NextResponse.json({ error: "drawDate and period are required" }, { status: 400 });
  }

  const drawState = state || "GA";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const draw = await prisma.draw.create({
    data: { numbers, drawDate, period, state: drawState } as any,
  });

  const allUnchecked = await prisma.pick.findMany({
    where: { userId: current.userId, isHit: null },
  });

  const relevant = allUnchecked.filter((pick) => {
    if (pick.intendedDate && pick.intendedDate !== drawDate) return false;
    if (pick.intendedPeriod && pick.intendedPeriod !== period) return false;
    return true;
  });

  const updates = relevant.map((pick) =>
    prisma.pick.update({
      where: { id: pick.id },
      data: {
        isHit: isHitForPlayType(pick.numbers, numbers, pick.playType),
        drawResult: numbers,
        checkedAt: new Date(),
      },
    })
  );

  await Promise.all(updates);

  await prisma.auditLog.create({
    data: {
      event: "ADD_DRAW",
      userId: current.userId,
      meta: JSON.stringify({ numbers, period, drawDate, state: drawState, picksChecked: updates.length }),
    },
  });

  return NextResponse.json({ ok: true, draw, picksChecked: updates.length });
}
