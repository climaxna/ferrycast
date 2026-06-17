// 기상청 단기예보 API로 5일치 날씨 데이터

export interface DailyForecast {
  date: string       // "YYYYMMDD"
  dateLabel: string  // "오늘"|"내일"|"모레"|"MM/DD"
  tempMin?: number
  tempMax?: number
  sky: number        // 1=맑음 3=구름많음 4=흐림
  pty: number        // 0=없음 1=비 2=비/눈 3=눈 4=소나기
  popMax: number     // 강수확률 최대 %
}

export function skyIcon(sky: number, pty: number): string {
  if (pty === 1 || pty === 5) return "🌧️"
  if (pty === 2 || pty === 6) return "🌨️"
  if (pty === 3 || pty === 7) return "❄️"
  if (pty === 4) return "⛅🌧️"
  if (sky === 1) return "☀️"
  if (sky === 3) return "⛅"
  return "☁️"
}

export function skyLabel(sky: number, pty: number): string {
  if (pty === 1 || pty === 5) return "비"
  if (pty === 2 || pty === 6) return "비/눈"
  if (pty === 3 || pty === 7) return "눈"
  if (pty === 4) return "소나기"
  if (sky === 1) return "맑음"
  if (sky === 3) return "구름많음"
  return "흐림"
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

function kstDateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + (9 * 60 * 60 + offsetDays * 86400) * 1000)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`
}

function makeDateLabel(date: string, today: string): string {
  const toMs = (s: string) => new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6)}`).getTime()
  const dayDiff = Math.round((toMs(date) - toMs(today)) / 86400000)
  if (dayDiff === 0) return "오늘"
  if (dayDiff === 1) return "내일"
  if (dayDiff === 2) return "모레"
  return `${date.slice(4, 6)}/${date.slice(6)}`
}

export async function get5DayForecast(): Promise<DailyForecast[]> {
  const key = process.env.KMA_API_KEY
  if (!key) return []

  const { baseDate, baseTime } = getVilageFcstBase()
  const today = kstDateStr(0)

  try {
    const url =
      `https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getVilageFcst` +
      `?authKey=${key}&dataType=JSON&numOfRows=1000&pageNo=1` +
      `&base_date=${baseDate}&base_time=${baseTime}&nx=57&ny=74`
    const res = await fetch(url, { next: { revalidate: 600 } })
    if (!res.ok) return []
    const json = await res.json()
    // resultCode 위치가 API 버전마다 다를 수 있으므로 두 경로 모두 확인
    const resultCode = json?.response?.header?.resultCode ?? json?.header?.resultCode
    if (resultCode !== "00") return []

    const rawItems = json?.response?.body?.items?.item
    if (!rawItems) return []
    // 단일 객체 반환 시 배열로 감싸기
    const items: Array<{
      category: string
      fcstDate: string
      fcstTime: string
      fcstValue: string
    }> = Array.isArray(rawItems) ? rawItems : [rawItems]

    // Group by date
    const byDate = new Map<string, typeof items>()
    for (const item of items) {
      if (!byDate.has(item.fcstDate)) byDate.set(item.fcstDate, [])
      byDate.get(item.fcstDate)!.push(item)
    }

    const sortedDates = [...byDate.keys()].sort().slice(0, 5)
    return sortedDates.map((date) => {
      const dayItems = byDate.get(date)!

      const valAt = (cat: string, time: string) =>
        dayItems.find((i) => i.category === cat && i.fcstTime === time)?.fcstValue
      const allVals = (cat: string) =>
        dayItems.filter((i) => i.category === cat).map((i) => parseFloat(i.fcstValue))

      // TMN/TMX
      const tmnRaw = valAt("TMN", "0600") ?? dayItems.find((i) => i.category === "TMN")?.fcstValue
      const tmxRaw = valAt("TMX", "1500") ?? dayItems.find((i) => i.category === "TMX")?.fcstValue
      const tempMin = tmnRaw !== undefined ? parseFloat(tmnRaw) : undefined
      const tempMax = tmxRaw !== undefined ? parseFloat(tmxRaw) : undefined

      // SKY at noon, fallback to 1500 or 0900
      const skyStr = valAt("SKY", "1200") ?? valAt("SKY", "1500") ?? valAt("SKY", "0900") ?? "1"
      const sky = parseInt(skyStr)

      // PTY - worst of the day (highest value wins if > 0)
      const ptyVals = allVals("PTY")
      const ptyNonZero = ptyVals.filter((v) => v > 0)
      const pty = ptyNonZero.length > 0 ? Math.max(...ptyNonZero) : 0

      // POP - max of the day
      const popVals = allVals("POP")
      const popMax = popVals.length > 0 ? Math.max(...popVals) : 0

      return {
        date,
        dateLabel: makeDateLabel(date, today),
        tempMin,
        tempMax,
        sky,
        pty,
        popMax,
      }
    })
  } catch {
    return []
  }
}
