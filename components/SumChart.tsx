"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

type SumStat = {
  sum: number;
  count: number;
};

type Props = {
  data: SumStat[];
};

export default function SumChart({ data }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const peak = data.find((d) => d.count === maxCount);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-xl font-semibold text-white">Sum distribution</h3>
      <p className="mt-1 text-sm text-slate-300">
        Frequency of each possible 3-digit sum (0–27). Sums near 13–14 are most common by probability.
        {peak && (
          <span className="ml-1 text-cyan-300">
            Hottest sum: {peak.sum} ({peak.count}×)
          </span>
        )}
      </p>

      <div className="mt-6" style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="sum"
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              interval={1}
            />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
              formatter={(v) => [`${v} draws`, "Count"]}
              labelFormatter={(l) => `Sum: ${l}`}
            />
            <ReferenceLine x={13} stroke="#475569" strokeDasharray="3 3" />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.sum}
                  fill={entry.count === maxCount ? "#f59e0b" : "#1e3a5f"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
