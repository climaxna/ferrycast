// 국립해양조사원(KHOA) 조석예보 API
// 키 발급: https://www.khoa.go.kr/api/oceangrid/intro.do
// 환경변수: KHOA_API_KEY

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

// 완도 조위관측소 코드 (KHOA ObsCode)
const OBS_CODE = "DW0011"

export async function getTidalForecast(): Promise<TidalForecast | null> {
  const key = process.env.KHOA_API_KEY
  if (!key) return null

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const date = kst.toISOString().slice(0, 10).replace(/-/g, "")

  try {
    const url =
      `https://www.khoa.go.kr/api/oceangrid/tideObsPredicAPI.do/json` +
      `?ServiceKey=${encodeURIComponent(key)}&ObsCode=${OBS_CODE}&Date=${date}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const json = await res.json()
    const data = json?.result?.data
    if (!Array.isArray(data) || !data.length) return null

    const events: TidalEvent[] = []
    for (const d of data) {
      if (d.tph_time && d.tph_level != null) {
        events.push({ time: d.tph_time, height: parseInt(String(d.tph_level)), type: "high" })
      }
      if (d.tpl_time && d.tpl_level != null) {
        events.push({ time: d.tpl_time, height: parseInt(String(d.tpl_level)), type: "low" })
      }
    }
    if (!events.length) return null
    events.sort((a, b) => a.time.localeCompare(b.time))

    return {
      events,
      obsName: json?.result?.meta?.obs_post_name ?? "완도",
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
