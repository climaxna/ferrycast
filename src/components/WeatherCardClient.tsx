"use client"

import { useState, useEffect } from "react"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast } from "@/lib/tide"
import type { DailyForecast } from "@/lib/forecast"
import type { TidalDayForecast } from "@/lib/tide"
import WeatherCardShell from "./WeatherCardShell"
import ForecastDetail from "./ForecastDetail"
import TidalForecastDetail from "./TidalForecastDetail"

interface Props {
  weather: WeatherData | null
  tidal: TidalForecast | null
  forecast5: DailyForecast[]
  tidal5: TidalDayForecast[]
}

type View = null | "weather" | "tidal"

export default function WeatherCardClient({ weather, tidal, forecast5, tidal5 }: Props) {
  const [view, setView] = useState<View>(null)
  // 빌드/콜드 프리렌더에 빈 날씨가 구워졌을 때, 동적 API로 자가복구
  const [w, setW] = useState(weather)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (weather) return
    fetch("/api/weather")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.temp === "number") setW(d) })
      .catch(() => {})
      .finally(() => setTried(true))
  }, [weather])

  if (!w) {
    return tried ? (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        날씨 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
      </div>
    ) : (
      <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
    )
  }

  return (
    <>
      <WeatherCardShell
        w={w}
        tidal={tidal}
        showTidalZone
        onWeather={() => setView("weather")}
        onTidal={() => setView("tidal")}
      />

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
