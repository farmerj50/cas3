"use client";

import { useState } from "react";
import { getStateMeta } from "@/lib/states";

type Props = {
  state: string;
  onImported: () => void;
};

/**
 * Lines matching this pattern are skipped entirely (dates, prize amounts, headers).
 * This prevents "$500" from being treated as a lottery number.
 */
const SKIP_LINE =
  /\$|prize|jackpot|top\s|sun|mon|tue|wed|thu|fri|sat|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i;

/**
 * Extracts 3-digit lottery numbers from any pasted text.
 * Handles: "408"  "4-0-8"  "4 0 8"  "5, 5, 1"
 * Skips: date headers, "Top prize: $500" lines, year numbers (2026 etc.)
 */
function parseNumbers(raw: string): string[] {
  const found: string[] = [];

  for (const line of raw.split(/\n+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (SKIP_LINE.test(trimmed)) continue;

    // Strip any residual dollar amounts just in case they're inline
    const cleaned = trimmed.replace(/\$\d+(?:\.\d+)?/g, "");

    // Alt 1 — 3 single digits with a separator between each: "5, 5, 1"  "4-0-8"  "4 0 8"
    // Alt 2 — 3 consecutive digits: "408"
    const re =
      /(?<!\d)(\d)(?:[,\-.\s]\s?)(\d)(?:[,\-.\s]\s?)(\d)(?!\d)|(?<!\d)(\d{3})(?!\d)/g;
    let m;
    while ((m = re.exec(cleaned)) !== null) {
      found.push(m[4] !== undefined ? m[4] : m[1] + m[2] + m[3]);
    }
  }

  return found;
}

function getLotteryUsaUrl(state: string): string {
  const meta = getStateMeta(state);
  const stateName = meta.name.toLowerCase().replace(/\s+/g, "-");
  const gameName = meta.game.toLowerCase().replace(/\s+/g, "-");
  return `https://lotteryusa.com/${stateName}/${gameName}/`;
}

function buildDrawDates(count: number, endDate: string, period: string, twiceDaily: boolean) {
  const results: { numbers?: string; drawDate: string; period: string }[] = [];
  const end = new Date(endDate + "T12:00:00");

  if (!twiceDaily) {
    for (let i = 0; i < count; i++) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      results.push({ drawDate: d.toISOString().split("T")[0], period });
    }
  } else {
    // Two draws per day: most recent = evening, second = midday, alternating back
    const periods = ["evening", "midday"];
    let day = 0;
    let slot = 0;
    for (let i = 0; i < count; i++) {
      const d = new Date(end);
      d.setDate(d.getDate() - day);
      results.push({ drawDate: d.toISOString().split("T")[0], period: periods[slot] });
      slot++;
      if (slot >= 2) { slot = 0; day++; }
    }
  }

  return results;
}

export default function BulkImportForm({ state, onImported }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [raw, setRaw] = useState("");
  const [endDate, setEndDate] = useState(today);
  const [period, setPeriod] = useState("evening");
  const [twiceDaily, setTwiceDaily] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState("");

  const parsed = parseNumbers(raw);

  async function handleImport() {
    if (parsed.length === 0) { setError("No valid 3-digit numbers found."); return; }
    setLoading(true);
    setError("");
    setResult(null);

    const dates = buildDrawDates(parsed.length, endDate, period, twiceDaily);
    const draws = parsed.map((numbers, i) => ({ numbers, ...dates[i] }));

    try {
      const res = await fetch("/api/draws/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draws, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
      setRaw("");
      onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-xl font-semibold text-white">Bulk Import</h3>
      <p className="mt-1 text-sm text-slate-400">
        Paste results from your state lottery website — one number per line or space-separated.
        The most recent draw goes at the top.
      </p>

      <div className="mt-4 space-y-2 rounded-2xl border border-cyan-400/10 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
        <div>
          <span className="font-medium text-cyan-300">Easiest way to get draw history:</span>
        </div>
        <ol className="ml-1 space-y-1 list-decimal list-inside">
          <li>
            Open{" "}
            <a
              href={getLotteryUsaUrl(state)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              lotteryusa.com → {getStateMeta(state).name} {getStateMeta(state).game}
            </a>
          </li>
          <li>Scroll to the results table — it shows dates and numbers</li>
          <li>Select all the numbers on the page (Ctrl+A or drag-select)</li>
          <li>Copy and paste below — we extract the 3-digit numbers automatically</li>
        </ol>
        <div className="mt-1 text-slate-500">
          Works with any format: 408 · 4-0-8 · 4 0 8 · or plain lists
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">
            Paste numbers{parsed.length > 0 && (
              <span className="ml-2 text-cyan-300">{parsed.length} detected</span>
            )}
          </label>
          <textarea
            rows={8}
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setError(""); setResult(null); }}
            placeholder={"408\n4-0-8\n4 0 8\n123 456 789\n..."}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Most recent draw date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Draw period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              disabled={twiceDaily}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            >
              <option value="midday">Midday</option>
              <option value="evening">Evening</option>
            </select>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => setTwiceDaily((v) => !v)}
            className={`flex h-5 w-9 items-center rounded-full transition ${twiceDaily ? "bg-cyan-400" : "bg-slate-700"}`}
          >
            <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${twiceDaily ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-slate-300">
            My state draws twice daily (midday + evening)
          </span>
        </label>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
            Imported {result.imported} draw{result.imported !== 1 ? "s" : ""}
            {result.skipped > 0 && ` · ${result.skipped} skipped (already exist)`}
            {result.imported >= 20 && " · Analytics are now using your real data"}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={loading || parsed.length === 0}
          className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-50"
        >
          {loading ? "Importing…" : `Import ${parsed.length > 0 ? parsed.length : ""} draws`}
        </button>
      </div>
    </div>
  );
}
