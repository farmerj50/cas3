import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { fetchStateDraws } from "@/lib/lottery-fetch";

export async function POST(req: Request) {
  const current = await getCurrentUserFromCookie();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { state } = (await req.json()) as { state: string };
  if (!state) return NextResponse.json({ error: "state is required" }, { status: 400 });

  let fetched: Awaited<ReturnType<typeof fetchStateDraws>>;
  try {
    fetched = await fetchStateDraws(state, 90);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (fetched.length === 0) {
    return NextResponse.json({
      error: "No draw results found. The source page format may have changed.",
    }, { status: 422 });
  }

  // Deduplicate against existing draws for this state
  const existing = await (prisma.draw.findMany as any)({
    where: { state },
    select: { numbers: true, drawDate: true, period: true },
  });
  const existingSet = new Set(
    (existing as { numbers: string; drawDate: string; period: string }[]).map(
      (d) => `${d.numbers}|${d.drawDate}|${d.period}`
    )
  );

  const toInsert = fetched.filter(
    (d) => !existingSet.has(`${d.numbers}|${d.drawDate}|${d.period}`)
  );

  if (toInsert.length > 0) {
    await (prisma.draw.createMany as any)({
      data: toInsert.map((d) => ({ ...d, state })),
    });
  }

  return NextResponse.json({
    fetched: fetched.length,
    imported: toInsert.length,
    skipped: fetched.length - toInsert.length,
  });
}
