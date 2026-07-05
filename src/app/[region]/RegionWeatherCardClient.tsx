"use client"

import { useState, useEffect } from "react"
import { windDirLabel, ptyLabel, waveLabel } from "@/lib/weather"
import { nextTidalEvent } from "@/lib/tide"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast } from "@/lib/tide"
import type { DailyForecast } from "@/lib/forecast"
import type { TidalDayForecast } from "@/lib/tide"
import RefreshButton from "@/components/RefreshButton"
import RegionForecastDetail from "./RegionForecastDetail"
import RegionTidalForecastDetail from "./RegionTidalForecastDetail"

interface Props {
  weather: WeatherData | null
  tidal: TidalForecast | null
  forecast5: DailyForecast[]
  tidal5: TidalDayForecast[]
  regionName: string
  regionSlug: string
}

type View = null | "weather" | "tidal"

export default function RegionWeatherCardClient({ weather, tidal, forecast5, tidal5, regionName, regionSlug }: Props) {
  const [view, setView] = useState<View>(null)
  // 빌드/콜드 프리렌더에 빈 날씨가 구워졌을 때, 동적 API로 자가복구
  const [w, setW] = useState(weather)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (weather) return
    fetch(`/api/weather?region=${regionSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.temp === "number") setW(d) })
      .catch(() => {})
      .finally(() => setTried(true))
  }, [weather, regionSlug])

  if (!w) {
    return tried ? (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        날씨 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
      </div>
    ) : (
      <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
    )
  }

  const { text: ptyText, icon: ptyIcon } = ptyLabel(w.pty, w.sky)
  const timeStr = `${w.baseDate.slice(4, 6)}/${w.baseDate.slice(6)} ${w.baseTime.slice(0, 2)}:${w.baseTime.slice(2)}`
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nextTide = tidal ? nextTidalEvent(tidal.events, nowMin) : null
  const wave = w.waveHeight !== undefined ? waveLabel(w.waveHeight) : null

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] text-white shadow-sm">
        {/* 새로고침 — 날씨존 버튼 밖(중첩 버튼 방지), 우상단 절대배치 */}
        <div className="absolute right-2 top-2 z-10">
          <RefreshButton />
        </div>

        <button
          type="button"
          onClick={() => setView("weather")}
          className="relative w-full px-4 pt-3 pb-2.5 pr-10 text-left transition-colors hover:bg-white/5 active:bg-white/10"
        >
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="shrink-0 text-3xl font-bold tabular-nums leading-none">{Math.round(w.temp)}°</span>
            <span className="shrink-0 text-2xl leading-none">{ptyIcon}</span>
            <span className="shrink-0 text-sm font-medium text-white/90">{ptyText}</span>

            <div className="mx-0.5 h-5 w-px shrink-0 bg-white/25" />

            <div className="shrink-0">
              <p className="text-[11px] leading-none text-white/90">바람</p>
              <p className="mt-0.5 text-sm font-bold leading-none">
                {w.windSpeed}<span className="text-[11px] font-normal text-white/90"> m/s</span>
                <span className="ml-1 text-[11px] font-normal text-white/90">{windDirLabel(w.windDir)}</span>
              </p>
            </div>

            <div className="mx-0.5 h-5 w-px shrink-0 bg-white/25" />

            <div className="shrink-0">
              <p className="text-[11px] leading-none text-white/90">습도</p>
              <p className="mt-0.5 text-sm font-bold leading-none">
                {w.humidity}<span className="text-[11px] font-normal text-white/90">%</span>
              </p>
            </div>

            {wave && (
              <>
                <div className="mx-0.5 h-5 w-px shrink-0 bg-white/25" />
                <div className="shrink-0">
                  <p className="text-[11px] leading-none text-white/90">파고</p>
                  <p className={`mt-0.5 text-sm font-bold leading-none ${wave.color}`}>
                    {w.waveHeight}m
                    <span className="ml-1 text-[10px] font-normal text-white/90">{wave.text}</span>
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-white/90">{timeStr} 기준</span>
            <span className="text-xs font-medium text-white/90">단기 날씨 예보 →</span>
          </div>
        </button>

        {tidal && (
          <button
            type="button"
            onClick={() => setView("tidal")}
            className="relative w-full border-t border-white/10 px-4 py-2.5 text-left transition-colors hover:bg-white/5 active:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/90">다음 조석</span>
                {nextTide ? (
                  <>
                    <span className="text-sm font-bold text-sky-300">
                      {nextTide.type === "high" ? "만조" : "간조"}
                    </span>
                    <span className="text-sm tabular-nums text-white/90">{nextTide.time}</span>
                    <span className="text-xs text-white/90">{nextTide.height}cm</span>
                  </>
                ) : (
                  <span className="text-sm text-white/90">정보 없음</span>
                )}
              </div>
              <span className="text-[11px] text-white/90">5일 조석 예보 →</span>
            </div>
          </button>
        )}
      </div>

      {view === "weather" && (
        <RegionForecastDetail
          forecast={forecast5}
          regionName={regionName}
          onClose={() => setView(null)}
        />
      )}
      {view === "tidal" && tidal5.length > 0 && (
        <RegionTidalForecastDetail
          days={tidal5}
          regionName={regionName}
          onClose={() => setView(null)}
        />
      )}
    </>
  )
}
