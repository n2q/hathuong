export function SkeletonCard({ buttons = 2 }: { buttons?: number }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-2/5" />
        </div>
        <div className="flex gap-1 shrink-0">
          {Array.from({ length: buttons }).map((_, i) => (
            <div key={i} className="h-9 w-9 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ cells }: { cells: number }) {
  const widths = ["w-28", "w-16", "w-24", "w-32", "w-20", "w-12", "w-8"];
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cells }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className={`h-4 bg-gray-200 rounded ${widths[i % widths.length]}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-7 w-7 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-20 mb-1.5" />
      <div className="h-3 bg-gray-200 rounded w-16" />
    </div>
  );
}
