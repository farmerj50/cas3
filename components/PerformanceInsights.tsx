import Link from "next/link";

type SavedPick = {
  playType: string;
  isHit: boolean | null;
};

type SumStat = { sum: number; count: number };

function getBestPlayType(picks: SavedPick[]): string {
  const checked = picks.filter((p) => p.isHit !== null);
  if (checked.length < 3) return "Need more data";

  const counts: Record<string, { hits: number; total: number }> = {};
  for (const p of checked) {
    if (!counts[p.playType]) counts[p.playType] = { hits: 0, total: 0 };
    counts[p.playType].total++;
    if (p.isHit) counts[p.playType].hits++;
  }

  let best = "";
  let bestRate = -1;
  for (const [type, stats] of Object.entries(counts)) {
    if (stats.total < 2) continue;
    const rate = stats.hits / stats.total;
    if (rate > bestRate) { bestRate = rate; best = type; }
  }

  return best
    ? `${best.charAt(0).toUpperCase() + best.slice(1)} (${Math.round(bestRate * 100)}%)`
    : "Not enough data";
}

function getPeakSumRange(sumStats: SumStat[]): string {
  if (!sumStats.length) return "—";
  const sorted = [...sumStats].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 2).map((s) => s.sum).sort((a, b) => a - b);
  return top.length >= 2 ? `${top[0]}–${top[1]}` : `${top[0]}`;
}

export default function PerformanceInsights({
  picks,
  sumStats,
  isPremium,
}: {
  picks: SavedPick[];
  sumStats: SumStat[];
  isPremium: boolean;
}) {
  const checked = picks.filter((p) => p.isHit !== null);
  const hits = picks.filter((p) => p.isHit === true);
  const hitRate = checked.length > 0 ? Math.round((hits.length / checked.length) * 100) : null;
  const bestStrategy = getBestPlayType(picks);
  const peakRange = getPeakSumRange(sumStats);

  const stats = [
    {
      label: "Hit rate",
      value: hitRate !== null ? `${hitRate}%` : "—",
      sub: checked.length > 0 ? `${hits.length} of ${checked.length} checked` : "No picks checked yet",
      color: hitRate !== null && hitRate >= 30 ? "text-cyan-300" : "text-white",
    },
    {
      label: "Best strategy",
      value: bestStrategy,
      sub: "By play type win rate",
      color: "text-white",
    },
    {
      label: "Best sum range",
      value: peakRange,
      sub: "Most frequent digit sums",
      color: "text-amber-300",
    },
    {
      label: "Picks tracked",
      value: checked.length.toString(),
      sub: `${picks.length} total saved`,
      color: "text-slate-300",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Performance Insights</h3>
          <p className="mt-1 text-sm text-slate-400">
            How your picks are performing over time.
          </p>
        </div>
        {isPremium && (
          <span className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            Premium
          </span>
        )}
      </div>

      <div className={`relative mt-5 ${!isPremium ? "select-none" : ""}`}>
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${!isPremium ? "blur-[3px] pointer-events-none" : ""}`}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
            >
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </div>

        {!isPremium && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/70 backdrop-blur-[1px]">
            <p className="font-semibold text-white">Track your full performance</p>
            <p className="mt-1 text-xs text-slate-400">
              Hit rates, best strategies, and deeper insights
            </p>
            <Link
              href="/upgrade"
              className="mt-3 inline-block rounded-xl bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
