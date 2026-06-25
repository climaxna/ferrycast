import { cache } from "react"

// ────────────────────────────────────────────────────────────
// TAGO 여객선 운항정보 — 도착 예정시각 enrich 전용 (MTIS 보충)
//
// MTIS(B554035)는 출발시각·결항만 제공하고 도착시각이 없다.
// TAGO 여객선 API(1613000/DmstcShipNvgInfo)는 depPlandTime + arrPlandTime을
// 모두 제공하므로, 도착 예정시각만 여기서 가져와 MTIS 시간표에 매핑한다.
//
// 설계: 호출 실패/비정상 데이터는 빈 결과로 흘려보내 MTIS 화면에 영향 없음.
// ────────────────────────────────────────────────────────────

const TAGO_BASE = "https://apis.data.go.kr/1613000/DmstcShipNvgInfo"

interface TagoItem {
  depPlaceNm: string
  arrPlaceNm: string
  depPlandTime: number  // YYYYMMDDHHMM
  arrPlandTime: number  // YYYYMMDDHHMM
  vihicleNm?: string
}

// YYYYMMDDHHMM(number) → "HH:MM"
function toHHMM(ts: number): string {
  const s = String(ts)
  return `${s.slice(8, 10)}:${s.slice(10, 12)}`
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

// 선박명 정규화 (괄호 톤수·공백 제거) 후 포함관계 비교.
//   "한일골드스텔라" vs "골드스텔라" → 일치 / "대한호" vs "대한호(700톤)" → 일치
//   "슬로시티청산도호" vs "섬사랑7호"(행정선) → 불일치 → 도착시각 거부
function normalizeShip(s: string): string {
  return (s || "").replace(/\(.*?\)/g, "").replace(/\s/g, "")
}
function shipMatches(tagoShip: string, allowed: string[]): boolean {
  if (!allowed.length) return true  // 허용목록 미지정 → 가드 비활성
  const b = normalizeShip(tagoShip)
  if (!b) return false
  return allowed.some((m) => {
    const a = normalizeShip(m)
    return !!a && (a.includes(b) || b.includes(a))
  })
}

// 항구명 → nodeId (749개, 거의 안 변함 → 장기 캐시)
export const getPortNodeMap = cache(async (): Promise<Map<string, string>> => {
  const key = process.env.DATAGOKR_API_KEY
  const map = new Map<string, string>()
  if (!key) return map
  try {
    const params = new URLSearchParams({
      serviceKey: key, pageNo: "1", numOfRows: "1000", _type: "json",
    })
    const res = await fetch(`${TAGO_BASE}/GetPortList?${params}`, { next: { revalidate: 86400 } })
    if (!res.ok) return map
    let json: unknown
    try { json = await res.json() } catch { return map }
    const j = json as { response?: { header?: { resultCode?: string }; body?: { items?: { item?: unknown } } } }
    if (j?.response?.header?.resultCode !== "00") return map
    const raw = j?.response?.body?.items?.item
    const items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as Array<{ nodeId?: string; nodeNm?: string }>
    for (const it of items) {
      if (it.nodeNm && it.nodeId) map.set(it.nodeNm, it.nodeId)
    }
  } catch { /* 빈 맵 → enrich 생략 */ }
  return map
})

// 키워드(부분일치)로 TAGO 항구명들을 해석. 지역 config의 keyword → 실제 노드명.
// 예: ["포항"] → ["포항", "포항영일만"], ["울릉"] → ["울릉도","울릉_사동","울릉_도동"...]
export async function findPortNames(substrings: string[]): Promise<string[]> {
  const portMap = await getPortNodeMap()
  const out = new Set<string>()
  for (const name of portMap.keys()) {
    if (substrings.some((s) => name.includes(s))) out.add(name)
  }
  return [...out]
}

// 한 노드의 당일 출항편 (revalidate 300 → 사용자수 무관 상한 고정)
const getNodeDepartures = cache(async (nodeId: string, date: string): Promise<TagoItem[]> => {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return []
  try {
    const params = new URLSearchParams({
      serviceKey: key, pageNo: "1", numOfRows: "200", _type: "json",
      depNodeId: nodeId, depPlandTime: date,
    })
    const res = await fetch(`${TAGO_BASE}/GetShipOpratInfoList?${params}`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    let json: unknown
    try { json = await res.json() } catch { return [] }
    const j = json as { response?: { header?: { resultCode?: string }; body?: { items?: { item?: unknown } } } }
    if (j?.response?.header?.resultCode !== "00") return []
    const raw = j?.response?.body?.items?.item
    return (Array.isArray(raw) ? raw : raw ? [raw] : []) as TagoItem[]
  } catch {
    return []
  }
})

// 노드명 목록을 조회해 groupKey별 (출발HH:MM → 도착HH:MM) 룩업 함수를 만든다.
// groupOf: TAGO 항구명 한 쌍(출발항, 도착항)을 노선 groupKey로 매핑 (없으면 null).
// 반환: (groupKey, times[]) → { "HH:MM": "도착HH:MM" } (±5분 허용 매칭)
export async function buildArrivalLookup(
  nodeNames: string[],
  date: string,
  groupOf: (depNm: string, arrNm: string) => string | null,
): Promise<(groupKey: string, times: string[], allowedShips?: string[]) => Record<string, string>> {
  const portMap = await getPortNodeMap()
  const nodeIds = nodeNames
    .map((n) => portMap.get(n))
    .filter((id): id is string => !!id)

  // groupKey → [{ depMin, arr, ship }]
  const byGroup: Record<string, Array<{ depMin: number; arr: string; ship: string }>> = {}

  if (nodeIds.length) {
    const results = await Promise.allSettled(nodeIds.map((id) => getNodeDepartures(id, date)))
    for (const r of results) {
      if (r.status !== "fulfilled") continue
      for (const it of r.value) {
        const gk = groupOf(it.depPlaceNm, it.arrPlaceNm)
        if (!gk) continue
        const dep = toHHMM(it.depPlandTime)
        const arr = toHHMM(it.arrPlandTime)
        let dur = toMinutes(arr) - toMinutes(dep)
        if (dur < 0) dur += 1440  // 익일 도착 보정
        // 비정상 데이터 방어 (10분 미만/25시간 초과 → 신뢰 불가)
        if (dur < 10 || dur > 1500) continue
        if (!byGroup[gk]) byGroup[gk] = []
        byGroup[gk].push({ depMin: toMinutes(dep), arr, ship: it.vihicleNm ?? "" })
      }
    }
  }

  // allowedShips: MTIS 운영 선박 목록. 지정 시 그 선박편만 신뢰(행정선 오데이터 차단)
  return (groupKey: string, times: string[], allowedShips: string[] = []): Record<string, string> => {
    const entries = byGroup[groupKey]
    if (!entries || !entries.length) return {}
    const out: Record<string, string> = {}
    for (const t of times) {
      const tMin = toMinutes(t)
      // 출발시각이 ±5분 이내, 선박명이 일치하는 가장 가까운 편의 도착시각
      let best: { diff: number; arr: string } | null = null
      for (const e of entries) {
        if (!shipMatches(e.ship, allowedShips)) continue
        const diff = Math.abs(e.depMin - tMin)
        if (diff <= 5 && (!best || diff < best.diff)) best = { diff, arr: e.arr }
      }
      if (best) out[t] = best.arr
    }
    return out
  }
}
