// 해양수산부 국립해양조사원 조석예보(고·저조) API
// Base URL: apis.data.go.kr/1192136/tideFcstHghLw
// DATAGOKR_API_KEY 공통 사용 (별도 키 불필요)

export interface TidalEvent {
  time: string   // "HH:MM"
  height: number // cm
  type: "high" | "low"
}

export interface TidalForecast {
  events: TidalEvent[]
  obsName: string
  date: string
}

// 완도 예보지점 코드
const OBS_CODE = "DT_0027"

export async function getTidalForecast(): Promise<TidalForecast | null> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return null

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const reqDate =
    String(kst.getUTCFullYear()) +
    String(kst.getUTCMonth() + 1).padStart(2, "0") +
    String(kst.getUTCDate()).padStart(2, "0")

  try {
    const params = new URLSearchParams({
      serviceKey: key,
      type: "json",
      numOfRows: "20",
      pageNo: "1",
      obsCode: OBS_CODE,
      reqDate,
    })
    const url = `https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService?${params}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return null

    const json = await res.json()
    const resultCode = json?.header?.resultCode ?? json?.response?.header?.resultCode
    if (resultCode !== "00") return null

    const raw = json?.body?.items?.item
    if (!raw) return null
    const items: Array<{
      obsvtrNm: string
      predcDt: string  // "YYYY-MM-DD HH:MM"
      predcTdlvVl: number
      extrSe: string   // "1","3" = 고조 / "2","4" = 저조
    }> = Array.isArray(raw) ? raw : [raw]

    const events: TidalEvent[] = items.map((d) => ({
      time: d.predcDt.slice(11, 16),  // "HH:MM"
      height: d.predcTdlvVl,
      type: Number(d.extrSe) % 2 === 1 ? "high" : "low",
    }))
    events.sort((a, b) => a.time.localeCompare(b.time))

    return {
      events,
      obsName: items[0]?.obsvtrNm ?? "완도",
      date: kst.toISOString().slice(0, 10),
    }
  } catch {
    return null
  }
}

export function nextTidalEvent(events: TidalEvent[], nowMinutes: number): TidalEvent | null {
  const upcoming = events.find((e) => {
    const [h, m] = e.time.split(":").map(Number)
    return h * 60 + m > nowMinutes
  })
  return upcoming ?? events[0] ?? null
}

function kstDateStrOffset(offsetDays: number): string {
  const d = new Date(Date.now() + (9 * 60 * 60 + offsetDays * 86400) * 1000)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`
}

function dayLabel(date: string, today: string): string {
  const toMs = (s: string) => new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6)}`).getTime()
  const diff = Math.round((toMs(date) - toMs(today)) / 86400000)
  if (diff === 0) return "오늘"
  if (diff === 1) return "내일"
  if (diff === 2) return "모레"
  return `${date.slice(4, 6)}/${date.slice(6)}`
}

export interface TidalDayForecast {
  date: string
  dateLabel: string
  events: TidalEvent[]
  obsName: string
}

export async function get5DayTidalForecast(): Promise<TidalDayForecast[]> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return []

  const today = kstDateStrOffset(0)
  const dates = Array.from({ length: 5 }, (_, i) => kstDateStrOffset(i))

  const results = await Promise.all(
    dates.map(async (reqDate) => {
      try {
        const params = new URLSearchParams({
          serviceKey: key,
          type: "json",
          numOfRows: "20",
          pageNo: "1",
          obsCode: OBS_CODE,
          reqDate,
        })
        const url = `https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService?${params}`
        const res = await fetch(url, { next: { revalidate: 3600 } })
        if (!res.ok) return null
        const json = await res.json()
        const resultCode = json?.header?.resultCode ?? json?.response?.header?.resultCode
        if (resultCode !== "00") return null
        const raw = json?.body?.items?.item
        if (!raw) return null
        const items = Array.isArray(raw) ? raw : [raw]
        const events: TidalEvent[] = items
          .filter((d: Record<string, unknown>) => {
            // predcDt: "YYYY-MM-DD HH:MM" → "YYYYMMDD" 와 reqDate 비교
            const dt = String(d.predcDt).slice(0, 10).replace(/-/g, "")
            return dt === reqDate
          })
          .map((d: Record<string, unknown>) => ({
            time: String(d.predcDt).slice(11, 16),
            height: Number(d.predcTdlvVl),
            type: Number(d.extrSe) % 2 === 1 ? "high" : "low",
          }))
        events.sort((a, b) => a.time.localeCompare(b.time))
        return { reqDate, obsName: String(items[0]?.obsvtrNm ?? "완도"), events }
      } catch {
        return null
      }
    })
  )

  return dates.map((date, i) => ({
    date,
    dateLabel: dayLabel(date, today),
    events: results[i]?.events ?? [],
    obsName: results[i]?.obsName ?? "완도",
  }))
}
