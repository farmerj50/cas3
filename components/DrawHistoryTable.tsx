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
  state?: string;
  onCleared?: () => void;
};

export default function DrawHistoryTable({ refresh, state = "GA", onCleared }: Props) {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  function load() {
    setLoading(true);
    fetch(`/api/draws?limit=30&state=${state}`)
      .then((r) => r.json())
      .then((d) => {
        setDraws(d.draws || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, state]);

  async function handleClear() {
    setClearing(true);
    await fetch(`/api/draws?state=${state}`, { method: "DELETE" });
    setClearing(false);
    setConfirmClear(false);
    setDraws([]);
    onCleared?.();
  }

  const periodColor: Record<string, string> = {
    midday: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    evening: "text-violet-300 bg-violet-500/10 border-violet-500/20",
    night: "text-slate-300 bg-slate-500/10 border-slate-500/20",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Draw history</h3>
          <p className="mt-1 text-sm text-slate-300">
            {draws.length === 0
              ? "No draws yet. Add results above to build real analytics."
              : `${draws.length} draw${draws.length !== 1 ? "s" : ""} on record.`}
          </p>
        </div>

        {draws.length > 0 && !confirmClear && (
          <button
            onClick={() => setConfirmClear(true)}
            className="shrink-0 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/15"
          >
            Clear all
          </button>
        )}

        {confirmClear && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-slate-400">Delete all draws?</span>
            <button
              onClick={handleClear}
              disabled={clearing}
              className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {clearing ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-4 text-sm text-slate-500">Loading...</div>
      ) : draws.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-500">
          No draws yet
        </div>
      ) : (
        <div className="mt-5 max-h-90 overflow-y-auto space-y-2 pr-1">
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
