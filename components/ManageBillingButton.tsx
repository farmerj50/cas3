"use client";

import { useState } from "react";

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data?.error || "Could not open billing portal");
      window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not open billing portal.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="rounded-2xl border border-cyan-400/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-white/10 disabled:opacity-60"
    >
      {loading ? "Opening…" : "Manage Billing"}
    </button>
  );
}
