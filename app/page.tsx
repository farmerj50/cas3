import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          Cash 3 analytics MVP
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              A smarter way to choose
              <span className="block bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                Cash 3 numbers
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Clean login, user tracking, hot and cold digits, top pairs,
              weighted recommendations, and saved picks in one polished dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="grid gap-4 md:grid-cols-3">
              {["408", "551", "120"].map((pick) => (
                <div
                  key={pick}
                  className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-6 text-center"
                >
                  <div className="text-sm text-slate-400">Recommended</div>
                  <div className="mt-2 text-4xl font-bold tracking-[0.25em] text-cyan-300">
                    {pick}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-900 p-5">
                <div className="text-sm text-slate-400">Exact order odds</div>
                <div className="mt-2 text-2xl font-semibold">1 in 1,000</div>
              </div>
              <div className="rounded-2xl bg-slate-900 p-5">
                <div className="text-sm text-slate-400">Any order estimate</div>
                <div className="mt-2 text-2xl font-semibold">1 in 167</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
