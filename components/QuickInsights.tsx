type DigitStat = { digit: string; count: number; type: "hot" | "cold" | "neutral" };
type StreakStat = { digit: string; currentStreak: number };

type Analytics = {
  digitStats: DigitStat[];
  topPairs: { pair: string; count: number }[];
  streakStats: StreakStat[];
};

export default function QuickInsights({ analytics }: { analytics: Analytics }) {
  const hotDigit = analytics.digitStats.find((d) => d.type === "hot");
  const coldDigit = analytics.digitStats.find((d) => d.type === "cold");
  const bestPair = analytics.topPairs[0];

  const longestStreak = [...analytics.streakStats].sort(
    (a, b) => b.currentStreak - a.currentStreak
  )[0];

  const trendLabel =
    longestStreak && longestStreak.currentStreak >= 3
      ? `${longestStreak.digit} on a ${longestStreak.currentStreak}-draw run ↑`
      : longestStreak && longestStreak.currentStreak >= 2
      ? `${longestStreak.digit} appeared ${longestStreak.currentStreak}x in a row`
      : "No strong streak";

  const insights = [
    {
      label: "Hottest digit",
      value: hotDigit?.digit ?? "—",
      sub: hotDigit ? `${hotDigit.count} appearances` : "",
      color: "text-cyan-300",
      border: "border-cyan-400/20",
    },
    {
      label: "Coldest digit",
      value: coldDigit?.digit ?? "—",
      sub: coldDigit ? `${coldDigit.count} appearances` : "",
      color: "text-violet-300",
      border: "border-violet-400/20",
    },
    {
      label: "Top pair",
      value: bestPair?.pair ?? "—",
      sub: bestPair ? `${bestPair.count} draws` : "",
      color: "text-sky-300",
      border: "border-sky-400/20",
    },
    {
      label: "Active streak",
      value: longestStreak?.digit ?? "—",
      sub: trendLabel,
      color: "text-amber-300",
      border: "border-amber-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {insights.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl border ${item.border} bg-slate-950/60 px-4 py-3 backdrop-blur`}
        >
          <p className="text-xs text-slate-400">{item.label}</p>
          <p className={`mt-1 font-mono text-2xl font-bold ${item.color}`}>{item.value}</p>
          {item.sub && <p className="mt-0.5 text-xs text-slate-500">{item.sub}</p>}
        </div>
      ))}
    </div>
  );
}
