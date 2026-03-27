"use client";

type DigitStat = { digit: string; count: number; type: "hot" | "cold" | "neutral" };
type SumStat = { sum: number; count: number };
type RecommendedPick = { numbers: string; score: number; reason: string; tier: "top" | "mid" | "low" };

type Analytics = {
  digitStats: DigitStat[];
  topPairs: { pair: string; count: number }[];
  sumStats: SumStat[];
  recommendedPicks: RecommendedPick[];
  usingRealData: boolean;
};

function confidencePct(pick: RecommendedPick, allPicks: RecommendedPick[]) {
  if (!allPicks.length) return 72;
  const max = allPicks[0].score;
  const min = allPicks[allPicks.length - 1].score;
  const range = max - min || 1;
  const normalized = (pick.score - min) / range;
  return Math.round(60 + normalized * 32);
}

export default function TodaysEdge({ analytics }: { analytics: Analytics }) {
  const topPick = analytics.recommendedPicks[0];
  const hotDigits = analytics.digitStats.filter((d) => d.type === "hot").slice(0, 2);
  const hotPair = hotDigits.length >= 2 ? `${hotDigits[0].digit} · ${hotDigits[1].digit}` : "—";

  const sortedSums = [...analytics.sumStats].sort((a, b) => b.count - a.count);
  const peakSum = sortedSums[0]?.sum;
  const peakSum2 = sortedSums[1]?.sum;
  const sumBand =
    peakSum !== undefined && peakSum2 !== undefined
      ? `${Math.min(peakSum, peakSum2)}–${Math.max(peakSum, peakSum2)}`
      : "—";

  const confidence = topPick ? confidencePct(topPick, analytics.recommendedPicks) : 72;

  if (!topPick) return null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto]">
        {/* Left: label + hero pick */}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-300/80">
            Today&apos;s Edge
          </p>

          <div className="mt-3 flex flex-wrap items-end gap-4">
            <span
              className="font-mono text-7xl font-bold tracking-[0.35em] text-white sm:text-8xl"
              style={{ textShadow: "0 0 32px rgba(34,211,238,0.6), 0 0 64px rgba(34,211,238,0.25)" }}
            >
              {topPick.numbers}
            </span>
            <div className="mb-2 flex flex-col gap-2">
              <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-sm font-semibold text-cyan-300">
                {confidence}% confidence
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
                {topPick.reason}
              </span>
            </div>
          </div>
        </div>

        {/* Right: stats mini-grid */}
        <div className="grid grid-cols-3 gap-3 self-end lg:grid-cols-1 lg:gap-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2.5">
            <p className="text-xs text-slate-400">Hot pair</p>
            <p className="mt-0.5 font-mono text-base font-semibold text-white">{hotPair}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2.5">
            <p className="text-xs text-slate-400">Peak sums</p>
            <p className="mt-0.5 font-mono text-base font-semibold text-white">{sumBand}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2.5">
            <p className="text-xs text-slate-400">Play type</p>
            <p className="mt-0.5 text-base font-semibold text-white">Box</p>
          </div>
        </div>
      </div>

      {!analytics.usingRealData && (
        <div className="relative mt-4 rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-xs text-amber-300/80">
          Based on sample data — enter real draws to unlock your state&apos;s actual edge.
        </div>
      )}
    </div>
  );
}
