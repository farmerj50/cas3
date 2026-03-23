"use client";

import { useState, useCallback } from "react";
import type { AdvancedPick, AdvancedResult, FunnelStep } from "@/lib/advanced-picks";

type Algorithm = "combined" | "wheel" | "rundown";

const ALGO_META: Record<Algorithm, { label: string; description: string }> = {
  combined: {
    label: "Combined Reduction",
    description:
      "4-filter mathematical funnel that narrows 1,000 combinations to ~60 strategic box plays using hot digits, sum concentration, and odd/even balance.",
  },
  wheel: {
    label: "Hot Digit Wheel",
    description:
      "Select N key digits and generate every possible 3-digit box combination from those digits only — the classic professional wheeling technique.",
  },
  rundown: {
    label: "Rundown System",
    description:
      "Derives candidates from a seed number using six standard rundown patterns (+1, +2, +123, +132, mirror, mirror+rundown) favored by Pick-3 professionals.",
  },
};

function FunnelDisplay({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const pct = i === 0 ? 100 : Math.round((step.count / steps[0].count) * 100);
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 text-center text-xs text-slate-500">{i + 1}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{step.label}</span>
                <span className="font-mono text-cyan-300">{step.count}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div className="w-10 text-right text-xs text-slate-500">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

function PickGrid({
  picks,
  onSave,
  saving,
}: {
  picks: AdvancedPick[];
  onSave: (p: AdvancedPick) => void;
  saving: string | null;
}) {
  const max = picks[0]?.score || 1;
  const min = picks[picks.length - 1]?.score || 0;
  const range = max - min || 1;

  function tierOf(score: number) {
    const pct = (score - min) / range;
    if (pct > 0.66) return "top";
    if (pct > 0.33) return "mid";
    return "low";
  }

  const tierStyle: Record<string, string> = {
    top: "border-cyan-400/40 bg-cyan-500/5",
    mid: "border-amber-400/20 bg-amber-500/5",
    low: "border-white/5 bg-white/2",
  };
  const tierBadge: Record<string, string> = {
    top: "text-cyan-300 bg-cyan-500/10",
    mid: "text-amber-300 bg-amber-500/10",
    low: "text-slate-400 bg-slate-700/30",
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {picks.map((pick) => {
        const tier = tierOf(pick.score);
        return (
          <button
            key={pick.numbers}
            onClick={() => onSave(pick)}
            disabled={saving === pick.numbers}
            className={`rounded-2xl border p-3 text-left transition hover:scale-[1.02] disabled:opacity-60 ${tierStyle[tier]}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl font-bold tracking-[0.2em] text-white">
                {pick.numbers}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-xs ${tierBadge[tier]}`}>
                {tier}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
              <span>∑{pick.sum}</span>
              <span>{pick.oddCount}o/{3 - pick.oddCount}e</span>
              {pick.isDouble && <span className="text-violet-400">dbl</span>}
              {pick.isTriple && <span className="text-red-400">trip</span>}
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                style={{ width: `${((pick.score - min) / range) * 100}%` }}
              />
            </div>
            {saving === pick.numbers && (
              <div className="mt-1 text-xs text-cyan-400">Saving…</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function AdvancedPickSystem({ onSaved }: { onSaved: () => void }) {
  const [algorithm, setAlgorithm] = useState<Algorithm>("combined");
  const [numDigits, setNumDigits] = useState(7);
  const [seed, setSeed] = useState("");
  const [target, setTarget] = useState(60);
  const [result, setResult] = useState<AdvancedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        algorithm,
        digits: numDigits.toString(),
        seed: seed || "000",
        target: target.toString(),
      });
      const res = await fetch(`/api/advanced-picks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as AdvancedResult;
      setResult(data);
      setSavedCount(0);
    } catch {
      setError("Could not load picks. Try again.");
    } finally {
      setLoading(false);
    }
  }, [algorithm, numDigits, seed, target]);

  async function savePick(pick: AdvancedPick) {
    setSaving(pick.numbers);
    await fetch("/api/picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numbers: pick.numbers,
        score: pick.score,
        algorithm: `advanced-${algorithm}`,
      }),
    });
    setSaving(null);
    setSavedCount((n) => n + 1);
    onSaved();
  }

  async function saveAll() {
    if (!result) return;
    for (const pick of result.picks.slice(0, 20)) {
      await savePick(pick);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Advanced Pick System</h3>
          <p className="mt-1 text-sm text-slate-300">
            Mathematical reduction system used by professional Pick-3 players — narrows 1,000
            combinations to ~60 strategic plays.
          </p>
        </div>
        {savedCount > 0 && (
          <div className="rounded-2xl bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300">
            {savedCount} saved this session
          </div>
        )}
      </div>

      {/* Algorithm tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {(Object.keys(ALGO_META) as Algorithm[]).map((a) => (
          <button
            key={a}
            onClick={() => {
              setAlgorithm(a);
              setResult(null);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              algorithm === a
                ? "bg-cyan-400 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {ALGO_META[a].label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-slate-400">{ALGO_META[algorithm].description}</p>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-end gap-4">
        {algorithm === "wheel" && (
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">Hot digits to wheel</label>
            <div className="flex gap-1">
              {[4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumDigits(n)}
                  className={`rounded-xl px-3 py-2 text-sm font-mono transition ${
                    numDigits === n
                      ? "bg-violet-500 text-white"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {algorithm === "rundown" && (
          <div>
            <label className="mb-1.5 block text-xs text-slate-400">Seed number</label>
            <input
              type="text"
              maxLength={3}
              inputMode="numeric"
              placeholder="e.g. 408"
              value={seed}
              onChange={(e) => setSeed(e.target.value.replace(/\D/g, "").slice(0, 3))}
              className="w-28 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-lg tracking-widest text-white outline-none focus:border-cyan-400"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Target count</label>
          <div className="flex gap-1">
            {[30, 45, 60, 80].map((n) => (
              <button
                key={n}
                onClick={() => setTarget(n)}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  target === n
                    ? "bg-violet-500 text-white font-semibold"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={run}
          disabled={loading || (algorithm === "rundown" && seed.length !== 3)}
          className="rounded-2xl bg-cyan-400 px-6 py-2.5 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Calculating…" : "Generate picks"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          {/* Funnel */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Reduction funnel</h4>
              <span className="text-xs text-slate-400">
                Hot digits: {result.hotDigits.join("  ")}
              </span>
            </div>
            <FunnelDisplay steps={result.funnel} />
          </div>

          {/* Pick grid header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-white">
                {result.picks.length} strategic plays
              </h4>
              <p className="text-xs text-slate-400">
                Click any pick to save it. Cyan = top tier, amber = mid, gray = backup.
              </p>
            </div>
            <button
              onClick={saveAll}
              className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
            >
              Save top 20
            </button>
          </div>

          <PickGrid picks={result.picks} onSave={savePick} saving={saving} />
        </div>
      )}
    </div>
  );
}
