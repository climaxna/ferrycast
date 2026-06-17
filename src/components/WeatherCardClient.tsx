"use client"

import { useState } from "react"
import { windDirLabel, ptyLabel } from "@/lib/weather"
import { nextTidalEvent } from "@/lib/tide"
import { skyIcon } from "@/lib/forecast"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast } from "@/lib/tide"
import type { DailyForecast } from "@/lib/forecast"
import type { TidalDayForecast } from "@/lib/tide"
import RefreshButton from "./RefreshButton"
import ForecastDetail from "./ForecastDetail"
import TidalForecastDetail from "./TidalForecastDetail"

interface Props {
  weather: WeatherData | null
  tidal: TidalForecast | null
  forecast5: DailyForecast[]
  tidal5: TidalDayForecast[]
}

type View = null | "weather" | "tidal"

export default function WeatherCardClient({ weather: w, tidal, forecast5, tidal5 }: Props) {
  const [view, setView] = useState<View>(null)

  if (!w) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        날씨 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
      </div>
    )
  }

  const { text: ptyText, icon: ptyIcon } = ptyLabel(w.pty)
  const timeStr = `${w.baseDate.slice(4, 6)}.${w.baseDate.slice(6)} ${w.baseTime.slice(0, 2)}:${w.baseTime.slice(2)}`
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nextTide = tidal ? nextTidalEvent(tidal.events, nowMin) : null

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white shadow-lg shadow-blue-900/10">
        {/* 장식 원 */}
        <svg
          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/5"
          viewBox="0 0 100 100"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="50" />
        </svg>

        {/* 헤더 (클릭 불가) */}
        <div className="relative flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-sm font-medium text-white/70">완도 현재 날씨</h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/50">{timeStr} 기준</span>
            <span onClick={(e) => e.stopPropagation()}>
              <RefreshButton />
            </span>
          </div>
        </div>

        {/* 날씨 존 — 클릭시 5일 날씨 예보 */}
        <button
          type="button"
          onClick={() => setView("weather")}
          className="relative w-full px-5 pb-4 text-left transition-colors hover:bg-white/5 active:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <span className="text-5xl font-bold tracking-tight">{w.temp}°</span>
            <span className="text-4xl">{ptyIcon}</span>
            <span className="text-lg font-medium text-white/90">{ptyText}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-white/50">바람</span>
              <span className="text-base font-bold">
                {w.windSpeed}<span className="text-xs font-normal text-white/70"> m/s</span>
              </span>
              <span className="text-[11px] text-white/60">{windDirLabel(w.windDir)}풍</span>
            </div>
            <div className="flex flex-col gap-0.5 border-l border-white/10 pl-3">
              <span className="text-[11px] text-white/50">습도</span>
              <span className="text-base font-bold">{w.humidity}<span className="text-xs font-normal text-white/70">%</span></span>
              {w.rain1h > 0 && (
                <span className="text-[11px] text-white/60">강수 {w.rain1h}mm</span>
              )}
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-end gap-1 text-[11px] text-white/30">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M8 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            5일 날씨 예보
          </div>
        </button>

        {/* 조석 존 — 클릭시 5일 조석 예보 */}
        <button
          type="button"
          onClick={() => setView("tidal")}
          className="relative w-full border-t border-white/10 px-5 py-3 text-left transition-colors hover:bg-white/5 active:bg-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[11px] text-white/50">다음 조석</span>
                {nextTide ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sky-200">
                      {nextTide.type === "high" ? "만조" : "간조"}
                    </span>
                    <span className="text-sm tabular-nums text-white/80">{nextTide.time}</span>
                  </div>
                ) : (
                  <div className="text-sm text-white/40">정보 없음</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-white/30">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M8 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              5일 조석 예보
            </div>
          </div>
        </button>
      </div>

      {view === "weather" && (
        <ForecastDetail
          forecast={forecast5}
          onClose={() => setView(null)}
        />
      )}
      {view === "tidal" && (
        <TidalForecastDetail
          days={tidal5}
          onClose={() => setView(null)}
        />
      )}
    </>
  )
}
