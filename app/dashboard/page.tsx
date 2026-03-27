"use client";

import { useEffect, useState, useCallback } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useRouter } from "next/navigation";
import HotColdChart from "@/components/HotColdChart";
import PickGenerator from "@/components/PickGenerator";
import TopPairsCard from "@/components/TopPairsCard";
import PositionBreakdown from "@/components/PositionBreakdown";
import OverdueNumbers from "@/components/OverdueNumbers";
import SumChart from "@/components/SumChart";
import DrawEntryForm from "@/components/DrawEntryForm";
import DrawHistoryTable from "@/components/DrawHistoryTable";
import CountdownTimer from "@/components/CountdownTimer";
import AdvancedPickSystem from "@/components/AdvancedPickSystem";
import TodaysEdge from "@/components/TodaysEdge";
import QuickInsights from "@/components/QuickInsights";
import LastResult from "@/components/LastResult";
import ElitePicks from "@/components/ElitePicks";
import PerformanceInsights from "@/components/PerformanceInsights";
import PremiumCard from "@/components/PremiumCard";
import ManageBillingButton from "@/components/ManageBillingButton";
import StateSelector from "@/components/StateSelector";
import { getStateMeta } from "@/lib/states";
import { isUserPremium, getPassTimeLeft } from "@/lib/premium";
import BulkImportForm from "@/components/BulkImportForm";
import AutoFetchButton from "@/components/AutoFetchButton";

type User = {
  id: string;
  email: string;
  tier: string;
  state: string;
  subscriptionStatus: string | null;
  premiumExpiresAt: string | null;
  picks: {
    id: string;
    numbers: string;
    score: number;
    algorithm: string;
    playType: string;
    intendedDate: string | null;
    intendedPeriod: string | null;
    createdAt: string;
    isHit: boolean | null;
    drawResult: string | null;
  }[];
};

type Analytics = {
  digitStats: { digit: string; count: number; type: "hot" | "cold" | "neutral" }[];
  positionStats: {
    position: 0 | 1 | 2;
    label: string;
    counts: { digit: string; count: number }[];
  }[];
  topPairs: { pair: string; count: number }[];
  overdueStats: { digit: string; drawsSince: number; lastSeenIndex: number }[];
  streakStats: { digit: string; currentStreak: number }[];
  sumStats: { sum: number; count: number }[];
  recommendedPicks: { numbers: string; score: number; reason: string; tier: "top" | "mid" | "low" }[];
  exactOrderProbability: string;
  anyOrderProbability: string;
  totalDraws: number;
  usingRealData: boolean;
};

const [PERIOD_OPTIONS, DAYS_OPTIONS] = [
  [
    { value: "all", label: "All periods" },
    { value: "midday", label: "Midday only" },
    { value: "evening", label: "Evening only" },
  ],
  [
    { value: "all", label: "All time" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
  ],
];

export default function DashboardPage() {
  usePushNotifications();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [days, setDays] = useState("all");
  const [state, setState] = useState("GA");
  const [drawRefresh, setDrawRefresh] = useState(0);
  const [drawTab, setDrawTab] = useState<"auto" | "bulk" | "single">("auto");

  const loadAnalytics = useCallback(async (p: string, d: string, s: string) => {
    try {
      const res = await fetch(`/api/analytics?period=${p}&days=${d}&state=${s}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Analytics;
      setAnalytics(data);
    } catch {
      // ignore — stale client or network error
    }
  }, []);

  const loadUser = useCallback(async () => {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (!res.ok) {
      router.push("/login");
      return null;
    }
    const data = await res.json();
    setUser(data.user);
    return data.user;
  }, [router]);

  async function init() {
    const u = await loadUser();
    if (!u) return;
    const userState = u.state ?? "GA";
    setState(userState);
    await loadAnalytics("all", "all", userState);
    setLoading(false);
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!loading) loadAnalytics(period, days, state);
  }, [period, days, state, loading]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function onDrawAdded() {
    setDrawRefresh((n) => n + 1);
    loadAnalytics(period, days, state);
    loadUser();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl animate-pulse text-slate-400">Loading dashboard...</div>
      </main>
    );
  }

  const hits = user?.picks.filter((p) => p.isHit === true).length || 0;
  const checked = user?.picks.filter((p) => p.isHit !== null).length || 0;
  const isPremium = user ? isUserPremium(user) : false;
  const passTimeLeft = user ? getPassTimeLeft(user) : null;

  return (
    <main className="min-h-screen bg-[#020b2d] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
              {getStateMeta(state)?.name} · {getStateMeta(state)?.game}
            </div>
            <h1 className="text-2xl font-bold text-white">{user?.email}</h1>
          </div>
          <div className="flex items-center gap-3">
            <StateSelector
              current={state}
              onChange={(code) => setState(code)}
            />
            <CountdownTimer />
            {passTimeLeft && (
              <span className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                passTimeLeft.urgent
                  ? "border-red-400/30 bg-red-400/10 text-red-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-300"
              }`}>
                Pass · {passTimeLeft.label}
              </span>
            )}
            {isPremium && user?.tier === "premium" && <ManageBillingButton />}
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>

        {/* TODAY'S EDGE — hero */}
        {analytics && <TodaysEdge analytics={analytics} />}

        {/* QUICK INSIGHTS strip */}
        {analytics && <QuickInsights analytics={analytics} />}

        {/* ELITE PICKS — premium teaser */}
        {analytics && (
          <ElitePicks picks={analytics.recommendedPicks} isPremium={isPremium} />
        )}

        {/* Demo data warning */}
        {analytics && !analytics.usingRealData && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
            <span className="mt-0.5 text-lg">⚠</span>
            <div>
              <span className="font-semibold text-amber-300">Demo analytics active</span>
              <span className="ml-2 text-sm text-amber-200/70">
                Charts and recommendations are based on sample data.
                Enter 20+ draws below to unlock your state&apos;s real patterns.
              </span>
            </div>
          </div>
        )}

        {/* Stats + filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
            <span className="text-xs text-slate-400">Straight odds</span>
            <span className="font-semibold text-white">{analytics?.exactOrderProbability}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
            <span className="text-xs text-slate-400">Box odds</span>
            <span className="font-semibold text-white">{analytics?.anyOrderProbability}</span>
          </div>
          {checked > 0 && (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
              <span className="text-xs text-slate-400">Hit rate</span>
              <span className="font-semibold text-cyan-300">{hits}/{checked}</span>
            </div>
          )}

          <span className="text-slate-700">|</span>

          {PERIOD_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setPeriod(o.value)}
              className={`rounded-xl px-3 py-1.5 text-sm transition ${
                period === o.value
                  ? "bg-cyan-400 text-slate-950 font-semibold"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {o.label}
            </button>
          ))}
          <span className="text-slate-700">|</span>
          {DAYS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setDays(o.value)}
              className={`rounded-xl px-3 py-1.5 text-sm transition ${
                days === o.value
                  ? "bg-cyan-400 text-slate-950 font-semibold"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {o.label}
            </button>
          ))}
          {analytics && (
            <span className="ml-auto text-xs text-slate-500">
              {analytics.usingRealData ? `${analytics.totalDraws} real draws` : "sample data"}
            </span>
          )}
        </div>

        {/* ADVANCED PICK SYSTEM — reduction engine first */}
        <AdvancedPickSystem onSaved={() => loadUser()} isPremium={isPremium} state={state} drawRefresh={drawRefresh} />

        {/* PICK GENERATOR — quick picks */}
        {analytics && (
          <PickGenerator
            picks={analytics.recommendedPicks}
            onSaved={() => loadUser()}
            isPremium={isPremium}
          />
        )}

        {/* ANALYTICS — hot/cold + top pairs */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Hot and cold digits</h3>
            <p className="mt-1 text-sm text-slate-300">Cyan = hot, violet = cold.</p>
            <div className="mt-6">
              {analytics && <HotColdChart data={analytics.digitStats} />}
            </div>
          </div>
          <div>{analytics && <TopPairsCard pairs={analytics.topPairs} />}</div>
        </div>

        {/* Position breakdown */}
        {analytics && <PositionBreakdown data={analytics.positionStats} />}

        {/* Overdue + sum distribution */}
        <div className="grid gap-6 lg:grid-cols-2">
          {analytics && (
            <OverdueNumbers
              overdueStats={analytics.overdueStats}
              streakStats={analytics.streakStats}
              totalDraws={analytics.totalDraws}
            />
          )}
          {analytics && <SumChart data={analytics.sumStats} />}
        </div>

        {/* HISTORY / PERFORMANCE */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {/* Tab switcher */}
            <div className="flex gap-1 rounded-2xl border border-white/10 bg-slate-900/60 p-1">
              {(["auto", "bulk", "single"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDrawTab(tab)}
                  className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
                    drawTab === tab
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "auto" ? "Auto-Sync" : tab === "bulk" ? "Bulk Import" : "Add Single"}
                </button>
              ))}
            </div>
            {drawTab === "auto" ? (
              <AutoFetchButton state={state} onImported={onDrawAdded} />
            ) : drawTab === "bulk" ? (
              <BulkImportForm state={state} onImported={onDrawAdded} />
            ) : (
              <DrawEntryForm onDrawAdded={onDrawAdded} state={state} />
            )}
          </div>
          <div className="space-y-4">
            <LastResult picks={user?.picks ?? []} />
            <DrawHistoryTable
              refresh={drawRefresh}
              state={state}
              onCleared={() => loadAnalytics(period, days, state)}
            />
          </div>
        </div>

        {/* PERFORMANCE INSIGHTS */}
        {analytics && (
          <PerformanceInsights
            picks={user?.picks ?? []}
            sumStats={analytics.sumStats}
            isPremium={isPremium}
          />
        )}

        {/* UPGRADE CARD — free users only */}
        {user && !isPremium && <PremiumCard />}

        {/* SAVED PICKS */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Saved picks</h3>
            {user?.picks.length ? (
              <span className="text-sm text-slate-400">
                {user.picks.length} total
                {checked > 0 && ` · ${hits}/${checked} hit`}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Enter draw results above to automatically check for hits.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {user?.picks?.length ? (
              user.picks.map((pick) => (
                <div
                  key={pick.id}
                  className={`rounded-2xl p-4 ${
                    pick.isHit === true
                      ? "border border-cyan-400/40 bg-cyan-500/10"
                      : pick.isHit === false
                      ? "border border-red-500/20 bg-red-500/5"
                      : "border border-white/8 bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-2xl tracking-[0.25em] text-cyan-300">
                      {pick.numbers}
                    </div>
                    {pick.isHit === true && (
                      <span className="rounded-lg bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-300">
                        HIT
                      </span>
                    )}
                    {pick.isHit === false && (
                      <span className="rounded-lg bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                        {pick.drawResult && pick.numbers !== pick.drawResult
                          ? `drew ${pick.drawResult}`
                          : "miss"}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    <span>Score: {pick.score}</span>
                    <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-xs">
                      {pick.playType}
                    </span>
                    {pick.intendedPeriod && (
                      <span className="text-xs text-slate-500">{pick.intendedPeriod}</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {pick.intendedDate ?? new Date(pick.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400">No saved picks yet.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
