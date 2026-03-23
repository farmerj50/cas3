"use client";

import { useState } from "react";

type Props = {
  onDrawAdded: () => void;
};

export default function DrawEntryForm({ onDrawAdded }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [numbers, setNumbers] = useState("");
  const [drawDate, setDrawDate] = useState(today);
  const [period, setPeriod] = useState("evening");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{3}$/.test(numbers)) {
      setMessage({ text: "Enter exactly 3 digits (e.g. 408)", ok: false });
      return;
    }
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/draws", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numbers, drawDate, period }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage({ text: data.error || "Failed to add draw", ok: false });
      return;
    }

    setMessage({
      text: `Saved draw ${numbers} (${period}, ${drawDate}). Checked ${data.picksChecked} pick${data.picksChecked !== 1 ? "s" : ""}.`,
      ok: true,
    });
    setNumbers("");
    onDrawAdded();
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-xl font-semibold text-white">Add draw result</h3>
      <p className="mt-1 text-sm text-slate-300">
        Enter the actual winning number. Your saved picks will be checked automatically.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">Winning number</label>
          <input
            type="text"
            maxLength={3}
            pattern="\d{3}"
            inputMode="numeric"
            placeholder="e.g. 408"
            value={numbers}
            onChange={(e) => setNumbers(e.target.value.replace(/\D/g, "").slice(0, 3))}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 font-mono text-2xl tracking-[0.3em] text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Draw date</label>
            <input
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-400">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="midday">Midday</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save draw result"}
        </button>

        {message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              message.ok
                ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                : "border border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
