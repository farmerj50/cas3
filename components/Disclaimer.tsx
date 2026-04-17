export default function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-xs text-slate-500 leading-relaxed ${className}`}>
      Cash 3 Edge is an independent analytics tool. Not affiliated with any government
      entity, lottery organization, or official lottery provider. All data is
      user-provided or publicly available and for informational and entertainment
      purposes only.
    </p>
  );
}
