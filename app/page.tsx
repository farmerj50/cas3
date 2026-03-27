import Link from "next/link";

const FUNNEL_STEPS = [
  { label: "All combinations", count: "1,000", pct: 100, color: "bg-slate-700" },
  { label: "Hot-digit filter", count: "343", pct: 34, color: "bg-violet-500" },
  { label: "Sum-range filter", count: "127", pct: 13, color: "bg-cyan-600" },
  { label: "Odd/even balance", count: "91", pct: 9, color: "bg-cyan-400" },
  { label: "Top ranked plays", count: "60", pct: 6, color: "bg-cyan-300" },
];

const ALGORITHMS = [
  {
    name: "Combined Reduction",
    tag: "~60 plays",
    desc: "4-filter mathematical funnel. Narrows 1,000 combinations using digit frequency, sum concentration, and balance rules.",
    color: "border-cyan-400/30",
    badge: "bg-cyan-500/10 text-cyan-300",
  },
  {
    name: "Hot Digit Wheel",
    tag: "56–84 plays",
    desc: "Select 6–8 key digits and generate every possible box combination from those digits only.",
    color: "border-violet-400/30",
    badge: "bg-violet-500/10 text-violet-300",
  },
  {
    name: "Rundown System",
    tag: "seed-based",
    desc: "Enter last draw. Derives candidates via +1, +2, +123, +132, mirror, and mirror-rundown patterns.",
    color: "border-amber-400/30",
    badge: "bg-amber-500/10 text-amber-300",
  },
];

const SAMPLE_PICKS = [
  { numbers: "820", score: 42.0, tier: "top" },
  { numbers: "208", score: 39.5, tier: "top" },
  { numbers: "802", score: 39.5, tier: "top" },
  { numbers: "280", score: 38.0, tier: "mid" },
  { numbers: "082", score: 37.5, tier: "mid" },
  { numbers: "028", score: 36.0, tier: "mid" },
];

const TIER_BADGE = {
  top: "border-cyan-400/40 text-cyan-300",
  mid: "border-amber-400/30 text-amber-300",
};

const FEATURES = [
  { icon: "📊", title: "Hot & cold digits", desc: "See which digits have been running hot by position, overall frequency, and current streak." },
  { icon: "🔁", title: "Overdue tracker", desc: "Know which digits haven't appeared in the longest time — and which are on active runs." },
  { icon: "∑", title: "Sum distribution", desc: "Identify the most common digit sums in your draw history and focus plays there." },
  { icon: "🎯", title: "Saved picks + hit tracking", desc: "Save your picks, enter real results, and get automatic hit/miss tracking per play type." },
  { icon: "📅", title: "Midday / evening filter", desc: "Separate analytics for each draw period — because midday and evening patterns differ." },
  { icon: "🔒", title: "Account-based history", desc: "All your picks, draws, and results are saved to your account — not just your browser." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-20">

        {/* Hero */}
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          3 mathematical systems · hit tracking · real draw analytics
        </div>

        <div className="grid items-start gap-16 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              Pick-3 analytics built
              <span className="block bg-linear-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                for serious players
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-300">
              Most apps give you random numbers. This one gives you a mathematical reduction engine
              that narrows 1,000 combinations to 60 strategic plays — the same approach used by
              professional Pick-3 players.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-slate-400">
              {[
                "Track real draw history and see your state's actual patterns",
                "Hot/cold digits, position breakdown, pair frequency, sum distribution",
                "Saved picks with straight / box / combo play-type tracking",
                "Automatic hit checking when you enter draw results",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-cyan-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.02]">
                Create free account
              </Link>
              <Link href="/login" className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Login
              </Link>
            </div>
          </div>

          {/* Reduction funnel preview */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-4 text-sm font-medium text-slate-300">
              How the reduction funnel works
            </div>
            <div className="space-y-3">
              {FUNNEL_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 text-center text-xs text-slate-500">{i + 1}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{step.label}</span>
                      <span className="font-mono font-bold text-white">{step.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${step.color}`} style={{ width: `${step.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-slate-900 px-4 py-3">
              <span className="text-sm text-slate-300">Result</span>
              <span className="font-semibold text-cyan-300">1,000 → 60 strategic plays</span>
            </div>
          </div>
        </div>

        {/* 3 algorithms */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold">3 systems in one app</h2>
          <p className="mt-2 text-slate-400">
            Run all three independently and compare results, or stack them against each other.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {ALGORITHMS.map((a) => (
              <div key={a.name} className={`rounded-3xl border ${a.color} bg-white/5 p-6`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-white">{a.name}</h3>
                  <span className={`rounded-lg px-2 py-0.5 text-xs ${a.badge}`}>{a.tag}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sample ranked picks */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold">Ranked picks, not random numbers</h2>
          <p className="mt-2 text-slate-400">
            Every pick is scored by composite digit frequency, pair strength, and diversity.
            Tier badges show you which plays are strongest at a glance.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_PICKS.map((pick) => (
              <div
                key={pick.numbers}
                className={`rounded-2xl border bg-slate-900/80 p-4 ${
                  pick.tier === "top" ? "border-cyan-400/30" : "border-amber-400/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-bold tracking-[0.2em] text-white">
                    {pick.numbers}
                  </span>
                  <span className={`rounded-lg border px-2 py-0.5 text-xs ${TIER_BADGE[pick.tier as keyof typeof TIER_BADGE]}`}>
                    {pick.tier}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-400">Score: {pick.score}</div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-linear-to-r from-cyan-500 to-violet-500" style={{ width: `${(pick.score / 45) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-500">Sample data for illustration — your dashboard uses your state's real draw history.</p>
        </div>

        {/* Feature grid */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold">Everything in the dashboard</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 rounded-3xl border border-white/10 bg-linear-to-br from-cyan-500/10 to-violet-500/10 p-12 text-center">
          <h2 className="text-3xl font-bold">Start tracking smarter</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Free account. Enter your state's draws. See real patterns. Use the reduction engine to build a play list you can actually stand behind.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="rounded-2xl bg-cyan-400 px-8 py-3 font-semibold text-slate-950 transition hover:scale-[1.02]">
              Create free account
            </Link>
            <Link href="/login" className="rounded-2xl border border-white/20 bg-white/5 px-8 py-3 font-semibold text-white transition hover:bg-white/10">
              Login
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
