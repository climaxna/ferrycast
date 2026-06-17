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
  const isUnknown = route.status === "unknown"
  const routeLabel = route.from ? `${route.from} → ${route.to}` : `완도 → ${route.to}`
  const timeLabel = route.from ? `${route.from} 출발` : "출발"

  const nextIdx = route.times.findIndex((t) => toMinutes(t) > nowMinutes)
  const nextTime = nextIdx >= 0 ? route.times[nextIdx] : null
  const pastTimes = route.times.slice(0, nextIdx === -1 ? route.times.length : nextIdx)
  const futureTimes = nextIdx >= 0 ? route.times.slice(nextIdx + 1) : []

  const accent = isCancelled ? "bg-rose-400" : isUnknown ? "bg-slate-300" : "bg-blue-500"
  const isAltTerminal = route.terminal !== "완도여객선터미널"

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-slate-200 hover:shadow-md active:scale-[0.99]"
    >
      {/* 좌측 상태 액센트 바 */}
      <span className={`absolute left-0 top-0 h-full w-1 ${accent}`} />

      <div className="min-w-0 flex-1 pl-1">
        {/* 항로명 + 상태 배지 */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-slate-900">{routeLabel}</span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isCancelled
                ? "bg-rose-50 text-rose-600"
                : isUnknown
                  ? "bg-slate-100 text-slate-500"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {isCancelled ? "결항" : isUnknown ? "운항예정" : "운항"}
          </span>
        </div>

        {isCancelled ? (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-500">
            오늘 이 항로는 결항입니다
          </p>
        ) : route.times.length > 0 ? (
          <>
            {/* 다음 출발 강조 */}
            {nextTime ? (
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-medium text-blue-500">{timeLabel}</span>
                  <span className="text-2xl font-bold tabular-nums text-blue-800">{nextTime}</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">
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
              <div className="mt-2 flex flex-wrap gap-1.5">
                {pastTimes.map((t) => (
                  <span
                    key={t}
                    className="rounded-md px-1.5 py-0.5 text-xs tabular-nums text-slate-300 line-through"
                  >
                    {t}
                  </span>
                ))}
                {nextTime && (
                  <span className="rounded-md bg-blue-500 px-2 py-0.5 text-xs font-bold tabular-nums text-white">
                    {nextTime}
                  </span>
                )}
                {futureTimes.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-blue-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
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
            <span className="truncate text-[11px] text-slate-400">{route.operator}</span>
          )}
        </div>
      </div>

      <span className="mt-0.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5">
        ›
      </span>
    </button>
  )
}
