"use client";

import { useEffect, useState, useCallback } from "react";
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

type User = {
  id: string;
  email: string;
  picks: {
    id: string;
    numbers: string;
    score: number;
    algorithm: string;
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  const [days, setDays] = useState("all");
  const [drawRefresh, setDrawRefresh] = useState(0);

  const loadAnalytics = useCallback(async (p: string, d: string) => {
    try {
      const res = await fetch(`/api/analytics?period=${p}&days=${d}`, { cache: "no-store" });
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
      return false;
    }
    const data = await res.json();
    setUser(data.user);
    return true;
  }, [router]);

  async function init() {
    const ok = await loadUser();
    if (!ok) return;
    await loadAnalytics("all", "all");
    setLoading(false);
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!loading) loadAnalytics(period, days);
  }, [period, days, loading]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function onDrawAdded() {
    setDrawRefresh((n) => n + 1);
    loadAnalytics(period, days);
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slate-400">Logged in as</div>
            <h1 className="text-3xl font-bold">{user?.email}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Exact order odds</div>
            <div className="mt-2 text-xl font-semibold">{analytics?.exactOrderProbability}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Box bet odds</div>
            <div className="mt-2 text-xl font-semibold">{analytics?.anyOrderProbability}</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Saved picks</div>
            <div className="mt-2 text-2xl font-semibold">
              {user?.picks.length || 0}
              {checked > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {hits}/{checked} hit
                </span>
              )}
            </div>
          </div>
          <CountdownTimer />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-400">Filter analytics:</span>
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
          <span className="text-slate-600">|</span>
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
              {analytics.usingRealData
                ? `${analytics.totalDraws} real draws`
                : "Using sample data"}
            </span>
          )}
        </div>

        {/* Pick generator */}
        {analytics && (
          <PickGenerator picks={analytics.recommendedPicks} onSaved={() => loadUser()} />
        )}

        {/* Advanced pick system */}
        <AdvancedPickSystem onSaved={() => loadUser()} />

        {/* Hot/cold + top pairs */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Hot and cold digits</h3>
            <p className="mt-1 text-sm text-slate-300">
              Cyan = hot, violet = cold.
            </p>
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

        {/* Add draw + history */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DrawEntryForm onDrawAdded={onDrawAdded} />
          <DrawHistoryTable refresh={drawRefresh} />
        </div>

        {/* Saved picks */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold">Saved picks</h3>
          <p className="mt-1 text-sm text-slate-300">
            Enter draw results above to automatically check these for hits.
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
                      : "bg-slate-900/80"
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
                  <div className="mt-2 text-sm text-slate-400">Score: {pick.score}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(pick.createdAt).toLocaleString()}
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
