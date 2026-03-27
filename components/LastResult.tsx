"use client";

import { useEffect, useState } from "react";

type Draw = {
  id: string;
  numbers: string;
  drawDate: string;
  period: string;
};

type SavedPick = {
  id: string;
  numbers: string;
  playType: string;
  isHit: boolean | null;
  drawResult: string | null;
};

function matchCount(draw: string, pick: string) {
  const d = draw.split("");
  const p = pick.split("");
  return d.filter((digit) => p.includes(digit)).length;
}

export default function LastResult({ picks }: { picks: SavedPick[] }) {
  const [lastDraw, setLastDraw] = useState<Draw | null>(null);

  useEffect(() => {
    fetch("/api/draws?limit=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.draws?.[0]) setLastDraw(data.draws[0]);
      })
      .catch(() => {});
  }, []);

  if (!lastDraw) {
    return (
      <div className="rounded-2xl border border-white/8 bg-slate-950/40 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Last Result</p>
        <p className="mt-2 text-sm text-slate-500">No draws entered yet.</p>
      </div>
    );
  }

  const checkedPicks = picks.filter((p) => p.drawResult === lastDraw.numbers || p.isHit === true);
  const hits = checkedPicks.filter((p) => p.isHit === true);

  const digits = lastDraw.numbers.split("");
  const digitSum = digits.reduce((acc, d) => acc + parseInt(d), 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Last Result</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span
              className="font-mono text-4xl font-bold tracking-[0.3em] text-white"
              style={{ textShadow: "0 0 16px rgba(255,255,255,0.2)" }}
            >
              {lastDraw.numbers}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400">
              {lastDraw.period}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {lastDraw.drawDate} · digit sum {digitSum}
          </p>
        </div>

        {picks.length > 0 && (
          <div className="flex gap-2 self-end">
            {hits.length > 0 ? (
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300">
                {hits.length} hit{hits.length > 1 ? "s" : ""} on this draw
              </div>
            ) : checkedPicks.length > 0 ? (
              <div className="rounded-xl border border-slate-600/30 bg-slate-700/20 px-3 py-1.5 text-sm text-slate-400">
                No hits on this draw
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Digit display */}
      <div className="mt-3 flex gap-2">
        {digits.map((d, i) => (
          <div
            key={i}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-800 font-mono text-xl font-bold text-white"
          >
            {d}
          </div>
        ))}
        <div className="ml-2 flex items-center gap-1 text-xs text-slate-500">
          <span>∑ {digitSum}</span>
          <span className="text-slate-700">·</span>
          <span>
            {digits.filter((_, i, a) => a.indexOf(_) !== i).length > 0
              ? digits[0] === digits[1] && digits[1] === digits[2]
                ? "triple"
                : "double"
              : "single"}
          </span>
        </div>
      </div>
    </div>
  );
}
