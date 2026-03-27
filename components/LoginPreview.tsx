"use client";

import { useEffect, useState } from "react";

const FUNNEL = [
  { label: "All combinations", value: "1,000", pct: 100 },
  { label: "Hot-digit filter",  value: "343",   pct: 68  },
  { label: "Sum range",         value: "127",   pct: 42  },
  { label: "Parity balance",    value: "91",    pct: 28  },
  { label: "Top ranked plays",  value: "60",    pct: 18  },
];

const PICKS = [
  { pick: "833", tier: "top", reason: "hot digits + dbl" },
  { pick: "283", tier: "top", reason: "pair strength" },
  { pick: "383", tier: "mid", reason: "sum alignment" },
];

export default function LoginPreview() {
  const [animated, setAnimated] = useState(false);

  // Trigger funnel bar animation shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
      <div className="absolute inset-0 bg-linear-to-br from-cyan-400/10 via-transparent to-violet-500/10" />

      <div className="relative space-y-5">

        {/* Today's Edge header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              Today&apos;s Edge
            </p>

            {/* Hero pick — glowing, large, spaced */}
            <div className="mt-2 flex items-baseline gap-3">
              <span
                className="font-mono text-4xl font-bold tracking-[0.4em] text-white"
                style={{ textShadow: "0 0 24px rgba(34,211,238,0.7), 0 0 48px rgba(34,211,238,0.35)" }}
              >
                833
              </span>
              <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                82% confidence
              </span>
            </div>

            {/* Why 833 */}
            <p className="mt-1.5 text-xs text-slate-400">
              Hot digits · double · peak sum alignment
            </p>
          </div>

          <div className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
            High confidence
          </div>
        </div>

        {/* Stats row */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Hot pair",      value: "8 · 3"  },
            { label: "Best sum band", value: "13–15"  },
            { label: "Play type",     value: "Box"    },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="mt-1 text-lg font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Animated reduction funnel */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Reduction funnel</p>
            <p className="text-xs text-slate-400">live preview</p>
          </div>

          {FUNNEL.map((item, idx) => (
            <div key={item.label} className="mb-3 last:mb-0">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-300">{idx + 1}. {item.label}</span>
                <span className="font-mono text-cyan-300">{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-400 to-violet-500 transition-all duration-700 ease-out"
                  style={{
                    width: animated ? `${item.pct}%` : "0%",
                    transitionDelay: `${idx * 120}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sample picks */}
        <div className="grid gap-3 sm:grid-cols-3">
          {PICKS.map((item) => (
            <div
              key={item.pick}
              className={`rounded-2xl border bg-slate-950/60 p-3 ${
                item.pick === "833"
                  ? "border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                  : "border-cyan-400/20"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-xl font-bold tracking-[0.2em] text-white"
                  style={item.pick === "833" ? { textShadow: "0 0 16px rgba(34,211,238,0.5)" } : {}}
                >
                  {item.pick}
                </span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                  item.tier === "top"
                    ? "bg-cyan-400/15 text-cyan-300"
                    : "bg-amber-400/15 text-amber-300"
                }`}>
                  {item.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400">{item.reason}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
