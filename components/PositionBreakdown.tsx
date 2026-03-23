"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type PositionStat = {
  position: 0 | 1 | 2;
  label: string;
  counts: { digit: string; count: number }[];
};

type Props = {
  data: PositionStat[];
};

const COLORS = ["#22d3ee", "#a78bfa", "#34d399"];

export default function PositionBreakdown({ data }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-xl font-semibold text-white">Digit frequency by position</h3>
      <p className="mt-1 text-sm text-slate-300">
        Each column shows which digits hit most often in that position — patterns here are different from overall frequency.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {data.map((pos) => (
          <div key={pos.position}>
            <div className="mb-3 text-sm font-medium text-slate-400">{pos.label}</div>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pos.counts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="digit" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pos.counts.map((entry) => {
                      const max = Math.max(...pos.counts.map((c) => c.count));
                      const isHot = entry.count === max;
                      return (
                        <Cell
                          key={entry.digit}
                          fill={isHot ? COLORS[pos.position] : "#1e293b"}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
