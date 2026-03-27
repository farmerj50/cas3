"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLogo from "@/components/AppLogo";

export default function BillingSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const isPass = params.get("type") === "pass";
  const passDays = params.get("days") || "1";

  const [ready, setReady] = useState(false);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          if (!user) { clearInterval(interval); return; }

          const isPremiumSub = user.tier === "premium";
          const isPassActive = user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date();

          if (isPass ? isPassActive : isPremiumSub) {
            setReady(true);
            clearInterval(interval);
            return;
          }
        }
      } catch { /* ignore */ }
      if (attempts >= 15) {
        setReady(true);
        clearInterval(interval);
      }
    }, 1000);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);

    return () => { clearInterval(interval); clearInterval(dotInterval); };
  }, [isPass]);

  const title = isPass ? `${passDays}-Day Pass Active` : "You're Premium";
  const subtitle = isPass
    ? `You have full premium access for the next ${passDays === "1" ? "24 hours" : `${passDays} days`}. Enjoy the edge.`
    : "Elite Picks, full ranked lists, and performance insights are now unlocked.";
  const activatingText = isPass ? "Activating Pass" : "Activating Premium";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b2d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <AppLogo size={64} />

        {!ready ? (
          <>
            <div className="mt-8 h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/30 border-t-cyan-400" />
            <h1 className="mt-6 text-3xl font-bold">{activatingText}{dots}</h1>
            <p className="mt-3 text-slate-400">Confirming your payment and unlocking access.</p>
          </>
        ) : (
          <>
            <div className="mt-8 text-6xl" style={{ textShadow: "0 0 40px rgba(34,211,238,0.6)" }}>
              ✓
            </div>
            <h1 className="mt-4 text-4xl font-bold text-white">{title}</h1>
            <p className="mt-3 max-w-md text-lg text-slate-300">{subtitle}</p>

            {isPass && (
              <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-3 text-sm text-amber-300">
                Tip: upgrade to a monthly plan anytime to never lose access.
              </div>
            )}

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-8 rounded-2xl bg-linear-to-r from-cyan-400 via-sky-400 to-cyan-300 px-8 py-3.5 font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              Go to Dashboard →
            </button>
          </>
        )}
      </div>
    </main>
  );
}
