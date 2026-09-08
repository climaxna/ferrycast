"use client"

import { useState, useEffect } from "react"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast, TidalDayForecast } from "@/lib/tide"
import type { DailyForecast } from "@/lib/forecast"
import WeatherCardShell from "./WeatherCardShell"
import WeatherTideDetail from "./WeatherTideDetail"
import { useWeatherDetails } from "@/hooks/useWeatherDetails"

interface Props {
  weather: WeatherData | null
  tidal: TidalForecast | null
  forecast5: DailyForecast[]
  tidal5: TidalDayForecast[]
}

export default function WeatherCardClient({ weather, tidal, forecast5, tidal5 }: Props) {
  const [open, setOpen] = useState(false)
  const details = useWeatherDetails(open)
  // 빌드/콜드 프리렌더에 빈 날씨가 구워졌을 때, 동적 API로 자가복구
  const [w, setW] = useState(weather)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (weather) { setW(weather); return }
    const controller = new AbortController()
    let active = true
    const timer = setTimeout(() => controller.abort(), 20_000)
    fetch("/api/weather", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active && d && typeof d.temp === "number") setW(d) })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); if (active) setTried(true) })
    return () => { active = false; clearTimeout(timer); controller.abort() }
  }, [weather])

  if (!w) {
    return tried ? (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        날씨 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
      </div>
    ) : (
      <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
    )
  }

  return (
    <>
      <WeatherCardShell w={w} onOpen={() => setOpen(true)} />
      {open && (
        <WeatherTideDetail
          regionName="완도"
          w={w}
          tidal={details.data?.tidal ?? tidal}
          forecast5={details.data?.forecast5 ?? forecast5}
          tidal5={details.data?.tidal5 ?? tidal5}
          loading={details.loading}
          detailsUnavailable={details.failed || details.data?.partial}
          onRetry={details.retry}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
