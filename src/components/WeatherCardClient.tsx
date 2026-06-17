"use client"

import { useState } from "react"
import { windDirLabel, ptyLabel } from "@/lib/weather"
import { nextTidalEvent } from "@/lib/tide"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast } from "@/lib/tide"
import RefreshButton from "./RefreshButton"
import WeatherDetail from "./WeatherDetail"

interface Props {
  weather: WeatherData | null
  tidal: TidalForecast | null
}

export default function WeatherCardClient({ weather: w, tidal }: Props) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsDetailOpen(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIsDetailOpen(true)}
        className="relative w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-5 text-white shadow-lg shadow-blue-900/10 transition-opacity active:opacity-90"
        aria-label="날씨 상세 보기"
      >
        {/* 장식 원 */}
        <svg
          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/5"
          viewBox="0 0 100 100"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="50" />
        </svg>

        <div className="relative flex items-center justify-between">
          <h2 className="text-sm font-medium text-white/70">완도 현재 날씨</h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/50">{timeStr} 기준</span>
            <span onClick={(e) => e.stopPropagation()}>
              <RefreshButton />
            </span>
          </div>
        </div>

        <div className="relative mt-3 flex items-center gap-3">
          <span className="text-5xl font-bold tracking-tight">{w.temp}°</span>
          <span className="text-4xl">{ptyIcon}</span>
          <span className="text-lg font-medium text-white/90">{ptyText}</span>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3.5 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-white/50">바람</span>
            <span className="font-semibold">
              {w.windSpeed}
              <span className="text-xs font-normal text-white/70"> m/s</span>
            </span>
            <span className="text-[11px] text-white/60">{windDirLabel(w.windDir)}풍</span>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-white/10 pl-2">
            <span className="text-[11px] text-white/50">습도</span>
            <span className="font-semibold">{w.humidity}%</span>
            {w.rain1h > 0 && (
              <span className="text-[11px] text-white/60">강수 {w.rain1h}mm</span>
            )}
          </div>
          <div className="flex flex-col gap-0.5 border-l border-white/10 pl-2">
            <span className="text-[11px] text-white/50">조석</span>
            {nextTide ? (
              <>
                <span className="font-semibold text-sky-200">
                  {nextTide.type === "high" ? "만조" : "간조"}
                </span>
                <span className="text-[11px] text-white/60">{nextTide.time}</span>
              </>
            ) : (
              <span className="text-xs text-white/30">–</span>
            )}
          </div>
        </div>

        <div className="relative mt-3 flex items-center gap-1 text-[11px] text-white/25">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          자세히 보기
        </div>
      </div>

      {isDetailOpen && (
        <WeatherDetail
          weather={w}
          tidal={tidal}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  )
}
