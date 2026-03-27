import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const current = await getCurrentUserFromCookie();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { draws, state } = await req.json() as {
    draws: { numbers: string; drawDate: string; period: string }[];
    state: string;
  };

  if (!Array.isArray(draws) || draws.length === 0) {
    return NextResponse.json({ error: "No draws provided" }, { status: 400 });
  }
  if (draws.length > 365) {
    return NextResponse.json({ error: "Max 365 draws per import" }, { status: 400 });
  }

  const invalid = draws.find((d) => !/^\d{3}$/.test(d.numbers));
  if (invalid) {
    return NextResponse.json({ error: `Invalid number: ${invalid.numbers}` }, { status: 400 });
  }

  // Skip duplicates already in DB for this state
  const existing = await prisma.draw.findMany({
    where: { state } as any,
    select: { numbers: true, drawDate: true, period: true },
  });
  const existingSet = new Set(existing.map((d) => `${d.numbers}|${d.drawDate}|${d.period}`));

  const toInsert = draws.filter(
    (d) => !existingSet.has(`${d.numbers}|${d.drawDate}|${d.period}`)
  );

  if (toInsert.length === 0) {
    return NextResponse.json({ imported: 0, skipped: draws.length });
  }

  await prisma.draw.createMany({
    data: toInsert.map((d) => ({ ...d, state })) as any,
  });

  return NextResponse.json({ imported: toInsert.length, skipped: draws.length - toInsert.length });
}
