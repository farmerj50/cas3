import { NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const current = await getCurrentUserFromCookie();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const picks = await prisma.pick.findMany({
    where: { userId: current.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ picks });
}

export async function POST(req: Request) {
  const current = await getCurrentUserFromCookie();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { numbers, score, algorithm, playType, intendedDate, intendedPeriod } = await req.json();

  if (!numbers || typeof numbers !== "string" || !/^\d{3}$/.test(numbers)) {
    return NextResponse.json({ error: "Invalid pick — must be exactly 3 digits." }, { status: 400 });
  }

  const validPlayTypes = ["straight", "box", "combo"];
  const resolvedPlayType = validPlayTypes.includes(playType) ? playType : "box";

  const pick = await prisma.pick.create({
    data: {
      numbers,
      score: typeof score === "number" ? score : 0,
      algorithm: algorithm || "weighted-v1",
      playType: resolvedPlayType,
      intendedDate: intendedDate || null,
      intendedPeriod: intendedPeriod || null,
      userId: current.userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      event: "SAVE_PICK",
      userId: current.userId,
      meta: JSON.stringify({ numbers, playType: resolvedPlayType, algorithm, intendedDate, intendedPeriod }),
    },
  });

  return NextResponse.json({ ok: true, pick });
}
