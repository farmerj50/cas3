"use client";

import { useState } from "react";
import { STATES, getStateMeta } from "@/lib/states";

export default function StateSelector({
  current,
  onChange,
}: {
  current: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const meta = getStateMeta(current);

  async function select(code: string) {
    if (code === current) { setOpen(false); return; }
    setSaving(true);
    try {
      await fetch("/api/user/state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: code }),
      });
      onChange(code);
    } finally {
      setSaving(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10 disabled:opacity-60"
      >
        <span className="font-semibold text-white">{meta?.code}</span>
        <span className="text-slate-400">{meta?.game}</span>
        <span className="ml-1 text-slate-500">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="px-3 py-2 text-xs uppercase tracking-widest text-slate-500">
              Select your state
            </div>
            <div className="max-h-64 overflow-y-auto">
              {STATES.map((s) => (
                <button
                  key={s.code}
                  onClick={() => select(s.code)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition hover:bg-white/5 ${
                    s.code === current ? "text-cyan-300" : "text-slate-200"
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="text-xs text-slate-500">{s.game}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
