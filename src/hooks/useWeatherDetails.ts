"use client"

import { useEffect, useState } from "react"
import type { DailyForecast } from "@/lib/forecast"
import type { TidalForecast, TidalDayForecast } from "@/lib/tide"

type Details = { forecast5: DailyForecast[]; tidal: TidalForecast | null; tidal5: TidalDayForecast[]; partial: boolean }

export function useWeatherDetails(open: boolean, region = "") {
  const [result, setResult] = useState<{ region: string; data: Details } | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const data = result?.region === region ? result.data : null
  const complete = Boolean(data && !data.partial)

  useEffect(() => {
    if (!open || complete) return
    const controller = new AbortController()
    let active = true
    const timer = setTimeout(() => controller.abort(), 20_000)
    setLoading(true)
    setFailed(false)
    fetch(`/api/weather/details${region ? `?region=${encodeURIComponent(region)}` : ""}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Details unavailable")
        const next = await r.json() as Details
        if (!Array.isArray(next.forecast5) || !Array.isArray(next.tidal5)) throw new Error("Invalid details")
        if (active) {
          setLoading(false)
          setResult({ region, data: next })
        }
      })
      .catch(() => { if (active) setFailed(true) })
      .finally(() => { clearTimeout(timer); if (active) setLoading(false) })
    return () => { active = false; clearTimeout(timer); controller.abort() }
  }, [open, region, attempt, complete])

  return { data, loading, failed, retry: () => setAttempt((n) => n + 1) }
}
