"use client"

import { useState, useEffect } from "react"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast, TidalDayForecast } from "@/lib/tide"
import type { DailyForecast } from "@/lib/forecast"
import WeatherCardShell from "./WeatherCardShell"
import WeatherTideDetail from "./WeatherTideDetail"

interface Details {
  tidal: TidalForecast | null
  forecast5: DailyForecast[]
  tidal5: TidalDayForecast[]
  waveHeight: number | null
}

export default function WeatherCardClient({ weather, regionName = "완도", regionSlug = "" }: {
  weather: WeatherData | null
  regionName?: string
  regionSlug?: string
}) {
  const [retry, setRetry] = useState<{ initial: WeatherData | null; region: string; data: WeatherData | null } | null>(null)
  const [retrying, setRetrying] = useState(false)
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState<{ region: string; data: Details } | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const w = retry?.initial === weather && retry.region === regionSlug ? retry.data : weather
  const detailData = details?.region === regionSlug ? details.data : null

  // 상세 창을 열기 전에는 예보·물때 요청을 만들지 않는다.
  useEffect(() => {
    if (!open || detailData) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    let active = true
    fetch(`/api/weather/details?region=${encodeURIComponent(regionSlug)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("unavailable")
        return response.json() as Promise<Details>
      })
      .then(data => { if (active) setDetails({ region: regionSlug, data }) })
      .catch(() => { if (active) setDetailError("상세 예보를 불러오지 못했습니다. 닫은 뒤 다시 열어 주세요.") })
      .finally(() => clearTimeout(timeout))
    return () => { active = false; clearTimeout(timeout); controller.abort() }
  }, [open, detailData, regionSlug])

  async function retryWeather() {
    if (retrying) return
    setRetrying(true)
    try {
      const response = await fetch(`/api/weather?region=${encodeURIComponent(regionSlug)}`, { signal: AbortSignal.timeout(8000), cache: "no-store" })
      const data = response.ok ? await response.json() : null
      setRetry({ initial: weather, region: regionSlug, data: data && Number.isFinite(data.temp) ? data : null })
    } catch {
      setRetry({ initial: weather, region: regionSlug, data: null })
    } finally {
      setRetrying(false)
    }
  }

  if (!w) return (
    <div role="status" className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      <span>날씨 정보를 불러오지 못했습니다.</span>
      <button type="button" onClick={retryWeather} disabled={retrying} className="min-h-11 shrink-0 rounded-lg px-2 font-semibold underline underline-offset-4 disabled:opacity-60">
        {retrying ? "확인 중…" : "다시 시도"}
      </button>
    </div>
  )

  return (
    <>
      <WeatherCardShell w={w} onOpen={() => { setDetailError(null); setOpen(true) }} />
      {w.stale && <p role="status" className="px-1 text-xs text-amber-800">최신 조회 실패 · 위 기준 시각의 최근 관측값입니다.</p>}
      {open && <WeatherTideDetail
        regionName={regionName}
        w={{ ...w, waveHeight: detailData?.waveHeight ?? w.waveHeight }}
        tidal={detailData?.tidal ?? null}
        forecast5={detailData?.forecast5 ?? []}
        tidal5={detailData?.tidal5 ?? []}
        loading={!detailData && !detailError}
        error={detailError}
        onClose={() => setOpen(false)}
      />}
    </>
  )
}
