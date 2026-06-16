import type { WandoRoute } from "@/lib/types"

export default function RouteItem({ route }: { route: WandoRoute }) {
  const isCancelled = route.status === "cancelled"

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
      <span className="mt-0.5 text-base leading-none">{isCancelled ? "🔴" : "🟢"}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-900">완도 → {route.to}</span>
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
          <p className="mt-1 text-sm text-gray-500">{route.times.join("  ·  ")}</p>
        )}

        {route.operator && (
          <p className="mt-0.5 text-xs text-gray-400">{route.operator}</p>
        )}
      </div>
    </div>
  )
}
