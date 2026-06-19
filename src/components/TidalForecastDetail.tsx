"use client"

import type { TidalDayForecast, TidalEvent } from "@/lib/tide"
import { useModalClose } from "@/hooks/useModalClose"

interface Props {
  days: TidalDayForecast[]
  onClose: () => void
}

export default function TidalForecastDetail({ days, onClose }: Props) {
  useModalClose(onClose)

  const now = new Date()
  const todayStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const nowMin = now.getHours() * 60 + now.getMinutes()

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white" style={{ height: "100dvh" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
        <button
          onClick={onClose}
          className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="닫기"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">완도 5일 조석 예보</h2>
          <p className="text-xs text-slate-400">국립해양조사원(KHOA) 완도 관측소 기준</p>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg">
          {days.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-3xl">🌊</p>
              <p className="mt-3 text-base font-semibold text-slate-500">조석 정보를 불러올 수 없습니다</p>
              <p className="mt-1 text-sm text-slate-400">잠시 후 다시 시도해 주세요</p>
            </div>
          ) : (
            days.map((day) => (
              <DayTidalCard
                key={day.date}
                day={day}
                isToday={day.date === todayStr}
                nowMin={day.date === todayStr ? nowMin : -1}
              />
            ))
          )}
          <div className="px-4 pb-8 pt-2">
            <p className="text-xs text-slate-400">
              조석 정보는 국립해양조사원(KHOA) 예보 기준이며 참고용입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DayTidalCard({
  day,
  isToday,
  nowMin,
}: {
  day: TidalDayForecast
  isToday: boolean
  nowMin: number
}) {
  const maxH = day.events.length > 0 ? Math.max(...day.events.map((e) => e.height), 400) : 400

  return (
    <div className="border-b border-slate-100 px-4 py-5">
      {/* 날짜 헤더 */}
      <div className="mb-4 flex items-center gap-2">
        <span className={`text-base font-bold ${isToday ? "text-blue-600" : "text-slate-800"}`}>
          {day.dateLabel}
        </span>
        <span className="text-sm text-slate-400">
          {day.date.slice(4, 6)}/{day.date.slice(6)}
        </span>
        {isToday && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">TODAY</span>
        )}
      </div>

      {day.events.length === 0 ? (
        <p className="text-sm text-slate-400">정보 없음</p>
      ) : (
        <div className="space-y-3">
          {day.events.map((event, i) => {
            const [h, m] = event.time.split(":").map(Number)
            const eventMin = h * 60 + m
            const isPast = isToday && eventMin < nowMin
            const isNext = isToday && !isPast && day.events.slice(0, i).every((prev) => {
              const [ph, pm] = prev.time.split(":").map(Number)
              return ph * 60 + pm < nowMin
            })
            const pct = Math.round((event.height / maxH) * 100)
            const isHigh = event.type === "high"

            return (
              <div
                key={i}
                className={`rounded-2xl px-4 py-3.5 ${
                  isNext
                    ? "bg-blue-50 ring-2 ring-blue-200"
                    : isPast
                      ? "bg-slate-50 opacity-50"
                      : "bg-slate-50"
                }`}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold tabular-nums ${isNext ? "text-blue-700" : "text-slate-700"}`}>
                      {event.time}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-sm font-bold ${
                        isHigh
                          ? isNext ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"
                          : isNext ? "bg-slate-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isHigh ? "만조" : "간조"}
                    </span>
                    {isNext && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">다음</span>
                    )}
                  </div>
                  <span className={`text-xl font-bold tabular-nums ${isNext ? "text-blue-700" : "text-slate-700"}`}>
                    {event.height}<span className="ml-0.5 text-sm font-normal text-slate-400">cm</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${isHigh ? "bg-blue-500" : "bg-slate-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
