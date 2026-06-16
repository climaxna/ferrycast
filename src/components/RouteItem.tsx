import type { WandoRoute } from "@/lib/types"

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function relativeTime(t: string, nowMin: number): string {
  const diff = toMinutes(t) - nowMin
  if (diff <= 0) return ""
  if (diff < 60) return `${diff}분 후`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}시간 ${m}분 후` : `${h}시간 후`
}

interface Props {
  route: WandoRoute
  nowMinutes?: number
  onClick?: () => void
}

export default function RouteItem({ route, nowMinutes = 0, onClick }: Props) {
  const isCancelled = route.status === "cancelled"
  const routeLabel = route.from ? `${route.from} → ${route.to}` : `완도 → ${route.to}`
  const timeLabel = route.from ? `${route.from} 출발` : "출발"

  const nextIdx = route.times.findIndex((t) => toMinutes(t) > nowMinutes)
  const nextTime = nextIdx >= 0 ? route.times[nextIdx] : null
  const pastTimes = route.times.slice(0, nextIdx === -1 ? route.times.length : nextIdx)
  const futureTimes = nextIdx >= 0 ? route.times.slice(nextIdx + 1) : []

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
        {/* 항로명 + 상태 배지 */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-900">{routeLabel}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            isCancelled
              ? "bg-red-100 text-red-700"
              : route.status === "unknown"
                ? "bg-gray-100 text-gray-500"
                : "bg-green-100 text-green-700"
          }`}>
            {isCancelled ? "결항" : route.status === "unknown" ? "운항예정" : "운항"}
          </span>
        </div>

        {isCancelled ? (
          <p className="mt-1.5 text-xs text-red-400">오늘 이 항로는 결항입니다</p>
        ) : route.times.length > 0 ? (
          <>
            {/* 다음 출발 강조 박스 */}
            {nextTime ? (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-blue-400">{timeLabel} 다음</span>
                  <span className="text-xl font-bold tabular-nums text-blue-900">{nextTime}</span>
                </div>
                <span className="text-xs font-semibold text-blue-500">
                  {relativeTime(nextTime, nowMinutes)}
                </span>
              </div>
            ) : (
              <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-400">오늘 {timeLabel} 종료</span>
              </div>
            )}

            {/* 지난 편 + 이후 편 칩 */}
            {(pastTimes.length > 0 || futureTimes.length > 0) && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {pastTimes.map((t) => (
                  <span key={t} className="rounded-md bg-gray-50 px-2 py-0.5 text-xs tabular-nums text-gray-300 line-through">
                    {t}
                  </span>
                ))}
                {futureTimes.map((t) => (
                  <span key={t} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs tabular-nums text-gray-500">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : null}

        {route.operator && (
          <p className="mt-1.5 text-xs text-gray-400">{route.operator}</p>
        )}
      </div>

      <span className="mt-1 shrink-0 text-sm text-gray-300">›</span>
    </button>
  )
}
