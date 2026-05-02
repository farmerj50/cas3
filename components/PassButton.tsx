"use client";

import { useState } from "react";

type Props = {
  passType: "1day" | "7day";
  label: string;
  className?: string;
};

export default function PassButton({ passType, label, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: passType }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        setError(data?.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className ?? "mt-6 w-full rounded-2xl bg-linear-to-r from-cyan-400 via-sky-400 to-cyan-300 py-3.5 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70"}
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
