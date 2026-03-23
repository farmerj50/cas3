"use client";

import { useEffect, useState } from "react";

type Draw = {
  id: string;
  numbers: string;
  drawDate: string;
  period: string;
  createdAt: string;
};

type Props = {
  refresh?: number;
};

export default function DrawHistoryTable({ refresh }: Props) {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/draws?limit=30")
      .then((r) => r.json())
      .then((d) => {
        setDraws(d.draws || []);
        setLoading(false);
      });
  }, [refresh]);

  const periodColor: Record<string, string> = {
    midday: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    evening: "text-violet-300 bg-violet-500/10 border-violet-500/20",
    night: "text-slate-300 bg-slate-500/10 border-slate-500/20",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-xl font-semibold text-white">Draw history</h3>
      <p className="mt-1 text-sm text-slate-300">
        {draws.length === 0
          ? "No draws entered yet. Add results above to build real analytics."
          : `${draws.length} draw${draws.length !== 1 ? "s" : ""} on record.`}
      </p>

      {loading ? (
        <div className="mt-4 text-sm text-slate-500">Loading...</div>
      ) : draws.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-500">
          No draws yet
        </div>
      ) : (
        <div className="mt-5 max-h-[360px] overflow-y-auto space-y-2 pr-1">
          {draws.map((draw) => (
            <div
              key={draw.id}
              className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3"
            >
              <div className="font-mono text-2xl font-bold tracking-[0.25em] text-white">
                {draw.numbers}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-400">{draw.drawDate}</span>
                <span
                  className={`rounded-lg border px-2 py-0.5 text-xs ${
                    periodColor[draw.period] || "text-slate-300"
                  }`}
                >
                  {draw.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
