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
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const json = await res.json()
    if (json?.header?.resultCode !== "00") return null

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
