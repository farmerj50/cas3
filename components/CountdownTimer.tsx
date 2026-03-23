"use client";

import { useEffect, useState } from "react";

const DRAW_TIMES = [
  { label: "Midday", hour: 12, minute: 29 },
  { label: "Evening", hour: 18, minute: 59 },
];

function getNextDraw() {
  const now = new Date();
  // Work in ET — approximate by using UTC-5 (EST) or UTC-4 (EDT)
  const etOffset = -5 * 60; // minutes from UTC (close enough for display)
  const etNow = new Date(now.getTime() + (now.getTimezoneOffset() + etOffset) * 60000);

  for (const draw of DRAW_TIMES) {
    const drawTime = new Date(etNow);
    drawTime.setHours(draw.hour, draw.minute, 0, 0);
    if (etNow < drawTime) {
      const diff = drawTime.getTime() - etNow.getTime();
      return { label: draw.label, diff };
    }
  }

  // Next midday tomorrow
  const tomorrow = new Date(etNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 29, 0, 0);
  return { label: "Midday", diff: tomorrow.getTime() - etNow.getTime() };
}

function fmt(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}

export default function CountdownTimer() {
  const [next, setNext] = useState<{ label: string; diff: number } | null>(null);

  useEffect(() => {
    function tick() {
      setNext(getNextDraw());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!next) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-sm text-slate-400">Next draw ({next.label} ET)</div>
      <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-cyan-300">
        {fmt(next.diff)}
      </div>
    </div>
  );
}
