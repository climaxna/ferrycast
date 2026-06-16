import type { WandoRoute, RouteStatus } from "./types"

// TAGO nodeId
const WANDO_NODE = "SEA31020"
const WANDO_HWAHEUNGPO = "SEA31022"

// 출발 탭: 완도에서 떠나는 항로 (TAGO arrPlaceNm 기준)
const DEP_DEST: Record<string, { label: string; priority: number }> = {
  "제주도":           { label: "제주",       priority: 1 },
  "청산도":           { label: "청산도",     priority: 2 },
  "소안도":           { label: "소안도",     priority: 3 },
  "노화_동천 보길":   { label: "보길도·노화", priority: 4 },
}

// 도착 탭: 완도로 돌아오는 항로 (역방향 depNodeId → arrFilter)
const ARR_QUERIES = [
  { nodeId: "SEA10090", label: "제주",       arrFilter: "완도",        ferryKeys: ["제주도"],        priority: 1 },
  { nodeId: "SEA35560", label: "청산도",     arrFilter: "완도",        ferryKeys: ["청산도"],        priority: 2 },
  { nodeId: "SEA33830", label: "소안도",     arrFilter: "완도_화흥포", ferryKeys: ["소안도"],        priority: 3 },
  { nodeId: "SEA31891", label: "보길도·노화", arrFilter: "완도_화흥포", ferryKeys: ["노화_동천 보길"], priority: 4 },
] as const

// KOMSA 조회용 선박명 (TAGO vihicleNm 기준 — 앞부분 일치로 필터됨)
const ROUTE_FERRIES: Record<string, string[]> = {
  "제주도":         ["실버클라우드", "골드스텔라"],
  "청산도":         ["슬로시티청산도호", "청산아일랜드"],
  "소안도":         ["대한호"],
  "노화_동천 보길": ["대한호"],
}

// ────────────────────────────────────────────────
// TAGO 운항정보 조회 (공통)
// ────────────────────────────────────────────────
async function fetchNodeRoutes(key: string, nodeId: string, date: string) {
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
  return (Array.isArray(raw) ? raw : [raw]) as Array<{
    arrPlaceNm: string
    depPlandTime: number
    arrPlandTime: number
    vihicleNm: string
  }>
}

function parseTime(ts: number | string): string | null {
  const s = String(ts)
  if (s.length < 12) return null
  return `${s.slice(8, 10)}:${s.slice(10, 12)}`
}

// ────────────────────────────────────────────────
// KOMSA 결항 조회
// ────────────────────────────────────────────────
async function fetchKomsaStatus(key: string, date: string, ferryNames: string[]): Promise<RouteStatus> {
  for (const ferryNm of ferryNames) {
    try {
      const q = new URLSearchParams({
        serviceKey: key, dataType: "JSON", numOfRows: "50", pageNo: "1",
        rlvtYmd: date, psnshpNm: ferryNm,
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
      if (items.some((it) => it.nvg_stts_nm === "결항")) return "cancelled"
      return "operating"
    } catch { continue }
  }
  return "operating"
}

// ────────────────────────────────────────────────
// 완도 출발 항로
// ────────────────────────────────────────────────
export async function getWandoRoutes(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return { routes: STATIC_DEP, isLive: false }

  try {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")

    const [mainItems, hwaItems] = await Promise.all([
      fetchNodeRoutes(key, WANDO_NODE, date),
      fetchNodeRoutes(key, WANDO_HWAHEUNGPO, date),
    ])
    const allItems = [...mainItems, ...hwaItems]
    if (!allItems.length) return { routes: STATIC_DEP, isLive: false }

    const grouped: Record<string, { times: string[]; ships: Set<string> }> = {}
    for (const it of allItems) {
      if (!DEP_DEST[it.arrPlaceNm]) continue
      if (!grouped[it.arrPlaceNm]) grouped[it.arrPlaceNm] = { times: [], ships: new Set() }
      const t = parseTime(it.depPlandTime)
      if (t) grouped[it.arrPlaceNm].times.push(t)
      if (it.vihicleNm) grouped[it.arrPlaceNm].ships.add(it.vihicleNm)
    }
    if (!Object.keys(grouped).length) return { routes: STATIC_DEP, isLive: false }

    const destKeys = Object.keys(grouped)
    const statuses = await Promise.all(
      destKeys.map((k) => fetchKomsaStatus(key, date, ROUTE_FERRIES[k] ?? []))
    )

    const routes: WandoRoute[] = destKeys
      .sort((a, b) => (DEP_DEST[a]?.priority ?? 99) - (DEP_DEST[b]?.priority ?? 99))
      .map((destKey, i) => ({
        id: `dep-${destKey}`,
        to: DEP_DEST[destKey].label,
        operator: [...grouped[destKey].ships].join(" · "),
        times: [...new Set(grouped[destKey].times)].sort(),
        status: statuses[destKeys.indexOf(destKey)],
        isLive: true,
      }))

    return { routes, isLive: true }
  } catch {
    return { routes: STATIC_DEP, isLive: false }
  }
}

// ────────────────────────────────────────────────
// 완도 도착 항로 (역방향 조회)
// ────────────────────────────────────────────────
export async function getWandoArrivals(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return { routes: STATIC_ARR, isLive: false }

  try {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")

    const results = await Promise.all(
      ARR_QUERIES.map(async ({ nodeId, label, arrFilter, ferryKeys, priority }) => {
        const items = await fetchNodeRoutes(key, nodeId, date)
        const filtered = items.filter((it) => it.arrPlaceNm === arrFilter)
        if (!filtered.length) return null

        const times = filtered
          .map((it) => parseTime(it.depPlandTime))
          .filter(Boolean) as string[]
        const ships = new Set(filtered.map((it) => it.vihicleNm).filter(Boolean))
        const ferryNames = ferryKeys.flatMap((k) => ROUTE_FERRIES[k] ?? [])
        const status = await fetchKomsaStatus(key, date, ferryNames)

        return {
          id: `arr-${nodeId}`,
          to: "완도",
          from: label,
          operator: [...ships].join(" · "),
          times: [...new Set(times)].sort(),
          status,
          isLive: true,
          _priority: priority,
        }
      })
    )

    const valid = results.filter(
      (r): r is NonNullable<typeof r> => r !== null
    )
    valid.sort((a, b) => (a._priority ?? 99) - (b._priority ?? 99))
    const routes: WandoRoute[] = valid.map(({ _priority: _, ...r }) => r)

    if (!routes.length) return { routes: STATIC_ARR, isLive: false }
    return { routes, isLive: true }
  } catch {
    return { routes: STATIC_ARR, isLive: false }
  }
}

// ────────────────────────────────────────────────
// 정적 fallback
// ────────────────────────────────────────────────
const STATIC_DEP: WandoRoute[] = [
  { id: "dep-jeju",    to: "제주",       operator: "청해진해운", times: ["02:30", "09:20", "15:00"],                status: "unknown", isLive: false },
  { id: "dep-chsnd",   to: "청산도",     operator: "남해고속",   times: ["07:00", "08:30", "11:00", "13:00", "15:00"], status: "unknown", isLive: false },
  { id: "dep-soando",  to: "소안도",     operator: "청해진해운", times: ["08:30", "13:00", "15:30"],                status: "unknown", isLive: false },
  { id: "dep-bogil",   to: "보길도·노화", operator: "청해진해운", times: ["07:20", "09:00", "13:00", "15:00"],        status: "unknown", isLive: false },
]

const STATIC_ARR: WandoRoute[] = [
  { id: "arr-jeju",   to: "완도", from: "제주",       operator: "청해진해운", times: ["08:00", "08:40", "16:00", "19:30"], status: "unknown", isLive: false },
  { id: "arr-chsnd",  to: "완도", from: "청산도",     operator: "남해고속",   times: ["06:50", "09:00", "11:30", "13:00", "15:00", "18:00"], status: "unknown", isLive: false },
  { id: "arr-soando", to: "완도", from: "소안도",     operator: "청해진해운", times: ["07:24", "07:30", "08:45", "09:12", "10:12", "11:12", "12:12", "13:12", "14:12", "15:12", "16:12", "17:12", "18:12", "19:04"], status: "unknown", isLive: false },
  { id: "arr-bogil",  to: "완도", from: "보길도·노화", operator: "청해진해운", times: ["07:45", "09:47", "16:14"], status: "unknown", isLive: false },
]
