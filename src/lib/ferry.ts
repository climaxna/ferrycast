import type { WandoRoute, RouteStatus, FareInfo } from "./types"

const MTIS_BASE = "https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2"

const TERMINAL_MAIN = "완도여객선터미널"
const TERMINAL_HWAHEUNGPO = "화흥포항"

const FARE_MAP: Record<string, FareInfo> = {
  "cheongsando": { adult: 8700, teen: 7900, child: 4200, carSmall: 21000, carRegular: 25000 },
}

const FARE_URL_MAP: Record<string, string> = {
  "cheongsando":      "https://cheongsannh.nonghyup.com/user/indexSub.do?codyMenuSeq=1048386239&siteId=cheongsannh",
  "hwaheungpo-route": "https://island.theksa.co.kr",
}

// ────────────────────────────────────────────────
// MTIS Schedule API
// ────────────────────────────────────────────────
interface MtisItem {
  sail_tm: string       // HHMM without leading zero (e.g. "700" = 07:00)
  oport_nm: string      // departure port name
  dest_nm: string       // destination port name
  nvg_stts_nm: string   // "결항" | "출항전" | ...
  psnshp_nm: string     // ship name
}

// "700" → "07:00", "1430" → "14:30"
function parseSailTime(raw: string): string {
  const s = raw.padStart(4, "0")
  return `${s.slice(0, 2)}:${s.slice(2)}`
}

async function fetchMtisAll(key: string, date: string): Promise<MtisItem[]> {
  const params = new URLSearchParams({
    serviceKey: key, pageNo: "1", numOfRows: "200",
    dataType: "JSON", rlvtYmd: date,
  })
  const res = await fetch(`${MTIS_BASE}?${params}`, { next: { revalidate: 300 } })
  if (!res.ok) return []
  const json = await res.json()
  if (json?.response?.header?.resultCode !== "200") return []
  const raw = json?.response?.body?.items?.item
  if (!raw) return []
  return Array.isArray(raw) ? raw : [raw]
}

// ────────────────────────────────────────────────
// 노선 그룹 설정
// ────────────────────────────────────────────────
interface DepGroupCfg {
  label: string; priority: number; terminal: string
  fare?: FareInfo; fareUrl?: string
}
interface ArrGroupCfg extends DepGroupCfg { islandTerminal: string }

const DEP_CFG: Record<string, DepGroupCfg> = {
  "jeju":             { label: "제주",             priority: 1, terminal: TERMINAL_MAIN },
  "cheongsando":      { label: "청산도",            priority: 2, terminal: TERMINAL_MAIN, fare: FARE_MAP["cheongsando"], fareUrl: FARE_URL_MAP["cheongsando"] },
  "hwaheungpo-route": { label: "소안도·보길도·노화", priority: 3, terminal: TERMINAL_HWAHEUNGPO, fareUrl: FARE_URL_MAP["hwaheungpo-route"] },
}

const ARR_CFG: Record<string, ArrGroupCfg> = {
  "jeju":             { label: "제주",   priority: 1, terminal: TERMINAL_MAIN,       islandTerminal: "제주항 연안여객터미널" },
  "cheongsando":      { label: "청산도", priority: 2, terminal: TERMINAL_MAIN,       islandTerminal: "도청항", fare: FARE_MAP["cheongsando"], fareUrl: FARE_URL_MAP["cheongsando"] },
  "hwaheungpo-route": { label: "소안도", priority: 3, terminal: TERMINAL_HWAHEUNGPO, islandTerminal: "소안항여객터미널", fareUrl: FARE_URL_MAP["hwaheungpo-route"] },
}

function depGroupKey(item: MtisItem): string | null {
  const { oport_nm: o, dest_nm: d } = item
  if (o.includes("완도") && d.includes("제주")) return "jeju"
  if (o.includes("완도") && d.includes("청산")) return "cheongsando"
  if (o.includes("화흥") && (d.includes("소안") || d.includes("보길") || d.includes("노화"))) return "hwaheungpo-route"
  return null
}

function arrGroupKey(item: MtisItem): string | null {
  const { oport_nm: o, dest_nm: d } = item
  if (o.includes("제주") && (d.includes("완도") || d.includes("화흥"))) return "jeju"
  if (o.includes("청산") && (d.includes("완도") || d.includes("화흥"))) return "cheongsando"
  if ((o.includes("소안") || o.includes("보길") || o.includes("노화")) && (d.includes("완도") || d.includes("화흥"))) return "hwaheungpo-route"
  return null
}

function groupStatus(items: MtisItem[]): RouteStatus {
  if (items.some((it) => it.nvg_stts_nm === "결항")) return "cancelled"
  if (items.length > 0) return "operating"
  return "unknown"
}

// YYYYMMDD → 다음날 YYYYMMDD
function nextDay(date: string): string {
  const y = +date.slice(0, 4), m = +date.slice(4, 6), d = +date.slice(6, 8)
  const dt = new Date(Date.UTC(y, m - 1, d + 1))
  return dt.toISOString().slice(0, 10).replace(/-/g, "")
}

// 내일 스케줄을 groupKey별 편수로 집계 (결항 편 제외)
// keyFn: depGroupKey(출발) 또는 arrGroupKey(도착)
async function fetchTomorrowCounts(
  key: string,
  todayDate: string,
  keyFn: (item: MtisItem) => string | null,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  try {
    const items = await fetchMtisAll(key, nextDay(todayDate))
    for (const it of items) {
      if (it.nvg_stts_nm === "결항") continue
      const gk = keyFn(it)
      if (!gk) continue
      counts[gk] = (counts[gk] ?? 0) + 1
    }
  } catch {
    // 내일 데이터는 부가 정보 — 실패해도 오늘 데이터에 영향 없음
  }
  return counts
}

// ────────────────────────────────────────────────
// 완도 출발 항로
// ────────────────────────────────────────────────
export async function getWandoRoutes(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: applySeasonalCheongsando(STATIC_DEP, kst, "dep"), isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrowCounts] = await Promise.all([
      fetchMtisAll(key, date),
      fetchTomorrowCounts(key, date, depGroupKey),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, { times: string[]; ships: Set<string>; allItems: MtisItem[] }> = {}
    for (const it of items) {
      const gk = depGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [] }
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
      grouped[gk].allItems.push(it)
    }
    if (!Object.keys(grouped).length) return fallback()

    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (DEP_CFG[a]?.priority ?? 99) - (DEP_CFG[b]?.priority ?? 99))
      .map(([gk, { times, ships, allItems }]) => {
        const cfg = DEP_CFG[gk]
        const tmrwCount = tomorrowCounts[gk]
        return {
          id: `dep-${gk}`,
          to: cfg.label,
          operator: [...ships].join(" · "),
          times: [...new Set(times)].sort(),
          status: groupStatus(allItems),
          isLive: true,
          terminal: cfg.terminal,
          fare: cfg.fare,
          fareUrl: cfg.fareUrl,
          ...(tmrwCount ? { tomorrow: { tripCount: tmrwCount } } : {}),
        }
      })

    return { routes, isLive: true }
  } catch {
    return fallback()
  }
}

// ────────────────────────────────────────────────
// 완도 도착 항로
// ────────────────────────────────────────────────
export async function getWandoArrivals(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: applySeasonalCheongsando(STATIC_ARR, kst, "arr"), isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrowCounts] = await Promise.all([
      fetchMtisAll(key, date),
      fetchTomorrowCounts(key, date, arrGroupKey),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, { times: string[]; ships: Set<string>; allItems: MtisItem[]; cfg: ArrGroupCfg }> = {}
    for (const it of items) {
      const gk = arrGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], cfg: ARR_CFG[gk] }
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
      grouped[gk].allItems.push(it)
    }
    if (!Object.keys(grouped).length) return fallback()

    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (ARR_CFG[a]?.priority ?? 99) - (ARR_CFG[b]?.priority ?? 99))
      .map(([gk, { times, ships, allItems, cfg }]) => {
        const tmrwCount = tomorrowCounts[gk]
        return {
          id: `arr-${gk}`,
          to: "완도",
          from: cfg.label,
          operator: [...ships].join(" · "),
          times: [...new Set(times)].sort(),
          status: groupStatus(allItems),
          isLive: true,
          terminal: cfg.terminal,
          islandTerminal: cfg.islandTerminal,
          fare: cfg.fare,
          fareUrl: cfg.fareUrl,
          ...(tmrwCount ? { tomorrow: { tripCount: tmrwCount } } : {}),
        }
      })

    return { routes, isLive: true }
  } catch {
    return fallback()
  }
}

// ────────────────────────────────────────────────
// 계절별 청산도 시간표 (정적 fallback 전용)
// 막배 시각만 계절별 변동 (겨울 17:00 / 여름 18:00 / 가을 17:30)
// ────────────────────────────────────────────────
type CheongsandoSeason = "winter" | "summer" | "autumn"

function cheongsandoSeason(kst: Date): CheongsandoSeason {
  const mmdd = (kst.getUTCMonth() + 1) * 100 + kst.getUTCDate()
  if (mmdd >= 317 && mmdd <= 915) return "summer"
  if (mmdd >= 916 && mmdd <= 1015) return "autumn"
  return "winter"
}

const CHEONGSANDO_TIMES: Record<CheongsandoSeason, { dep: string[]; arr: string[] }> = {
  winter: {
    dep: ["07:00", "08:30", "11:00", "13:00", "14:30", "17:00"],
    arr: ["06:50", "09:00", "11:30", "13:00", "15:00", "17:00"],
  },
  summer: {
    dep: ["07:00", "08:30", "11:00", "13:00", "14:30", "18:00"],
    arr: ["06:50", "09:00", "11:30", "13:00", "15:00", "18:00"],
  },
  autumn: {
    dep: ["07:00", "08:30", "11:00", "13:00", "14:30", "17:30"],
    arr: ["06:50", "09:00", "11:30", "13:00", "15:00", "17:30"],
  },
}

function applySeasonalCheongsando(routes: WandoRoute[], kst: Date, dir: "dep" | "arr"): WandoRoute[] {
  const times = CHEONGSANDO_TIMES[cheongsandoSeason(kst)][dir]
  return routes.map((r) => (r.id === `${dir}-cheongsando` ? { ...r, times } : r))
}

// ────────────────────────────────────────────────
// 정적 fallback (API 장애 시)
// ────────────────────────────────────────────────
const STATIC_DEP: WandoRoute[] = [
  {
    id: "dep-jeju",
    to: "제주", operator: "실버클라우드",
    times: ["09:20"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
  },
  {
    id: "dep-cheongsando",
    to: "청산도", operator: "슬로시티청산도호 · 청산아일랜드호",
    times: ["07:00", "08:30", "11:00", "13:00", "14:30", "18:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    fare: FARE_MAP["cheongsando"], fareUrl: FARE_URL_MAP["cheongsando"],
  },
  {
    id: "dep-hwaheungpo-route",
    to: "소안도·보길도·노화", operator: "대한호 · 민국호",
    times: ["07:20", "08:30", "09:00", "13:00", "15:00", "15:30"],
    status: "unknown", isLive: false, terminal: TERMINAL_HWAHEUNGPO,
    fareUrl: FARE_URL_MAP["hwaheungpo-route"],
  },
]

const STATIC_ARR: WandoRoute[] = [
  {
    id: "arr-jeju",
    to: "완도", from: "제주", operator: "실버클라우드",
    times: ["16:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    islandTerminal: "제주항 연안여객터미널",
  },
  {
    id: "arr-cheongsando",
    to: "완도", from: "청산도", operator: "슬로시티청산도호 · 청산아일랜드호",
    times: ["06:50", "09:00", "11:30", "13:00", "15:00", "18:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    islandTerminal: "도청항",
    fare: FARE_MAP["cheongsando"], fareUrl: FARE_URL_MAP["cheongsando"],
  },
  {
    id: "arr-hwaheungpo-route",
    to: "완도", from: "소안도", operator: "대한호 · 민국호",
    times: ["07:30", "09:47", "13:12", "16:14", "19:04"],
    status: "unknown", isLive: false, terminal: TERMINAL_HWAHEUNGPO,
    islandTerminal: "소안항여객터미널",
    fareUrl: FARE_URL_MAP["hwaheungpo-route"],
  },
]
