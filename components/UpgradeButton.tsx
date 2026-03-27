"use client";

import { useState } from "react";

export default function UpgradeButton({
  label = "Upgrade to Premium",
  plan = "monthly",
  className,
}: {
  label?: string;
  plan?: "monthly" | "annual";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        throw new Error(
          data?.error ||
            (res.status === 500
              ? "Server error — check that STRIPE_SECRET_KEY is set in .env.local"
              : `Checkout failed (${res.status})`)
        );
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={
          className ??
          "rounded-2xl bg-linear-to-r from-cyan-400 via-sky-400 to-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        {loading ? "Opening checkout…" : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
