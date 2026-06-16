import type { WandoRoute } from "@/lib/types"

interface Props {
  route: WandoRoute
  onClick?: () => void
}

export default function RouteItem({ route, onClick }: Props) {
  const isCancelled = route.status === "cancelled"
  const routeLabel = route.from ? `${route.from} → ${route.to}` : `완도 → ${route.to}`
  const timeLabel = route.from ? "도착 예정" : "출발"

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.99] transition-all cursor-pointer"
    >
      <span className="mt-0.5 text-base leading-none shrink-0">
        {isCancelled ? "🔴" : "🟢"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-900">{routeLabel}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              isCancelled
                ? "bg-red-100 text-red-700"
                : route.status === "unknown"
                  ? "bg-gray-100 text-gray-500"
                  : "bg-green-100 text-green-700"
            }`}
          >
            {isCancelled ? "결항" : route.status === "unknown" ? "운항예정" : "운항"}
          </span>
        </div>

        {route.times.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-xs text-gray-400 mr-1">{timeLabel}</span>
            {route.times.join("  ·  ")}
          </p>
        )}

        {route.operator && (
          <p className="mt-0.5 text-xs text-gray-400">{route.operator}</p>
        )}
      </div>
      <span className="mt-1 text-gray-300 text-sm shrink-0">›</span>
    </button>
  )
}
