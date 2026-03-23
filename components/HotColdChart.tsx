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

type Props = {
  data: { digit: string; count: number; type: "hot" | "cold" | "neutral" }[];
};

export default function HotColdChart({ data }: Props) {
  function getFill(type: "hot" | "cold" | "neutral") {
    if (type === "hot") return "#22d3ee";
    if (type === "cold") return "#8b5cf6";
    return "#64748b";
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="digit" stroke="#cbd5e1" />
          <YAxis stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              color: "#fff",
            }}
          />
          <Bar dataKey="count" radius={[10, 10, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.digit} fill={getFill(entry.type)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
