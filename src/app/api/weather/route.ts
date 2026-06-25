import { type NextRequest, NextResponse } from "next/server"
import { getWandoWeather } from "@/lib/weather"
import { getWeatherForRegion } from "@/lib/regionWeather"
import { REGIONS } from "@/config/regions"

// ISR 캐시를 타지 않고 요청 시점(따뜻한 인스턴스)에서 항상 실행 →
// 빌드/콜드 프리렌더에 빈 날씨가 구워져도 클라이언트가 이걸로 자가복구
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get("region")
  const config = region ? REGIONS[region] : null
  const data = config ? await getWeatherForRegion(config) : await getWandoWeather()
  return NextResponse.json(data ?? null, {
    headers: { "Cache-Control": "no-store" },
  })
}
