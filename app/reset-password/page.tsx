"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLogo from "@/components/AppLogo";
import PasswordInput from "@/components/PasswordInput";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error ?? "Failed to reset password."); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-rose-300">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-cyan-300 hover:text-cyan-200 text-sm">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">✅</div>
        <h2 className="text-2xl font-bold">Password updated!</h2>
        <p className="text-slate-300">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-3xl font-bold">Set new password</h2>
      <p className="mb-6 text-slate-300">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">New password</label>
          <PasswordInput id="password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" required />
        </div>

        <div>
          <label htmlFor="confirm" className="mb-2 block text-sm font-medium text-slate-300">Confirm password</label>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} placeholder="Repeat your password" autoComplete="new-password" required />
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-cyan-400 px-4 py-4 font-semibold text-slate-950 transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] disabled:opacity-70"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020b2d] px-6 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-[30px] border border-cyan-400/15 bg-slate-950/55 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="mb-6">
            <AppLogo size={48} showText={false} />
          </div>
          <Suspense fallback={<p className="text-slate-400">Loading...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
