"use client";

import Link from "next/link";

type RecommendedPick = {
  numbers: string;
  score: number;
  reason: string;
  tier: "top" | "mid" | "low";
};

function confidencePct(score: number, max: number, min: number) {
  const range = max - min || 1;
  return Math.round(72 + ((score - min) / range) * 20);
}

export default function ElitePicks({
  picks,
  isPremium,
}: {
  picks: RecommendedPick[];
  isPremium: boolean;
}) {
  const topPicks = picks.filter((p) => p.tier === "top").slice(0, 3);
  const maxScore = picks[0]?.score || 1;
  const minScore = picks[picks.length - 1]?.score || 0;

  // Placeholder numbers shown blurred for free users
  const blurredPlaceholders = ["8 3 3", "2 8 3", "8 8 3"];

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-slate-950/70 p-6 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-cyan-400/8 to-violet-500/8" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-300/80">
              Elite Picks
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              Highest confidence plays today
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Top-ranked by composite frequency, pair strength, and sum alignment.
            </p>
          </div>
          {isPremium && (
            <span className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              Premium
            </span>
          )}
        </div>

        {/* Pick cards */}
        <div className="relative mt-5">
          <div className={`grid grid-cols-3 gap-3 ${!isPremium ? "pointer-events-none select-none" : ""}`}>
            {isPremium
              ? topPicks.map((pick) => (
                  <div
                    key={pick.numbers}
                    className="rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-4 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                  >
                    <span
                      className="block font-mono text-2xl font-bold tracking-[0.25em] text-white"
                      style={{ textShadow: "0 0 16px rgba(34,211,238,0.4)" }}
                    >
                      {pick.numbers}
                    </span>
                    <span className="mt-2 block text-xs text-slate-400">{pick.reason}</span>
                    <div className="mt-2 inline-block rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                      {confidencePct(pick.score, maxScore, minScore)}% confidence
                    </div>
                  </div>
                ))
              : blurredPlaceholders.map((p) => (
                  <div
                    key={p}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 blur-[6px]"
                  >
                    <span className="block font-mono text-2xl font-bold tracking-[0.25em] text-white">
                      {p}
                    </span>
                    <span className="mt-2 block text-xs text-slate-400">hot digits · peak sum</span>
                    <div className="mt-2 inline-block rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-300">
                      9x% confidence
                    </div>
                  </div>
                ))}
          </div>

          {/* Lock overlay for free users */}
          {!isPremium && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/75 backdrop-blur-[2px]">
              <div className="text-center">
                <div className="text-2xl">🔒</div>
                <p className="mt-2 font-semibold text-white">Unlock Elite Strategy</p>
                <p className="mt-1 text-xs text-slate-400">
                  See the highest-confidence plays with full reasoning
                </p>
              </div>
              <Link
                href="/upgrade"
                className="mt-4 rounded-2xl bg-linear-to-r from-cyan-400 to-sky-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              >
                Upgrade to Premium
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
