import { NextResponse } from "next/server";
import { runCombinedReduction, runHotWheel, runRundown } from "@/lib/advanced-picks";
import { buildAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const algorithm = searchParams.get("algorithm") || "combined";
  const seed = searchParams.get("seed") || "000";
  const numDigits = Math.min(10, Math.max(4, parseInt(searchParams.get("digits") || "7")));
  const target = Math.min(100, Math.max(10, parseInt(searchParams.get("target") || "60")));

  // Load draw history from DB (fall back to sample analytics)
  let history: string[] = [];
  try {
    const draws = await prisma.draw.findMany({ orderBy: { drawDate: "asc" } });
    history = draws.map((d) => d.numbers);
  } catch {
    // stale client — analytics will use sample
  }

  const analytics = buildAnalytics(history.length >= 20 ? history : undefined);

  let result;
  switch (algorithm) {
    case "wheel":
      result = runHotWheel(analytics.digitStats, analytics.sumStats, analytics.history, numDigits, target);
      break;
    case "rundown":
      result = runRundown(seed, analytics.digitStats, analytics.history, target);
      break;
    default:
      result = runCombinedReduction(analytics.digitStats, analytics.sumStats, analytics.history, target);
  }

  return NextResponse.json(result);
}
