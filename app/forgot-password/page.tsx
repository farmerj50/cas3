"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AppLogo from "@/components/AppLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020b2d] px-6 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="mb-6">
            <AppLogo size={48} showText={false} />
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="text-4xl">📬</div>
              <h2 className="text-2xl font-bold">Check your email</h2>
              <p className="text-slate-300">
                If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox and spam folder.
              </p>
              <Link href="/login" className="mt-4 inline-block text-sm text-cyan-300 hover:text-cyan-200">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-3xl font-bold">Forgot password?</h2>
              <p className="mb-6 text-slate-300">Enter your email and we&apos;ll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">Email</label>
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

                {error && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-cyan-400 px-4 py-4 font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] disabled:opacity-70"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="mt-5 text-sm text-slate-400">
                Remember it?{" "}
                <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
