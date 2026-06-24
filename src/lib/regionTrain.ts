import type { RegionConfig } from "@/config/regions"

const BASE = "https://apis.data.go.kr/1613000/TrainInfo"

export interface TrainDirection {
  label: string      // "포항 → 서울"
  grade: string      // 대표 등급 "KTX"
  times: string[]    // ["05:35", ...] HH:MM 정렬
}

export interface RegionTrainData {
  stationName: string
  outbound: TrainDirection   // 지역 → 허브
  inbound: TrainDirection    // 허브 → 지역
  fare?: number
  bookingUrl?: string
  isLive: boolean
}

interface TrainItem {
  depplandtime: string  // YYYYMMDDHHMM
  traingradename: string
}

function kstYmd(): string {
  const k = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${k.getUTCFullYear()}${p(k.getUTCMonth() + 1)}${p(k.getUTCDate())}`
}

function hhmm(plandtime: string): string {
  const s = String(plandtime)
  return `${s.slice(8, 10)}:${s.slice(10, 12)}`
}

async function fetchTrains(
  key: string,
  depId: string,
  arrId: string,
  ymd: string,
): Promise<{ times: string[]; grade: string } | null> {
  const params = new URLSearchParams({
    serviceKey: key, _type: "json", numOfRows: "200", pageNo: "1",
    depPlaceId: depId, arrPlaceId: arrId, depPlandTime: ymd,
  })
  try {
    const res = await fetch(`${BASE}/GetStrtpntAlocFndTrainInfo?${params}`, {
      next: { revalidate: 1800 },  // 시간표는 하루 고정 — 30분 캐시
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json?.response?.header?.resultCode !== "00") return null
    const raw = json?.response?.body?.items?.item
    const items: TrainItem[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    if (!items.length) return null
    const times = [...new Set(items.map((it) => hhmm(it.depplandtime)))].sort()
    return { times, grade: items[0]?.traingradename ?? "KTX" }
  } catch {
    return null
  }
}

export async function getTrainsForRegion(config: RegionConfig): Promise<RegionTrainData | null> {
  const t = config.train
  if (!t) return null

  const empty = (label: string): TrainDirection => ({ label, grade: "KTX", times: [] })
  const fallback = (): RegionTrainData => ({
    stationName: t.stationName,
    outbound: empty(`${t.localName} → ${t.hubName}`),
    inbound: empty(`${t.hubName} → ${t.localName}`),
    fare: t.fareHint,
    bookingUrl: t.bookingUrl,
    isLive: false,
  })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const ymd = kstYmd()
    const [out, inb] = await Promise.all([
      fetchTrains(key, t.localId, t.hubId, ymd),
      fetchTrains(key, t.hubId, t.localId, ymd),
    ])
    if (!out && !inb) return fallback()
    return {
      stationName: t.stationName,
      outbound: { label: `${t.localName} → ${t.hubName}`, grade: out?.grade ?? "KTX", times: out?.times ?? [] },
      inbound: { label: `${t.hubName} → ${t.localName}`, grade: inb?.grade ?? "KTX", times: inb?.times ?? [] },
      fare: t.fareHint,
      bookingUrl: t.bookingUrl,
      isLive: true,
    }
  } catch {
    return fallback()
  }
}
