import type { Ferry } from "@/lib/types"
import StatusBadge from "./StatusBadge"
import CapacityBar from "./CapacityBar"

export default function FerryCard({
  ferry,
  mode = "depart",
  onClick,
}: {
  ferry: Ferry
  mode?: "depart" | "arrive"
  onClick?: () => void
}) {
  const isCancelled = ferry.status === "cancelled"
  const isDeparted = ferry.status === "departed"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={`rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer ${
        isCancelled ? "border-red-200 bg-red-50/50 opacity-70" :
        isDeparted  ? "border-gray-200 bg-gray-50/50 opacity-60" :
                      "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400">{ferry.id} · {ferry.platform} 승강장</p>
          <h2 className="mt-0.5 truncate text-lg font-bold text-gray-900">{ferry.name}</h2>
        </div>
        <StatusBadge status={ferry.status} />
      </div>

      {mode === "arrive" ? (
        <div className="mt-4">
          <p className="text-3xl font-bold tabular-nums text-gray-900">{ferry.departure}</p>
          <p className="mt-1 text-sm font-semibold text-gray-600">{ferry.route.from} 출발</p>
          <p className="mt-2 text-xs text-gray-400">{ferry.route.to} 도착 예정 {ferry.arrival}</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3 text-center">
          <div className="flex-1">
            <p className="text-2xl font-bold tabular-nums text-gray-900">{ferry.departure}</p>
            <p className="mt-0.5 text-sm font-medium text-gray-600">{ferry.route.from}</p>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold tabular-nums text-gray-900">{ferry.arrival}</p>
            <p className="mt-0.5 text-sm font-medium text-gray-600">{ferry.route.to}</p>
          </div>
        </div>
      )}

      {!isCancelled && (
        <div className="mt-4">
          <CapacityBar boarded={ferry.boarded} capacity={ferry.capacity} />
        </div>
      )}
    </div>
  )
}
