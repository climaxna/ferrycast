export interface WeatherData {
  temp: number
  humidity: number
  windSpeed: number
  windDir: number
  pty: number
  rain1h: number
  baseDate: string
  baseTime: string
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

export async function getWandoWeather(): Promise<WeatherData | null> {
  const key = process.env.KMA_API_KEY
  if (!key) return null

  const { baseDate, baseTime } = getBaseDateTime()
  const url = `https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst?authKey=${key}&dataType=JSON&numOfRows=10&pageNo=1&base_date=${baseDate}&base_time=${baseTime}&nx=57&ny=74`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return null

    const json = await res.json()
    if (json?.response?.header?.resultCode !== "00") return null

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
    }
  } catch {
    return null
  }
}
