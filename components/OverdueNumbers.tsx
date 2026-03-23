type OverdueStat = {
  digit: string;
  drawsSince: number;
  lastSeenIndex: number;
};

type StreakStat = {
  digit: string;
  currentStreak: number;
};

type Props = {
  overdueStats: OverdueStat[];
  streakStats: StreakStat[];
  totalDraws: number;
};

export default function OverdueNumbers({ overdueStats, streakStats, totalDraws }: Props) {
  const streakMap = Object.fromEntries(streakStats.map((s) => [s.digit, s.currentStreak]));

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-xl font-semibold text-white">Overdue &amp; streaks</h3>
      <p className="mt-1 text-sm text-slate-300">
        How many draws since each digit last appeared, and current consecutive-draw streaks.
      </p>

      <div className="mt-5 space-y-2">
        {overdueStats.map((item) => {
          const streak = streakMap[item.digit] || 0;
          const pct = Math.min((item.drawsSince / Math.max(totalDraws * 0.15, 1)) * 100, 100);
          const isOverdue = item.drawsSince >= 8;
          const isStreaking = streak >= 3;

          return (
            <div
              key={item.digit}
              className="flex items-center gap-3 rounded-2xl bg-slate-900/80 px-4 py-3"
            >
              <div className="w-8 text-center font-mono text-2xl font-bold text-white">
                {item.digit}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {item.drawsSince === 0
                      ? "Hit last draw"
                      : `${item.drawsSince} draws ago`}
                  </span>
                  {streak > 0 && (
                    <span className="text-cyan-400">{streak} in a row</span>
                  )}
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverdue ? "bg-violet-500" : isStreaking ? "bg-cyan-400" : "bg-slate-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-1">
                {isOverdue && (
                  <span className="rounded-lg bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                    due
                  </span>
                )}
                {isStreaking && (
                  <span className="rounded-lg bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
                    hot
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
