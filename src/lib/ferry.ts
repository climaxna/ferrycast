import { cache } from "react"
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

// 동일 선착장에서 5분 이내 출항 편은 하나로 병합 (예: 18:00 / 18:01 → 18:00)
function deduplicateTimes(times: string[]): string[] {
  const sorted = [...new Set(times)].sort()
  const result: string[] = []
  for (const t of sorted) {
    const [h, m] = t.split(":").map(Number)
    const mins = h * 60 + m
    const hasSimilar = result.some((r) => {
      const [rh, rm] = r.split(":").map(Number)
      return Math.abs(rh * 60 + rm - mins) < 5
    })
    if (!hasSimilar) result.push(t)
  }
  return result
}

// 운항 스케줄 API는 전국 여객선을 반환 → 한 페이지로는 완도 편이 잘릴 수 있음
const MTIS_PAGE_SIZE = 500
const MTIS_MAX_PAGES = 10 // 안전 상한 (최대 5000건)

async function fetchMtisPage(
  key: string,
  date: string,
  pageNo: number,
): Promise<{ items: MtisItem[]; totalCount: number }> {
  const params = new URLSearchParams({
    serviceKey: key, pageNo: String(pageNo), numOfRows: String(MTIS_PAGE_SIZE),
    dataType: "JSON", rlvtYmd: date,
  })
  const res = await fetch(`${MTIS_BASE}?${params}`, { next: { revalidate: 300 } })
  if (!res.ok) return { items: [], totalCount: 0 }
  // 쿼터 초과 시 JSON이 아닌 plain text("API token quota exceeded")를 반환 → 파싱 가드
  let json: unknown
  try {
    json = await res.json()
  } catch {
    return { items: [], totalCount: 0 }
  }
  const j = json as { response?: { header?: { resultCode?: string }; body?: { items?: { item?: unknown }; totalCount?: number } } }
  if (j?.response?.header?.resultCode !== "200") return { items: [], totalCount: 0 }
  const body = j?.response?.body
  const raw = body?.items?.item
  const items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as MtisItem[]
  const totalCount = Number(body?.totalCount ?? items.length)
  return { items, totalCount }
}

// 전국 스케줄 전체를 페이지네이션으로 수집 (완도 편 누락 방지)
// 일부 페이지가 실패(쿼터 등)해도 받은 페이지는 살린다 (allSettled)
async function fetchMtisAll(key: string, date: string): Promise<MtisItem[]> {
  const first = await fetchMtisPage(key, date, 1)
  const items = [...first.items]
  const totalPages = Math.min(Math.ceil(first.totalCount / MTIS_PAGE_SIZE), MTIS_MAX_PAGES)
  if (totalPages > 1) {
    const rest = await Promise.allSettled(
      Array.from({ length: totalPages - 1 }, (_, i) => fetchMtisPage(key, date, i + 2)),
    )
    for (const r of rest) {
      if (r.status === "fulfilled") items.push(...r.value.items)
    }
  }
  return items
}

// 요청(렌더) 단위 메모이제이션 — 출발·도착이 같은 날짜 데이터를 공유해
// fetchMtisAll 중복 호출(출발/도착 × 오늘/내일 = 4회)을 2회로 줄인다.
// 내부 fetch는 next:{revalidate:300}로 요청 간(=사용자 간) Data Cache도 적용됨.
const getMtisDay = cache((key: string, date: string): Promise<MtisItem[]> => fetchMtisAll(key, date))

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

// 일부 편만 결항이면 정상 운항편이 있으므로 "operating".
// 전편이 결항일 때만 노선 전체를 "cancelled"로 판정한다.
function groupStatus(items: MtisItem[]): RouteStatus {
  if (items.length === 0) return "unknown"
  if (items.some((it) => it.nvg_stts_nm !== "결항")) return "operating"
  return "cancelled"
}

// YYYYMMDD → 다음날 YYYYMMDD
function nextDay(date: string): string {
  const y = +date.slice(0, 4), m = +date.slice(4, 6), d = +date.slice(6, 8)
  const dt = new Date(Date.UTC(y, m - 1, d + 1))
  return dt.toISOString().slice(0, 10).replace(/-/g, "")
}

// 내일 스케줄을 groupKey별 편수로 집계 (결항 편 제외, 5분 이내 중복 병합 후 카운트)
async function fetchTomorrowCounts(
  key: string,
  todayDate: string,
  keyFn: (item: MtisItem) => string | null,
): Promise<Record<string, number>> {
  const timesPerGroup: Record<string, string[]> = {}
  try {
    const items = await getMtisDay(key, nextDay(todayDate))
    for (const it of items) {
      if (it.nvg_stts_nm === "결항") continue
      const gk = keyFn(it)
      if (!gk) continue
      if (!timesPerGroup[gk]) timesPerGroup[gk] = []
      timesPerGroup[gk].push(parseSailTime(it.sail_tm))
    }
  } catch {
    // 내일 데이터는 부가 정보 — 실패해도 오늘 데이터에 영향 없음
  }
  return Object.fromEntries(
    Object.entries(timesPerGroup).map(([gk, times]) => [gk, deduplicateTimes(times).length]),
  )
}

// ────────────────────────────────────────────────
// 완도 출발 항로
// ────────────────────────────────────────────────
export async function getWandoRoutes(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: STATIC_DEP, isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrowCounts] = await Promise.all([
      getMtisDay(key, date),
      fetchTomorrowCounts(key, date, depGroupKey),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, { times: string[]; ships: Set<string>; allItems: MtisItem[] }> = {}
    for (const it of items) {
      const gk = depGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [] }
      grouped[gk].allItems.push(it)
      // 결항편은 시간표·운영사에서 제외 (상태 판정용 allItems에만 남김)
      if (it.nvg_stts_nm === "결항") continue
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
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
          times: deduplicateTimes(times),
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
  const fallback = () => ({ routes: STATIC_ARR, isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrowCounts] = await Promise.all([
      getMtisDay(key, date),
      fetchTomorrowCounts(key, date, arrGroupKey),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, { times: string[]; ships: Set<string>; allItems: MtisItem[]; cfg: ArrGroupCfg }> = {}
    for (const it of items) {
      const gk = arrGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], cfg: ARR_CFG[gk] }
      grouped[gk].allItems.push(it)
      // 결항편은 시간표·운영사에서 제외 (상태 판정용 allItems에만 남김)
      if (it.nvg_stts_nm === "결항") continue
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
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
          times: deduplicateTimes(times),
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
// 정적 fallback (API 완전 장애 시에만 노출 — "참고 시간표")
// 청산도는 여름 기준값 (평상시엔 MTIS 실시간 데이터 사용)
// ────────────────────────────────────────────────
const STATIC_DEP: WandoRoute[] = [
  {
    id: "dep-jeju",
    to: "제주", operator: "한일골드스텔라 · 실버클라우드",
    times: ["02:30", "09:20", "15:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
  },
  {
    id: "dep-cheongsando",
    to: "청산도", operator: "슬로시티청산도호 · 청산아일랜드호 · 권청산호",
    times: ["07:00", "08:30", "11:00", "13:00", "14:30", "18:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    fare: FARE_MAP["cheongsando"], fareUrl: FARE_URL_MAP["cheongsando"],
  },
  {
    id: "dep-hwaheungpo-route",
    to: "소안도·보길도·노화", operator: "만세호 · 대한호 · 민국호",
    times: ["06:45", "07:55", "08:55", "09:55", "10:55", "11:55", "12:55", "13:55", "14:55", "15:55", "16:55", "18:25", "21:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_HWAHEUNGPO,
    fareUrl: FARE_URL_MAP["hwaheungpo-route"],
  },
]

const STATIC_ARR: WandoRoute[] = [
  {
    id: "arr-jeju",
    to: "완도", from: "제주", operator: "한일골드스텔라 · 실버클라우드",
    times: ["16:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    islandTerminal: "제주항 연안여객터미널",
  },
  {
    id: "arr-cheongsando",
    to: "완도", from: "청산도", operator: "슬로시티청산도호 · 청산아일랜드호 · 권청산호",
    times: ["06:50", "09:00", "11:30", "13:00", "15:00", "18:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    islandTerminal: "도청항",
    fare: FARE_MAP["cheongsando"], fareUrl: FARE_URL_MAP["cheongsando"],
  },
  {
    id: "arr-hwaheungpo-route",
    to: "완도", from: "소안도", operator: "만세호 · 대한호 · 민국호",
    times: ["07:30", "09:47", "13:12", "16:14", "19:04"],
    status: "unknown", isLive: false, terminal: TERMINAL_HWAHEUNGPO,
    islandTerminal: "소안항여객터미널",
    fareUrl: FARE_URL_MAP["hwaheungpo-route"],
  },
]
