export function SkeletonLine({ width = "w-full", height = "h-4" }) {
  return <div className={`${width} ${height} bg-navy/5 rounded-full animate-pulse`} />;
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5 space-y-3 animate-pulse">
      <SkeletonLine width="w-2/3" height="h-5" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} width={i % 2 === 0 ? "w-full" : "w-3/4"} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
      <div className="bg-[#faf8f3] px-5 py-3">
        <SkeletonLine width="w-1/4" height="h-3" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-t border-navy/5 grid gap-4 animate-pulse"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} width="w-full" height="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }) {
  return (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-${count} gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5 animate-pulse">
          <div className="w-11 h-11 bg-navy/5 rounded-xl2 mb-4" />
          <SkeletonLine width="w-1/2" height="h-7" />
          <div className="mt-2">
            <SkeletonLine width="w-2/3" height="h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}