import type { RegionConfig } from "@/config/regions"

const BASE = "https://apis.data.go.kr/1613000/TrainInfo"

export interface TrainRun {
  dep: string         // 출발 "05:35"
  arr: string         // 도착 "08:01"
  durationMin: number // 소요(분)
  grade: string       // "KTX-산천(A-type)"
  trainNo: string
}

export interface TrainDirection {
  fromName: string     // "포항"
  toName: string       // "서울"
  fromStation: string  // 지도 검색용 "포항역"
  toStation: string    // "서울역"
  runs: TrainRun[]     // 출발시각 정렬
}

export interface RegionTrainData {
  stationName: string  // "포항역"
  outbound: TrainDirection   // 지역 → 허브 (출발 탭)
  inbound: TrainDirection    // 허브 → 지역 (도착 탭)
  fare?: number
  bookingUrl?: string
  isLive: boolean
}

interface TrainItem {
  depplandtime: string  // YYYYMMDDHHMM
  arrplandtime: string
  traingradename: string
  trainno: string
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

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

async function fetchRuns(
  key: string,
  depId: string,
  arrId: string,
  ymd: string,
): Promise<TrainRun[] | null> {
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

    const byDep = new Map<string, TrainRun>()
    for (const it of items) {
      const dep = hhmm(it.depplandtime)
      if (byDep.has(dep)) continue   // 동일 출발시각 중복 제거
      const arr = hhmm(it.arrplandtime)
      let durationMin = toMin(arr) - toMin(dep)
      if (durationMin < 0) durationMin += 1440
      byDep.set(dep, { dep, arr, durationMin, grade: it.traingradename ?? "KTX", trainNo: String(it.trainno ?? "") })
    }
    return [...byDep.values()].sort((a, b) => toMin(a.dep) - toMin(b.dep))
  } catch {
    return null
  }
}

export async function getTrainsForRegion(config: RegionConfig): Promise<RegionTrainData | null> {
  const t = config.train
  if (!t) return null

  const dir = (fromName: string, toName: string, runs: TrainRun[]): TrainDirection => ({
    fromName, toName, fromStation: `${fromName}역`, toStation: `${toName}역`, runs,
  })
  const fallback = (): RegionTrainData => ({
    stationName: t.stationName,
    outbound: dir(t.localName, t.hubName, []),
    inbound: dir(t.hubName, t.localName, []),
    fare: t.fareHint,
    bookingUrl: t.bookingUrl,
    isLive: false,
  })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const ymd = kstYmd()
    const [out, inb] = await Promise.all([
      fetchRuns(key, t.localId, t.hubId, ymd),
      fetchRuns(key, t.hubId, t.localId, ymd),
    ])
    if (!out && !inb) return fallback()
    return {
      stationName: t.stationName,
      outbound: dir(t.localName, t.hubName, out ?? []),
      inbound: dir(t.hubName, t.localName, inb ?? []),
      fare: t.fareHint,
      bookingUrl: t.bookingUrl,
      isLive: true,
    }
  } catch {
    return fallback()
  }
}
