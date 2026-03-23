"use client";

import { useState, useEffect, useRef } from "react";

type RecommendedPick = {
  numbers: string;
  score: number;
  reason: string;
  tier: "top" | "mid" | "low";
};

type Props = {
  picks: RecommendedPick[];
  onSaved: () => void;
};

const TIER_STYLES = {
  top: "border-cyan-400/50 hover:border-cyan-400",
  mid: "border-amber-400/30 hover:border-amber-400",
  low: "border-white/10 hover:border-white/20",
};

const TIER_BADGE = {
  top: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  mid: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  low: "bg-slate-700/30 text-slate-400 border-slate-600/20",
};

function SlotDigit({ target, spinning }: { target: string; spinning: boolean }) {
  const [display, setDisplay] = useState(target);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (spinning) {
      intervalRef.current = setInterval(() => {
        setDisplay(Math.floor(Math.random() * 10).toString());
      }, 60);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplay(target);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [spinning, target]);

  return (
    <span
      className={`inline-block w-16 text-center transition-all ${
        spinning ? "animate-pulse text-slate-400" : "text-cyan-300"
      }`}
    >
      {display}
    </span>
  );
}

export default function PickGenerator({ picks, onSaved }: Props) {
  const [selected, setSelected] = useState<RecommendedPick | null>(picks[0] || null);
  const [saving, setSaving] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");

  function selectWithSpin(pick: RecommendedPick) {
    setSpinning(true);
    setMessage("");
    setTimeout(() => {
      setSelected(pick);
      setSpinning(false);
    }, 600);
  }

  function randomPick() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    const c = Math.floor(Math.random() * 10);
    selectWithSpin({ numbers: `${a}${b}${c}`, score: 0, reason: "Quick random pick", tier: "low" });
  }

  async function savePick() {
    if (!selected || saving) return;
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numbers: selected.numbers,
        score: selected.score,
        algorithm: selected.reason,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Could not save pick");
      return;
    }

    setMessage(`Saved ${selected.numbers}`);
    onSaved();
  }

  const digits = selected?.numbers.split("") || ["—", "—", "—"];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Pick generator</h3>
          <p className="mt-1 text-sm text-slate-300">
            Click a weighted recommendation or generate a quick random pick.
          </p>
        </div>
        <button
          onClick={randomPick}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Random quick pick
        </button>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-900/90 p-6 text-center">
        <div className="text-sm uppercase tracking-[0.35em] text-slate-400">
          Selected pick
        </div>

        <div className="mt-4 flex items-center justify-center gap-1 font-mono text-6xl font-bold">
          {digits.map((d, i) => (
            <SlotDigit key={i} target={d} spinning={spinning} />
          ))}
        </div>

        {selected && (
          <>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span
                className={`rounded-lg border px-2 py-0.5 text-xs ${
                  TIER_BADGE[selected.tier]
                }`}
              >
                {selected.tier === "top" ? "Top pick" : selected.tier === "mid" ? "Mid tier" : "Backup"}
              </span>
              <span className="text-sm text-slate-400">Score: {selected.score}</span>
            </div>
            <div className="mt-2 text-sm text-slate-500">{selected.reason}</div>
          </>
        )}

        <button
          onClick={savePick}
          disabled={!selected || saving || spinning}
          className="mt-5 rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save this pick"}
        </button>

        {message && <div className="mt-4 text-sm text-cyan-300">{message}</div>}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {picks.map((pick) => (
          <button
            key={pick.numbers}
            onClick={() => selectWithSpin(pick)}
            className={`rounded-2xl border bg-slate-900/80 p-4 text-left transition ${TIER_STYLES[pick.tier]}`}
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-2xl tracking-[0.25em] text-white">
                {pick.numbers}
              </div>
              <span
                className={`rounded-md border px-1.5 py-0.5 text-xs ${TIER_BADGE[pick.tier]}`}
              >
                {pick.tier}
              </span>
            </div>
            <div className="mt-2 text-sm text-slate-400">Score: {pick.score}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
