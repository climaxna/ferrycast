import type { WandoRoute } from "@/lib/types"
import { toMinutes, relativeTime } from "@/lib/utils"

interface Props {
  route: WandoRoute
  nowMinutes?: number
  isArrival?: boolean
  onClick?: () => void
}

export default function RouteItem({ route, nowMinutes = 0, isArrival = false, onClick }: Props) {
  const isCancelled = route.status === "cancelled"
  const isUnknown = route.status === "unknown"
  const originName = route.originName ?? "완도"
  const routeLabel = route.from ? `${route.from} → ${route.to}` : `${originName} → ${route.to}`
  const timeLabel = route.from ? `${route.from} 출발` : "출발"

  const nextIdx = route.times.findIndex((t) => toMinutes(t) > nowMinutes)
  const nextTime = nextIdx >= 0 ? route.times[nextIdx] : null
  const pastTimes = route.times.slice(0, nextIdx === -1 ? route.times.length : nextIdx)
  const futureTimes = nextIdx >= 0 ? route.times.slice(nextIdx + 1) : []

  const isAltTerminal = !route.originName && route.terminal !== "완도여객선터미널"
  // 아직 출발 안 한 경유편만 안내 (지난 편 제외), 시각순 정렬
  const viaEntries = route.via
    ? Object.entries(route.via)
        .filter(([t]) => toMinutes(t) > nowMinutes)
        .sort(([a], [b]) => toMinutes(a) - toMinutes(b))
    : []

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        isCancelled
          ? "border-rose-200 bg-rose-50/30 hover:border-rose-300"
          : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <div className="min-w-0 flex-1">
        {/* 항로명 + 상태 배지 */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-slate-900">{routeLabel}</span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isCancelled
                ? "bg-rose-50 text-rose-600"
                : isUnknown
                  ? "bg-slate-100 text-slate-500"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isCancelled ? "결항" : isUnknown ? "운항예정" : "운항"}
          </span>
        </div>

        {isCancelled ? (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-500">
            오늘 이 항로는 결항입니다
            {route.cancelReason && (
              <span className="ml-1 font-semibold text-rose-600">· {route.cancelReason}</span>
            )}
          </p>
        ) : route.times.length > 0 ? (
          <>
            {/* 다음 출발 강조 */}
            {nextTime ? (
              <div className={`mt-2.5 flex items-center justify-between rounded-xl px-3 py-2 bg-gradient-to-r ${
                isArrival ? "from-teal-50 to-emerald-50" : "from-blue-50 to-sky-50"
              }`}>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs font-medium ${isArrival ? "text-teal-600" : "text-blue-500"}`}>{timeLabel}</span>
                  <span className={`text-2xl font-bold tabular-nums ${isArrival ? "text-teal-800" : "text-blue-800"}`}>{nextTime}</span>
                </div>
                <span className={`text-xs font-semibold ${isArrival ? "text-teal-600" : "text-blue-600"}`}>
                  {relativeTime(nextTime, nowMinutes)}
                </span>
              </div>
            ) : (
              <div className="mt-2.5 rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-xs text-slate-400">오늘 {timeLabel} 종료</span>
              </div>
            )}

            {/* 전체 시간표 칩 — 지난편·다음편·이후편 한눈에 */}
            {(pastTimes.length > 0 || nextTime || futureTimes.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {pastTimes.map((t) => (
                  <span
                    key={t}
                    className="rounded-md px-2 py-1 text-sm tabular-nums text-slate-400"
                  >
                    {t}
                  </span>
                ))}
                {nextTime && (
                  <span className={`rounded-md px-2.5 py-1 text-sm font-bold tabular-nums text-white ${isArrival ? "bg-teal-500" : "bg-blue-500"}`}>
                    {nextTime}
                  </span>
                )}
                {futureTimes.map((t) => (
                  <span
                    key={t}
                    className={`rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums ${isArrival ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* 경유편 안내 — 직항과 섞여 있는 노선(제주↔추자도)에서만 노출 */}
            {viaEntries.length > 0 && (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 2v6m0 0 3-3m-3 3L9 5M5 12H2m20 0h-3m-2.5 7.5L19 22M7.5 19.5 5 22" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="14" r="4" />
                </svg>
                {viaEntries.map(([t, place]) => `${t} ${place} 경유`).join(", ")}
              </div>
            )}
          </>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
              isAltTerminal
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-50 text-slate-400"
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            {route.terminal}
          </span>
          {route.operator && (
            <span className="truncate text-xs text-slate-400">{route.operator}</span>
          )}
        </div>

        {/* 내일 운항 예정 편수 — 신청 없이 동일 API(rlvtYmd=내일)로 집계 */}
        {route.tomorrow && route.tomorrow.tripCount > 0 && (
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M3 10h18M8 2v4M16 2v4" strokeLinecap="round" />
            </svg>
            내일 {route.tomorrow.tripCount}편 운항 예정
          </div>
        )}
      </div>

      <span className="mt-0.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5">
        ›
      </span>
    </button>
  )
}
