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

  const accentBar = isCancelled ? "bg-rose-500" : isUnknown ? "bg-slate-600" : isArrival ? "bg-emerald-500" : "bg-sky-500"
  const isAltTerminal = !route.originName && route.terminal !== "완도여객선터미널"
  const viaEntries = route.via
    ? Object.entries(route.via)
        .filter(([t]) => toMinutes(t) > nowMinutes)
        .sort(([a], [b]) => toMinutes(a) - toMinutes(b))
    : []

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/80 px-4 py-4 text-left shadow-lg shadow-slate-950/60 transition-all hover:border-slate-600 hover:bg-slate-800 active:scale-[0.99]"
    >
      {/* 좌측 상태 액센트 */}
      <span className={`absolute left-0 top-0 h-full w-[3px] ${accentBar}`} />

      <div className="min-w-0 flex-1 pl-1">
        {/* 항로명 + 상태 배지 */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-white">{routeLabel}</span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isCancelled
                ? "bg-rose-500/15 text-rose-400"
                : isUnknown
                  ? "bg-slate-700 text-slate-400"
                  : isArrival
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-sky-500/15 text-sky-400"
            }`}
          >
            {isCancelled ? "결항" : isUnknown ? "운항예정" : "운항"}
          </span>
        </div>

        {isCancelled ? (
          <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
            오늘 이 항로는 결항입니다
          </p>
        ) : route.times.length > 0 ? (
          <>
            {/* 다음 출발 — 큰 숫자로 강조 */}
            {nextTime ? (
              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-xs font-medium text-slate-500">{timeLabel}</span>
                <span className="text-3xl font-bold tabular-nums text-white">{nextTime}</span>
                <span className={`text-xs font-semibold ${isArrival ? "text-emerald-400" : "text-sky-400"}`}>
                  {relativeTime(nextTime, nowMinutes)}
                </span>
              </div>
            ) : (
              <div className="mt-3">
                <span className="text-xs text-slate-600">오늘 {timeLabel} 종료</span>
              </div>
            )}

            {/* 시간표 칩 */}
            {(pastTimes.length > 0 || nextTime || futureTimes.length > 0) && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {pastTimes.map((t) => (
                  <span key={t} className="text-sm tabular-nums text-slate-600">{t}</span>
                ))}
                {nextTime && (
                  <span className={`rounded-md px-2.5 py-1 text-sm font-bold tabular-nums ${
                    isArrival ? "bg-emerald-500/20 text-emerald-300" : "bg-sky-500/20 text-sky-300"
                  }`}>
                    {nextTime}
                  </span>
                )}
                {futureTimes.map((t) => (
                  <span key={t} className="rounded-md bg-slate-700/80 px-2.5 py-1 text-sm font-semibold tabular-nums text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* 경유편 안내 */}
            {viaEntries.length > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 2v6m0 0 3-3m-3 3L9 5M5 12H2m20 0h-3m-2.5 7.5L19 22M7.5 19.5 5 22" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="14" r="4" />
                </svg>
                {viaEntries.map(([t, place]) => `${t} ${place} 경유`).join(", ")}
              </div>
            )}
          </>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
              isAltTerminal ? "bg-amber-500/10 text-amber-400" : "text-slate-600"
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            {route.terminal}
          </span>
          {route.operator && (
            <span className="truncate text-xs text-slate-600">{route.operator}</span>
          )}
        </div>

        {/* 내일 운항 예정 */}
        {route.tomorrow && route.tomorrow.tripCount > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M3 10h18M8 2v4M16 2v4" strokeLinecap="round" />
            </svg>
            내일 {route.tomorrow.tripCount}편 운항 예정
          </div>
        )}
      </div>

      <span className="mt-0.5 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5">›</span>
    </button>
  )
}
