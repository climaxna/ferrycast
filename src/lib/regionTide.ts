import { kstDateStr, dayLabel } from "@/lib/utils"
import type { TidalEvent, TidalForecast, TidalDayForecast } from "@/lib/tide"

export type { TidalEvent, TidalForecast, TidalDayForecast } from "@/lib/tide"
export { nextTidalEvent } from "@/lib/tide"

async function fetchTidal(
  key: string,
  obsCode: string,
  reqDate: string,
  revalidate: number,
): Promise<Array<{ predcDt: string; predcTdlvVl: number; extrSe: string; obsvtrNm: string }> | null> {
  const params = new URLSearchParams({
    serviceKey: key, type: "json", numOfRows: "20", pageNo: "1",
    obsCode, reqDate,
  })
  try {
    const res = await fetch(
      `https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService?${params}`,
      { next: { revalidate } },
    )
    if (!res.ok) return null
    const json = await res.json()
    const resultCode = json?.header?.resultCode ?? json?.response?.header?.resultCode
    if (resultCode !== "00") return null
    const raw = json?.body?.items?.item
    if (!raw) return null
    return Array.isArray(raw) ? raw : [raw]
  } catch {
    return null
  }
}

export async function getTidalForRegion(obsCode: string): Promise<TidalForecast | null> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return null

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const reqDate =
    String(kst.getUTCFullYear()) +
    String(kst.getUTCMonth() + 1).padStart(2, "0") +
    String(kst.getUTCDate()).padStart(2, "0")

  const items = await fetchTidal(key, obsCode, reqDate, 300)
  if (!items) return null

  const events: TidalEvent[] = items.map((d) => ({
    time: d.predcDt.slice(11, 16),
    height: d.predcTdlvVl,
    type: Number(d.extrSe) % 2 === 1 ? "high" : "low",
  }))
  events.sort((a, b) => a.time.localeCompare(b.time))

  return {
    events,
    obsName: items[0]?.obsvtrNm ?? obsCode,
    date: kst.toISOString().slice(0, 10),
  }
}

export async function get5DayTidalForRegion(obsCode: string): Promise<TidalDayForecast[]> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return []

  const today = kstDateStr(0)
  const dates = Array.from({ length: 5 }, (_, i) => kstDateStr(i))

  const results = await Promise.all(
    dates.map(async (reqDate) => {
      const items = await fetchTidal(key, obsCode, reqDate, 3600)
      if (!items) return null
      const events: TidalEvent[] = items
        .filter((d) => {
          const dt = String(d.predcDt).slice(0, 10).replace(/-/g, "")
          return dt === reqDate
        })
        .map((d) => ({
          time: String(d.predcDt).slice(11, 16),
          height: Number(d.predcTdlvVl),
          type: Number(d.extrSe) % 2 === 1 ? "high" : "low",
        }))
      events.sort((a, b) => a.time.localeCompare(b.time))
      return { events, obsName: String(items[0]?.obsvtrNm ?? obsCode) }
    }),
  )

  return dates.map((date, i) => ({
    date,
    dateLabel: dayLabel(date, today),
    events: results[i]?.events ?? [],
    obsName: results[i]?.obsName ?? obsCode,
  }))
}
