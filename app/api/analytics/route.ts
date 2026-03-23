import { NextResponse } from "next/server";
import { buildAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all";
  const days = searchParams.get("days");

  const where: Record<string, unknown> = {};
  if (period !== "all") where.period = period;
  if (days && days !== "all") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));
    where.drawDate = { gte: cutoff.toISOString().split("T")[0] };
  }

  let draws: string[] = [];
  try {
    const dbDraws = await prisma.draw.findMany({
      where,
      orderBy: { drawDate: "asc" },
    });
    draws = dbDraws.map((d) => d.numbers);
  } catch {
    // Draw table not yet available (stale Prisma client) — fall back to sample data
  }

  const analytics = buildAnalytics(draws.length >= 20 ? draws : undefined);

  return NextResponse.json({ ...analytics, usingRealData: draws.length >= 20 });
}
