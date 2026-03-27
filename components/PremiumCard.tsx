import UpgradeButton from "@/components/UpgradeButton";

export default function PremiumCard() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-linear-to-br from-cyan-400/10 via-slate-950 to-violet-500/10 p-6 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-1/3 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-300/80">
          Cash 3 Edge Premium
        </p>
        <h3 className="mt-1 text-xl font-bold text-white">
          Play with a real edge
        </h3>

        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {[
            "Full ranked list — all 60+ strategic plays",
            "Elite Picks with confidence scores",
            "Performance insights & hit rate tracking",
            "Advanced algorithm filters",
            "Daily premium strategy insight",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-cyan-400">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <UpgradeButton label="Upgrade — $4.99/mo" />
          <UpgradeButton
            plan="annual"
            label="or $19.99/year →"
            className="text-sm text-slate-400 transition hover:text-cyan-300 disabled:opacity-50"
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Cancel anytime · No commitment
        </p>
      </div>
    </div>
  );
}
