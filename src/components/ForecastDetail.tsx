"use client"

import { useEffect } from "react"
import { skyIcon, skyLabel } from "@/lib/forecast"
import type { DailyForecast } from "@/lib/forecast"

interface Props {
  forecast: DailyForecast[]
  onClose: () => void
}

export default function ForecastDetail({ forecast, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white" style={{ height: "100dvh" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="닫기"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">완도 5일 날씨 예보</h2>
          <p className="text-xs text-slate-400">기상청 단기예보 기준</p>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg divide-y divide-slate-100">
          {forecast.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-3xl">🌤️</p>
              <p className="mt-3 text-base font-semibold text-slate-500">날씨 예보를 불러올 수 없습니다</p>
              <p className="mt-1 text-sm text-slate-400">잠시 후 다시 시도해 주세요</p>
            </div>
          ) : (
            forecast.map((day) => (
              <div key={day.date} className="flex items-center gap-4 px-4 py-5">
                {/* 날짜 */}
                <div className="w-14 shrink-0">
                  <p className={`text-base font-bold ${day.dateLabel === "오늘" ? "text-blue-600" : "text-slate-800"}`}>
                    {day.dateLabel}
                  </p>
                  <p className="text-xs text-slate-400">
                    {day.date.slice(4, 6)}/{day.date.slice(6)}
                  </p>
                </div>

                {/* 날씨 아이콘 + 설명 */}
                <div className="flex w-20 shrink-0 flex-col items-center gap-0.5">
                  <span className="text-3xl">{skyIcon(day.sky, day.pty)}</span>
                  <span className="text-xs text-slate-500">{skyLabel(day.sky, day.pty)}</span>
                </div>

                {/* 기온 */}
                <div className="flex flex-1 items-center justify-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-blue-400">최저</p>
                    <p className="text-xl font-bold text-blue-700">
                      {day.tempMin !== undefined ? `${Math.round(day.tempMin)}°` : "–"}
                    </p>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="text-center">
                    <p className="text-xs text-rose-400">최고</p>
                    <p className="text-xl font-bold text-rose-600">
                      {day.tempMax !== undefined ? `${Math.round(day.tempMax)}°` : "–"}
                    </p>
                  </div>
                </div>

                {/* 강수확률 */}
                <div className="w-12 shrink-0 text-right">
                  <p className="text-xs text-slate-400">강수</p>
                  <p className={`text-base font-bold ${day.popMax >= 60 ? "text-blue-600" : day.popMax >= 30 ? "text-slate-600" : "text-slate-400"}`}>
                    {day.popMax}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mx-auto max-w-lg px-4 pb-8 pt-2">
          <p className="text-xs text-slate-400">
            기상청 단기예보 기준이며 기상 상황에 따라 변동될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
