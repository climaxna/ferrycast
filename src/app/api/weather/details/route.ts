import { NextRequest, NextResponse } from "next/server"
import { REGIONS } from "@/config/regions"
import { fetchWaveHeight } from "@/lib/weather"
import { fetchWaveHeightSrc } from "@/lib/regionWeather"
import { get5DayForecast } from "@/lib/forecast"
import { get5DayForecastForRegion } from "@/lib/regionForecast"
import { getTidalForecast, get5DayTidalForecast } from "@/lib/tide"
import { getTidalForRegion, get5DayTidalForRegion } from "@/lib/regionTide"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get("region") ?? ""
  const config = region ? REGIONS[region] : null
  if (region && !config) return NextResponse.json({ error: "Unknown region" }, { status: 400 })
  const signal = AbortSignal.timeout(8000)
  const key = process.env.DATAGOKR_API_KEY
  const [forecast5, tidal, tidal5, waveHeight] = await Promise.all([
    config ? get5DayForecastForRegion([config.weatherGrid, ...config.seaGrids], signal) : get5DayForecast(signal),
    config ? (config.tidalObsCode ? getTidalForRegion(config.tidalObsCode, signal) : null) : getTidalForecast(signal),
    config ? (config.tidalObsCode ? get5DayTidalForRegion(config.tidalObsCode, signal) : []) : get5DayTidalForecast(signal),
    key ? (config ? fetchWaveHeightSrc(key, config.seaGrids, signal) : fetchWaveHeight(key, signal)) : null,
  ])
  const hasData = forecast5.length > 0 || tidal !== null || tidal5.some(day => day.events.length > 0) || waveHeight !== null
  return NextResponse.json({ forecast5, tidal, tidal5, waveHeight }, {
    status: hasData ? 200 : 503,
    headers: { "Cache-Control": hasData && !signal.aborted ? "public, s-maxage=300" : "no-store" },
  })
}
