"use client";

import { useState } from "react";

type Props = {
  state: string;
  onImported: () => void;
};

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; imported: number; skipped: number; fetched: number }
  | { type: "error"; message: string };

export default function AutoFetchButton({ state, onImported }: Props) {
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function handleFetch() {
    setStatus({ type: "loading" });
    try {
      const res = await fetch("/api/draws/auto-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Fetch failed" });
        return;
      }
      setStatus({
        type: "success",
        imported: data.imported,
        skipped: data.skipped,
        fetched: data.fetched,
      });
      if (data.imported > 0) onImported();
    } catch {
      setStatus({ type: "error", message: "Network error — check your connection." });
    }
  }

  const isLoading = status.type === "loading";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Auto-Sync Draw History</h3>
          <p className="mt-1 text-sm text-slate-400">
            Automatically fetch the last 90 draws for your state from LotteryPost.
            No manual copying needed.
          </p>
        </div>
        <span className="shrink-0 rounded-xl bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
          Beta
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-slate-900/50 px-4 py-3 text-xs text-slate-400">
        <span className="font-medium text-cyan-300">How it works:</span> We fetch publicly
        available results from LotteryPost and add any draws you don&apos;t already have.
        Existing draws are never duplicated.
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={handleFetch}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Fetching…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Sync latest 90 draws
            </>
          )}
        </button>

        {status.type === "success" && (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm text-cyan-300">
            {status.imported > 0 ? (
              <>
                {status.imported} new draw{status.imported !== 1 ? "s" : ""} added
                {status.skipped > 0 && ` · ${status.skipped} already existed`}
                {status.imported >= 20 && " · Analytics now using real data"}
              </>
            ) : (
              <>Already up to date · {status.skipped} draws on file</>
            )}
          </div>
        )}

        {status.type === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
