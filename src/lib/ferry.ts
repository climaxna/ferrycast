import type { WandoRoute } from "./types"

// TAGO 국내선박운항정보서비스 nodeId 상수
const WANDO_NODE = "SEA31020"        // 완도항 (메인)
const WANDO_HWAHEUNGPO = "SEA31022" // 완도_화흥포 (보길도·소안도 행)

// MVP 메인 노선 목적지 필터 (섬→섬 내부 항로 제외)
const MAIN_DEST: Record<string, { label: string; priority: number }> = {
  "제주도":    { label: "제주",   priority: 1 },
  "청산도":    { label: "청산도", priority: 2 },
  "소안도":    { label: "소안도", priority: 3 },
  "노화_동천 보길": { label: "보길도·노화", priority: 4 },
}

function parseTime(depPlandTime: number | string): string | null {
  const s = String(depPlandTime)
  if (s.length < 12) return null
  return `${s.slice(8, 10)}:${s.slice(10, 12)}`
}

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

export async function getWandoRoutes(): Promise<{
  routes: WandoRoute[]
  isLive: boolean
}> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return { routes: STATIC_ROUTES, isLive: false }

  try {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")

    // 완도항 + 화흥포 병렬 조회
    const [mainItems, hwaItems] = await Promise.all([
      fetchNodeRoutes(key, WANDO_NODE, date),
      fetchNodeRoutes(key, WANDO_HWAHEUNGPO, date),
    ])

    const allItems = [...mainItems, ...hwaItems]
    if (!allItems.length) return { routes: STATIC_ROUTES, isLive: false }

    // 목적지별 집계
    const grouped: Record<string, { times: string[]; ships: Set<string> }> = {}
    for (const it of allItems) {
      const destKey = it.arrPlaceNm
      if (!MAIN_DEST[destKey]) continue
      if (!grouped[destKey]) grouped[destKey] = { times: [], ships: new Set() }
      const t = parseTime(it.depPlandTime)
      if (t) grouped[destKey].times.push(t)
      if (it.vihicleNm) grouped[destKey].ships.add(it.vihicleNm)
    }

    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (MAIN_DEST[a]?.priority ?? 99) - (MAIN_DEST[b]?.priority ?? 99))
      .map(([destKey, g]) => ({
        id: `wando-${destKey}`,
        to: MAIN_DEST[destKey].label,
        operator: [...g.ships].join(" · "),
        times: [...new Set(g.times)].sort(),
        status: "operating" as const,
        isLive: true,
      }))

    if (!routes.length) return { routes: STATIC_ROUTES, isLive: false }
    return { routes, isLive: true }
  } catch {
    return { routes: STATIC_ROUTES, isLive: false }
  }
}

// 정기 시간표 fallback (TAGO API 실패 시)
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
