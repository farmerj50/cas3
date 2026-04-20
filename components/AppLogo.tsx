export default function AppLogo({
  size = 56,
  showText = true,
}: {
  size?: number;
  showText?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-2xl"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-cyan-400 via-sky-500 to-violet-500 shadow-[0_0_40px_rgba(34,211,238,0.35)]" />
        <div className="absolute inset-[1px] rounded-2xl bg-slate-950/90 backdrop-blur-xl" />

        <div className="relative flex items-center justify-center">
          <div className="grid grid-cols-2 gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-cyan-400/20 text-[10px] font-bold text-cyan-300">
              3
            </span>
            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-violet-400/20 text-[10px] font-bold text-violet-300">
              C
            </span>
            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-sky-400/20 text-[10px] font-bold text-sky-300">
              8
            </span>
            <span className="flex h-4 w-4 items-center justify-center rounded-md bg-cyan-400/20 text-[10px] font-bold text-cyan-300">
              3
            </span>
          </div>
        </div>
      </div>

      {showText && (
        <div>
          <div className="text-lg font-semibold tracking-tight text-white">
            Cash 3 Edge
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
            Number Tracker
          </div>
        </div>
      )}
    </div>
  );
}
