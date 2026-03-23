type Props = {
  pairs: { pair: string; count: number }[];
};

export default function TopPairsCard({ pairs }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-xl font-semibold text-white">Top recurring pairs</h3>
      <p className="mt-1 text-sm text-slate-300">
        Frequently appearing 2-digit relationships from recent draw history.
      </p>

      <div className="mt-5 space-y-3">
        {pairs.slice(0, 8).map((item, index) => (
          <div
            key={`${item.pair}-${index}`}
            className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3"
          >
            <span className="font-mono text-lg tracking-[0.2em] text-cyan-300">
              {item.pair}
            </span>
            <span className="text-sm text-slate-300">{item.count} matches</span>
          </div>
        ))}
      </div>
    </div>
  );
}
