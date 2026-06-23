import { kstDateStr, dayLabel } from "@/lib/utils"
import type { DailyForecast } from "@/lib/forecast"

export type { DailyForecast } from "@/lib/forecast"
export { skyIcon, skyLabel } from "@/lib/forecast"

function getVilageFcstBaseCandidates(): Array<{ baseDate: string; baseTime: string }> {
  const pad = (n: number) => String(n).padStart(2, "0")
  const bases = [2, 5, 8, 11, 14, 17, 20, 23]
  const candidates: Array<{ baseDate: string; baseTime: string }> = []

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  let refHour = kst.getUTCMinutes() >= 15 ? kst.getUTCHours() : kst.getUTCHours() - 1
  let refDate = new Date(kst)

  while (candidates.length < 3) {
    const base = [...bases].reverse().find((b) => b <= refHour)
    if (base !== undefined) {
      const y = refDate.getUTCFullYear()
      const m = refDate.getUTCMonth() + 1
      const d = refDate.getUTCDate()
      candidates.push({ baseDate: `${y}${pad(m)}${pad(d)}`, baseTime: `${pad(base)}00` })
      refHour = base - 1
    } else {
      refDate = new Date(refDate.getTime() - 86400000)
      refHour = 23
    }
  }
  return candidates
}

export async function get5DayForecastForRegion(
  grids: Array<{ nx: number; ny: number }>,
): Promise<DailyForecast[]> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return []

  const today = kstDateStr(0)
  const candidates = getVilageFcstBaseCandidates()

  for (const { baseDate, baseTime } of candidates) {
    for (const { nx, ny } of grids) {
      try {
        const params = new URLSearchParams({
          serviceKey: key, dataType: "JSON", numOfRows: "1000", pageNo: "1",
          base_date: baseDate, base_time: baseTime, nx: String(nx), ny: String(ny),
        })
        const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?${params}`
        const res = await fetch(url, { next: { revalidate: 600 } })
        if (!res.ok) continue
        const json = await res.json()
        if ((json?.response?.header?.resultCode ?? json?.header?.resultCode) !== "00") continue

        const rawItems = json?.response?.body?.items?.item
        if (!rawItems) continue
        const items: Array<{ category: string; fcstDate: string; fcstTime: string; fcstValue: string }> =
          Array.isArray(rawItems) ? rawItems : [rawItems]

        const byDate = new Map<string, typeof items>()
        for (const item of items) {
          if (!byDate.has(item.fcstDate)) byDate.set(item.fcstDate, [])
          byDate.get(item.fcstDate)!.push(item)
        }
        const sortedDates = [...byDate.keys()].sort().slice(0, 5)
        if (!sortedDates.length) continue

        return sortedDates.map((date) => {
          const dayItems = byDate.get(date)!
          const valAt = (cat: string, time: string) =>
            dayItems.find((i) => i.category === cat && i.fcstTime === time)?.fcstValue
          const allVals = (cat: string) =>
            dayItems.filter((i) => i.category === cat).map((i) => parseFloat(i.fcstValue))

          const tmnRaw = valAt("TMN", "0600") ?? dayItems.find((i) => i.category === "TMN")?.fcstValue
          const tmxRaw = valAt("TMX", "1500") ?? dayItems.find((i) => i.category === "TMX")?.fcstValue
          const tmpVals = allVals("TMP")
          const tempMin = tmnRaw !== undefined ? parseFloat(tmnRaw) : (tmpVals.length > 0 ? Math.min(...tmpVals) : undefined)
          const tempMax = tmxRaw !== undefined ? parseFloat(tmxRaw) : (tmpVals.length > 0 ? Math.max(...tmpVals) : undefined)

          const skyStr = valAt("SKY", "1200") ?? valAt("SKY", "1500") ?? valAt("SKY", "0900") ?? "1"
          const sky = parseInt(skyStr)
          const ptyVals = allVals("PTY")
          const ptyNonZero = ptyVals.filter((v) => v > 0)
          const pty = ptyNonZero.length > 0 ? Math.max(...ptyNonZero) : 0
          const popVals = allVals("POP")
          const popMax = popVals.length > 0 ? Math.max(...popVals) : 0

          return { date, dateLabel: dayLabel(date, today), tempMin, tempMax, sky, pty, popMax }
        })
      } catch { continue }
    }
  }
  return []
}
