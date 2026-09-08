import { type NextRequest, NextResponse } from "next/server"
import { REGIONS } from "@/config/regions"
import { get5DayForecast } from "@/lib/forecast"
import { getTidalForecast, get5DayTidalForecast } from "@/lib/tide"
import { get5DayForecastForRegion } from "@/lib/regionForecast"
import { getTidalForRegion, get5DayTidalForRegion } from "@/lib/regionTide"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get("region")
  const config = region ? REGIONS[region] : null
  if (region && !config) return NextResponse.json({ error: "Unknown region" }, { status: 400 })
  const expectsTide = !config || Boolean(config.tidalObsCode)
  const [forecast, tide, tides] = await Promise.allSettled([
    config ? get5DayForecastForRegion([config.weatherGrid, ...config.seaGrids]) : get5DayForecast(),
    config ? (config.tidalObsCode ? getTidalForRegion(config.tidalObsCode) : Promise.resolve(null)) : getTidalForecast(),
    config ? (config.tidalObsCode ? get5DayTidalForRegion(config.tidalObsCode) : Promise.resolve([])) : get5DayTidalForecast(),
  ])
  const forecast5 = forecast.status === "fulfilled" ? forecast.value : []
  const tidal = tide.status === "fulfilled" ? tide.value : null
  const tidal5 = tides.status === "fulfilled" ? tides.value : []
  const partial = !forecast5.length || (expectsTide && (!tidal?.events.length || tidal5.length < 5 || tidal5.some((day) => !day.events.length)))
  return NextResponse.json({ forecast5, tidal, tidal5, partial }, {
    headers: { "Cache-Control": partial ? "no-store" : "public, s-maxage=600, stale-while-revalidate=600" },
  })
}
