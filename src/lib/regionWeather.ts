import type { RegionConfig } from "@/config/regions"

export type { WeatherData } from "@/lib/weather"
export { windDirLabel, waveLabel, ptyLabel } from "@/lib/weather"

import type { WeatherData } from "@/lib/weather"

function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  let hour = kst.getUTCHours()
  if (kst.getUTCMinutes() < 40) hour -= 1
  let dateRef = kst
  if (hour < 0) {
    hour = 23
    dateRef = new Date(kst.getTime() - 24 * 60 * 60 * 1000)
  }
  const baseDate = `${dateRef.getUTCFullYear()}${pad(dateRef.getUTCMonth() + 1)}${pad(dateRef.getUTCDate())}`
  return { baseDate, baseTime: `${pad(hour)}00` }
}

function getVilageFcstBase(): { baseDate: string; baseTime: string } {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  const hour = kst.getUTCHours()
  const min = kst.getUTCMinutes()
  const bases = [2, 5, 8, 11, 14, 17, 20, 23]
  const effective = min >= 10 ? hour : hour - 1
  let base = [...bases].reverse().find((b) => b <= effective)
  let dateRef = kst
  if (base === undefined) {
    base = 23
    dateRef = new Date(kst.getTime() - 86400000)
  }
  const baseDate = `${dateRef.getUTCFullYear()}${pad(dateRef.getUTCMonth() + 1)}${pad(dateRef.getUTCDate())}`
  return { baseDate, baseTime: `${pad(base)}00` }
}

async function fetchSkySrc(
  key: string,
  nx: number,
  ny: number,
): Promise<number> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  const hour = kst.getUTCHours()
  const baseHour = kst.getUTCMinutes() >= 45 ? hour : hour - 1
  let dateRef = kst
  let h = baseHour
  if (h < 0) { h = 23; dateRef = new Date(kst.getTime() - 86400000) }
  const baseDate = `${dateRef.getUTCFullYear()}${pad(dateRef.getUTCMonth() + 1)}${pad(dateRef.getUTCDate())}`
  const baseTime = `${pad(h)}30`

  const params = new URLSearchParams({
    serviceKey: key, dataType: "JSON", numOfRows: "60", pageNo: "1",
    base_date: baseDate, base_time: baseTime, nx: String(nx), ny: String(ny),
  })
  try {
    const res = await fetch(
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?${params}`,
      { next: { revalidate: 600 } },
    )
    if (!res.ok) return 1
    const json = await res.json()
    if ((json?.response?.header?.resultCode ?? json?.header?.resultCode) !== "00") return 1
    const items: Array<{ category: string; fcstValue: string }> =
      json?.response?.body?.items?.item ?? []
    const skyItem = items.find((i) => i.category === "SKY")
    return skyItem ? parseInt(skyItem.fcstValue) : 1
  } catch { return 1 }
}

async function fetchWaveHeightSrc(
  key: string,
  seaGrids: Array<{ nx: number; ny: number }>,
): Promise<number | null> {
  const { baseDate, baseTime } = getVilageFcstBase()
  for (const { nx, ny } of seaGrids) {
    try {
      const params = new URLSearchParams({
        serviceKey: key, dataType: "JSON", numOfRows: "300", pageNo: "1",
        base_date: baseDate, base_time: baseTime, nx: String(nx), ny: String(ny),
      })
      const res = await fetch(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?${params}`,
        { next: { revalidate: 1800 } },
      )
      if (!res.ok) continue
      const json = await res.json()
      if ((json?.response?.header?.resultCode ?? json?.header?.resultCode) !== "00") continue
      const items: Array<{ category: string; fcstValue: string; fcstDate: string; fcstTime: string }> =
        json?.response?.body?.items?.item ?? []
      const wavItems = items
        .filter((i) => i.category === "WAV")
        .sort((a, b) => parseInt(a.fcstDate + a.fcstTime) - parseInt(b.fcstDate + b.fcstTime))
      if (wavItems.length) return parseFloat(wavItems[0].fcstValue)
    } catch { continue }
  }
  return null
}

// 지역별 직전 정상값 보관 (서버 인스턴스 메모리) — 기상청 실패 시 빈 화면 방지
const _lastGoodRegion = new Map<string, { data: WeatherData; at: number }>()
const REGION_WEATHER_STALE_MAX_MS = 3 * 60 * 60 * 1000  // 최대 3시간

export async function getWeatherForRegion(config: RegionConfig): Promise<WeatherData | null> {
  const fresh = await fetchRegionWeatherFresh(config)
  const k = `${config.weatherGrid.nx},${config.weatherGrid.ny}`
  if (fresh) {
    _lastGoodRegion.set(k, { data: fresh, at: Date.now() })
    return fresh
  }
  const prev = _lastGoodRegion.get(k)
  if (prev && Date.now() - prev.at < REGION_WEATHER_STALE_MAX_MS) return prev.data
  return null
}

async function fetchRegionWeatherFresh(config: RegionConfig): Promise<WeatherData | null> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return null

  const { nx, ny } = config.weatherGrid
  const { baseDate, baseTime } = getBaseDateTime()
  const params = new URLSearchParams({
    serviceKey: key, dataType: "JSON", numOfRows: "10", pageNo: "1",
    base_date: baseDate, base_time: baseTime, nx: String(nx), ny: String(ny),
  })
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?${params}`

  try {
    const [res, waveHeight, sky] = await Promise.all([
      fetch(url, { next: { revalidate: 600 } }),
      fetchWaveHeightSrc(key, config.seaGrids),
      fetchSkySrc(key, nx, ny),
    ])
    if (!res.ok) return null
    const json = await res.json()
    if ((json?.response?.header?.resultCode ?? json?.header?.resultCode) !== "00") return null

    const items: Array<{ category: string; obsrValue: string; baseDate: string; baseTime: string }> =
      json?.response?.body?.items?.item ?? []
    const get = (cat: string) =>
      parseFloat(items.find((i) => i.category === cat)?.obsrValue ?? "0")
    const first = items[0]

    return {
      temp: get("T1H"),
      humidity: get("REH"),
      windSpeed: get("WSD"),
      windDir: get("VEC"),
      pty: get("PTY"),
      sky,
      rain1h: get("RN1"),
      baseDate: first?.baseDate ?? baseDate,
      baseTime: first?.baseTime ?? baseTime,
      waveHeight: waveHeight ?? undefined,
    }
  } catch {
    return null
  }
}
