export interface WeatherData {
  temp: number
  humidity: number
  windSpeed: number
  windDir: number
  pty: number
  sky: number
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

// sky: 1=맑음 3=구름많음 4=흐림 (초단기예보 SKY 코드)
export function ptyLabel(pty: number, sky = 1): { text: string; icon: string } {
  if (pty > 0) {
    const map: Record<number, { text: string; icon: string }> = {
      1: { text: "비", icon: "🌧️" },
      2: { text: "비/눈", icon: "🌨️" },
      3: { text: "눈", icon: "❄️" },
      5: { text: "빗방울", icon: "🌦️" },
      6: { text: "빗방울·눈날림", icon: "🌨️" },
      7: { text: "눈날림", icon: "❄️" },
    }
    return map[pty] ?? { text: "알 수 없음", icon: "🌫️" }
  }
  // PTY=0: 강수 없음 → SKY 코드로 날씨 판단
  if (sky === 4) return { text: "흐림",     icon: "☁️" }
  if (sky === 3) return { text: "구름많음", icon: "⛅" }
  return               { text: "맑음",     icon: "☀️" }
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

// 초단기예보(getUltraSrtFcst)에서 SKY 코드 조회
// PTY=0일 때 맑음/구름많음/흐림 구분을 위해 필요
async function fetchSky(key: string): Promise<number> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, "0")
  // 초단기예보는 매 시각 30분 기준, 45분 후 발표
  const hour = kst.getUTCHours()
  const baseHour = kst.getUTCMinutes() >= 45 ? hour : hour - 1
  let dateRef = kst
  let h = baseHour
  if (h < 0) { h = 23; dateRef = new Date(kst.getTime() - 86400000) }
  const baseDate = `${dateRef.getUTCFullYear()}${pad(dateRef.getUTCMonth() + 1)}${pad(dateRef.getUTCDate())}`
  const baseTime = `${pad(h)}30`

  const params = new URLSearchParams({
    serviceKey: key, dataType: "JSON", numOfRows: "60", pageNo: "1",
    base_date: baseDate, base_time: baseTime, nx: "57", ny: "74",
  })
  try {
    const res = await fetch(
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?${params}`,
      { next: { revalidate: 600 } }
    )
    if (!res.ok) return 1
    const json = await res.json()
    const resultCode = json?.response?.header?.resultCode ?? json?.header?.resultCode
    if (resultCode !== "00") return 1
    const items: Array<{ category: string; fcstValue: string }> =
      json?.response?.body?.items?.item ?? []
    const skyItem = items.find((i) => i.category === "SKY")
    return skyItem ? parseInt(skyItem.fcstValue) : 1
  } catch { return 1 }
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

// 서버 인스턴스 메모리에 직전 정상값 보관 — 기상청 호출 실패 시 빈 화면 대신 직전값 노출
let _lastGoodWando: { data: WeatherData; at: number } | null = null
const WEATHER_STALE_MAX_MS = 3 * 60 * 60 * 1000  // 직전값 허용 최대 3시간

export async function getWandoWeather(): Promise<WeatherData | null> {
  const fresh = await fetchWandoWeatherFresh()
  if (fresh) {
    _lastGoodWando = { data: fresh, at: Date.now() }
    return fresh
  }
  // 신규 호출 실패(한도초과·NO_DATA·일시오류) 시 직전 정상값으로 빈 화면 방지
  if (_lastGoodWando && Date.now() - _lastGoodWando.at < WEATHER_STALE_MAX_MS) {
    return _lastGoodWando.data
  }
  return null
}

async function fetchWandoWeatherFresh(): Promise<WeatherData | null> {
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
    const [res, waveHeight, sky] = await Promise.all([
      fetch(url, { next: { revalidate: 600 } }),
      fetchWaveHeight(key),
      fetchSky(key),
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
