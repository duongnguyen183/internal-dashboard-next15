export default function LoadingOrders() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-7 w-40 rounded bg-slate-200/70" />
        <div className="mt-2 h-4 w-72 rounded bg-slate-200/60" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
        <div className="h-10 w-full rounded bg-slate-200/60" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-full rounded bg-slate-200/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
