import { NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const current = await getCurrentUserFromCookie();

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const picks = await prisma.pick.findMany({
    where: { userId: current.userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ picks });
}

export async function POST(req: Request) {
  const current = await getCurrentUserFromCookie();

  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { numbers, score, algorithm } = await req.json();

  if (!numbers || typeof numbers !== "string" || numbers.length !== 3) {
    return NextResponse.json({ error: "Invalid pick." }, { status: 400 });
  }

  const pick = await prisma.pick.create({
    data: {
      numbers,
      score: typeof score === "number" ? score : 0,
      algorithm: algorithm || "weighted-v1",
      userId: current.userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      event: "SAVE_PICK",
      userId: current.userId,
      meta: `numbers=${numbers}`,
    },
  });

  return NextResponse.json({ ok: true, pick });
}
