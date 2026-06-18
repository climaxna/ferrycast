export interface WeatherData {
  temp: number
  humidity: number
  windSpeed: number
  windDir: number
  pty: number
  rain1h: number
  baseDate: string
  baseTime: string
  waveHeight?: number
}

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

export function windDirLabel(deg: number): string {
  const dirs = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"]
  return dirs[Math.round(deg / 45) % 8]
}

export function waveLabel(h: number): { text: string; color: string } {
  if (h < 0.5) return { text: "잔잔",      color: "text-green-600" }
  if (h < 1.0) return { text: "약간 출렁", color: "text-blue-600" }
  if (h < 2.0) return { text: "보통",      color: "text-yellow-600" }
  if (h < 3.0) return { text: "거침",      color: "text-orange-600" }
  return              { text: "매우 거침", color: "text-red-600" }
}

export function ptyLabel(pty: number): { text: string; icon: string } {
  const map: Record<number, { text: string; icon: string }> = {
    0: { text: "맑음", icon: "☀️" },
    1: { text: "비", icon: "🌧️" },
    2: { text: "비/눈", icon: "🌨️" },
    3: { text: "눈", icon: "❄️" },
    5: { text: "빗방울", icon: "🌦️" },
    6: { text: "빗방울·눈날림", icon: "🌨️" },
    7: { text: "눈날림", icon: "❄️" },
  }
  return map[pty] ?? { text: "알 수 없음", icon: "🌫️" }
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

async function fetchWaveHeight(key: string): Promise<number | null> {
  const { baseDate, baseTime } = getVilageFcstBase()
  // 완도(X=57,Y=74)는 육지 격자 — WAV 없음. 남쪽 해상 격자를 순서대로 시도
  const seaGrids = [
    { nx: 57, ny: 72 },
    { nx: 57, ny: 71 },
    { nx: 58, ny: 72 },
    { nx: 56, ny: 72 },
  ]
  for (const { nx, ny } of seaGrids) {
    try {
      const params = new URLSearchParams({
        serviceKey: key,
        dataType: "JSON",
        numOfRows: "300",
        pageNo: "1",
        base_date: baseDate,
        base_time: baseTime,
        nx: String(nx),
        ny: String(ny),
      })
      const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?${params}`
      const res = await fetch(url, { next: { revalidate: 1800 } })
      if (!res.ok) continue
      const json = await res.json()
      const resultCode = json?.response?.header?.resultCode ?? json?.header?.resultCode
      if (resultCode !== "00") continue
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

export async function getWandoWeather(): Promise<WeatherData | null> {
  // apihub.kma.go.kr는 서비스별 별도 등록 필요(403). data.go.kr 공통키 사용.
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return null

  const { baseDate, baseTime } = getBaseDateTime()
  const params = new URLSearchParams({
    serviceKey: key,
    dataType: "JSON",
    numOfRows: "10",
    pageNo: "1",
    base_date: baseDate,
    base_time: baseTime,
    nx: "57",
    ny: "74",
  })
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?${params}`

  try {
    const [res, waveHeight] = await Promise.all([
      fetch(url, { next: { revalidate: 300 } }),
      fetchWaveHeight(key),
    ])
    if (!res.ok) return null

    const json = await res.json()
    const resultCode = json?.response?.header?.resultCode ?? json?.header?.resultCode
    if (resultCode !== "00") return null

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
      rain1h: get("RN1"),
      baseDate: first?.baseDate ?? baseDate,
      baseTime: first?.baseTime ?? baseTime,
      waveHeight: waveHeight ?? undefined,
    }
  } catch {
    return null
  }
}
