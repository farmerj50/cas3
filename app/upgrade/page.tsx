import Link from "next/link";
import AppLogo from "@/components/AppLogo";
import UpgradeButton from "@/components/UpgradeButton";
import PassButton from "@/components/PassButton";

const FEATURES = [
  { free: "Top 10 picks per algorithm", premium: "Full ranked list — all 60+ plays" },
  { free: "Basic analytics",            premium: "Elite Picks with confidence scores" },
  { free: "Pick history (20 saves)",    premium: "Unlimited pick history" },
  { free: "Hot / cold digit chart",     premium: "Full performance insights & hit rate" },
  { free: "3 algorithms",               premium: "Advanced algorithm filters" },
  { free: "—",                          premium: "Daily premium strategy insight" },
];

export default function UpgradePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b2d] text-white">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-16">

        {/* Nav */}
        <div className="mb-12 flex items-center justify-between">
          <AppLogo size={48} />
          <Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-white">
            ← Back to dashboard
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300/80">
            Cash 3 Edge Premium
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight">
            Stop playing guesses.
            <span className="block bg-linear-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Start playing with edge.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-slate-300">
            Unlock the full reduction engine, elite picks, and performance tracking
            built for players who take this seriously.
          </p>
        </div>

        {/* — Day / Week Passes — */}
        <div className="mt-14">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Try it first
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 1-Day Pass */}
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 p-7">
              <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                One-time
              </div>
              <p className="text-sm text-slate-400">1-Day Pass</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$0.99</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Full premium access for 24 hours</p>
              <PassButton
                passType="1day"
                label="Get 1-Day Pass — $0.99"
                className="mt-5 w-full rounded-2xl border border-white/15 bg-white/8 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-70"
              />
            </div>

            {/* 7-Day Pass */}
            <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-slate-950/60 p-7 shadow-[0_0_30px_rgba(34,211,238,0.07)]">
              <div className="absolute right-5 top-5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                Best value pass
              </div>
              <p className="text-sm text-slate-400">7-Day Pass</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$2.99</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Full premium access for 7 days · ~$0.43/day</p>
              <PassButton
                passType="7day"
                label="Get 7-Day Pass — $2.99"
                className="mt-5 w-full rounded-2xl bg-linear-to-r from-cyan-400 via-sky-400 to-cyan-300 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70"
              />
            </div>
          </div>
        </div>

        {/* — Subscriptions — */}
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Full Premium
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Monthly */}
            <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/30 bg-slate-950/70 p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative">
                <p className="text-sm text-slate-400">Monthly</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">$4.99</span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Billed monthly · cancel anytime</p>
                <UpgradeButton
                  label="Get Premium Monthly"
                  className="mt-6 w-full rounded-2xl bg-linear-to-r from-cyan-400 via-sky-400 to-cyan-300 py-3.5 font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(34,211,238,0.4)] disabled:opacity-70"
                />
              </div>
            </div>

            {/* Annual */}
            <div className="relative overflow-hidden rounded-[28px] border border-violet-400/30 bg-slate-950/70 p-8">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />
              <div className="absolute right-6 top-6 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
                Save 67%
              </div>
              <div className="relative">
                <p className="text-sm text-slate-400">Annual</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">$19.99</span>
                  <span className="text-slate-400">/yr</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">$1.67/mo billed annually</p>
                <UpgradeButton
                  label="Get Premium Annual"
                  plan="annual"
                  className="mt-6 w-full rounded-2xl border border-violet-400/30 bg-violet-500/10 py-3.5 font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-70"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="mt-14">
          <h2 className="text-xl font-bold">Free vs Premium</h2>
          <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-white/10 bg-slate-900/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span>Feature</span>
              <span>Free</span>
              <span className="text-cyan-300">Premium</span>
            </div>
            {FEATURES.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1fr_1fr_1fr] px-5 py-4 text-sm ${i % 2 === 0 ? "bg-white/2" : ""}`}
              >
                <span className="text-slate-300">{row.free}</span>
                <span className="text-slate-500">{row.free === "—" ? "—" : "✓"}</span>
                <span className="font-medium text-cyan-300">{row.premium}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-3xl border border-white/10 bg-linear-to-br from-cyan-500/10 to-violet-500/10 p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to play with an edge?</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-300">
            Start with a $0.99 day pass or go full premium. Your picks and history stay no matter what.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <PassButton
              passType="1day"
              label="Try 1 Day — $0.99"
              className="rounded-2xl border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-70"
            />
            <UpgradeButton label="Go Premium — $4.99/mo" />
          </div>
        </div>

      </div>
    </main>
  );
}
