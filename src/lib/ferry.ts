import type { WandoRoute, RouteStatus } from "./types"

// TAGO nodeId
const WANDO_NODE = "SEA31020"
const WANDO_HWAHEUNGPO = "SEA31022"

// MVP 표시 목적지 (TAGO arrPlaceNm → 표시 레이블)
const MAIN_DEST: Record<string, { label: string; priority: number }> = {
  "제주도":           { label: "제주",       priority: 1 },
  "청산도":           { label: "청산도",     priority: 2 },
  "소안도":           { label: "소안도",     priority: 3 },
  "노화_동천 보길":   { label: "보길도·노화", priority: 4 },
}

// 각 목적지별 대표 선박명 (KOMSA 결항 조회용 — TAGO vihicleNm 기준)
const ROUTE_FERRIES: Record<string, string[]> = {
  "제주도":         ["실버클라우드", "골드스텔라"],
  "청산도":         ["슬로시티청산도호", "청산아일랜드"],
  "소안도":         ["대한호"],
  "노화_동천 보길": ["대한호"],
}

// ────────────────────────────────────────────────
// TAGO 운항정보 조회
// ────────────────────────────────────────────────
async function fetchNodeRoutes(
  key: string,
  nodeId: string,
  date: string
): Promise<Array<{ arrPlaceNm: string; depPlandTime: number; vihicleNm: string }>> {
  const url =
    `https://apis.data.go.kr/1613000/DmstcShipNvgInfo/GetShipOpratInfoList` +
    `?serviceKey=${key}&_type=json&numOfRows=100&pageNo=1` +
    `&depNodeId=${nodeId}&depPlandTime=${date}`
  const res = await fetch(url, { next: { revalidate: 1800 } })
  if (!res.ok) return []
  const json = await res.json()
  if (json?.response?.header?.resultCode !== "00") return []
  const raw = json?.response?.body?.items?.item
  if (!raw) return []
  return Array.isArray(raw) ? raw : [raw]
}

function parseTime(ts: number | string): string | null {
  const s = String(ts)
  if (s.length < 12) return null
  return `${s.slice(8, 10)}:${s.slice(10, 12)}`
}

// ────────────────────────────────────────────────
// KOMSA 결항 조회
// ────────────────────────────────────────────────
async function fetchKomsaStatus(
  key: string,
  date: string,
  ferryNames: string[]
): Promise<RouteStatus> {
  for (const ferryNm of ferryNames) {
    try {
      const q = new URLSearchParams({
        serviceKey: key,
        dataType: "JSON",
        numOfRows: "50",
        pageNo: "1",
        rlvtYmd: date,
        psnshpNm: ferryNm,
      })
      const res = await fetch(
        `https://apis.data.go.kr/B554035/ferry-route-info-v4/get-ferry-route-info-v4?${q}`,
        { next: { revalidate: 300 } }
      )
      if (!res.ok) continue
      const json = await res.json()
      if (json?.response?.header?.resultCode !== "200") continue

      const raw = json?.response?.body?.items?.item
      if (!raw) continue
      const items = Array.isArray(raw) ? raw : [raw]

      // 결항 상태가 하나라도 있으면 결항
      if (items.some((it) => it.nvg_stts_nm === "결항")) {
        return "cancelled"
      }
      // KOMSA 데이터가 있으면 운항 확인됨
      return "operating"
    } catch {
      continue
    }
  }
  // KOMSA 데이터 없음 → TAGO로 운항 중
  return "operating"
}

// ────────────────────────────────────────────────
// 메인 export
// ────────────────────────────────────────────────
export async function getWandoRoutes(): Promise<{
  routes: WandoRoute[]
  isLive: boolean
}> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return { routes: STATIC_ROUTES, isLive: false }

  try {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")

    // TAGO: 완도항 + 화흥포 병렬 조회
    const [mainItems, hwaItems] = await Promise.all([
      fetchNodeRoutes(key, WANDO_NODE, date),
      fetchNodeRoutes(key, WANDO_HWAHEUNGPO, date),
    ])
    const allItems = [...mainItems, ...hwaItems]
    if (!allItems.length) return { routes: STATIC_ROUTES, isLive: false }

    // 목적지별 집계
    const grouped: Record<string, { times: string[]; ships: Set<string> }> = {}
    for (const it of allItems) {
      if (!MAIN_DEST[it.arrPlaceNm]) continue
      if (!grouped[it.arrPlaceNm]) grouped[it.arrPlaceNm] = { times: [], ships: new Set() }
      const t = parseTime(it.depPlandTime)
      if (t) grouped[it.arrPlaceNm].times.push(t)
      if (it.vihicleNm) grouped[it.arrPlaceNm].ships.add(it.vihicleNm)
    }
    if (!Object.keys(grouped).length) return { routes: STATIC_ROUTES, isLive: false }

    // KOMSA 결항 여부 병렬 조회
    const destKeys = Object.keys(grouped)
    const statuses = await Promise.all(
      destKeys.map((destKey) =>
        fetchKomsaStatus(key, date, ROUTE_FERRIES[destKey] ?? [])
      )
    )

    const routes: WandoRoute[] = destKeys
      .sort((a, b) => (MAIN_DEST[a]?.priority ?? 99) - (MAIN_DEST[b]?.priority ?? 99))
      .map((destKey, i) => ({
        id: `wando-${destKey}`,
        to: MAIN_DEST[destKey].label,
        operator: [...grouped[destKey].ships].join(" · "),
        times: [...new Set(grouped[destKey].times)].sort(),
        status: statuses[destKeys.indexOf(destKey)],
        isLive: true,
      }))

    return { routes, isLive: true }
  } catch {
    return { routes: STATIC_ROUTES, isLive: false }
  }
}

// 정적 fallback
const STATIC_ROUTES: WandoRoute[] = [
  {
    id: "wando-jeju",
    to: "제주",
    operator: "청해진해운",
    times: ["02:30", "09:20", "15:00"],
    status: "unknown",
    isLive: false,
  },
  {
    id: "wando-cheongsando",
    to: "청산도",
    operator: "남해고속",
    times: ["07:00", "08:30", "11:00", "13:00", "15:00"],
    status: "unknown",
    isLive: false,
  },
  {
    id: "wando-soando",
    to: "소안도",
    operator: "청해진해운",
    times: ["08:30", "13:00", "15:30"],
    status: "unknown",
    isLive: false,
  },
  {
    id: "wando-bogil",
    to: "보길도·노화",
    operator: "청해진해운",
    times: ["07:20", "09:00", "13:00", "15:00"],
    status: "unknown",
    isLive: false,
  },
]
