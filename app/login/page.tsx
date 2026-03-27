"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLogo from "@/components/AppLogo";
import LoginPreview from "@/components/LoginPreview";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Unable to log in. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b2d] text-white">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:px-10">

        {/* Left — product pitch + preview */}
        <section className="hidden lg:block">
          <div className="mb-8">
            <AppLogo size={64} />

            <div className="mt-8 max-w-xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-cyan-300/85">
                Daily Cash 3 Intelligence
              </p>
              <h1 className="text-5xl font-bold leading-tight tracking-tight">
                Sharpen your edge with smarter picks and real pattern insight.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
                Track trends, save strategies, review draw history, and generate
                ranked plays with a dashboard built to feel fast, modern, and
                addictive.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Smart Picks", "Reduction Funnel", "Draw Tracking", "Saved Plays"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <LoginPreview />
        </section>

        {/* Right — login card */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[30px] border border-cyan-400/15 bg-slate-950/55 bg-linear-to-br from-white/[0.03] to-transparent p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition hover:border-cyan-400/25 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <AppLogo size={48} showText={false} />
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                Secure Login
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-4xl font-bold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-base text-slate-300">
                Log in to access your Cash 3 Edge dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-linear-to-r from-cyan-400 via-sky-400 to-cyan-300 px-4 py-4 text-base font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative z-10">
                  {loading ? "Logging in..." : "Enter Dashboard"}
                </span>
                <span className="absolute inset-0 translate-y-full bg-white/15 transition duration-300 group-hover:translate-y-0" />
              </button>
            </form>

            {/* Trust strip */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <span>🔒 Encrypted</span>
              <span className="text-slate-700">·</span>
              <span>Private</span>
              <span className="text-slate-700">·</span>
              <span>Your data only</span>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-400">
                Need an account?{" "}
                <Link href="/register" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                  Create one here
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs uppercase tracking-[0.22em] text-slate-500 lg:hidden">
            Smart picks · Ranked plays · Cleaner strategy
          </div>
        </section>

      </div>
    </main>
  );
}
