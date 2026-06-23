import { cache } from "react"
import type { WandoRoute, RouteStatus } from "./types"
import type { RegionConfig, RouteGroupConfig } from "@/config/regions"

const MTIS_BASE = "https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2"
const MTIS_PAGE_SIZE = 2000
const MTIS_MAX_PAGES = 5

interface MtisItem {
  sail_tm: string
  oport_nm: string
  dest_nm: string
  nvg_stts_nm: string
  psnshp_nm: string
  nvg_seawy_nm: string
}

function parseSailTime(raw: string): string {
  const s = raw.padStart(4, "0")
  return `${s.slice(0, 2)}:${s.slice(2)}`
}

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

function extractVia(item: MtisItem, depKeywords: string[], destKeywords: string[]): string | null {
  let s = (item.nvg_seawy_nm || "").replace(/\(.*?\)/g, "")
  const ports = [item.oport_nm, item.dest_nm, ...depKeywords, ...destKeywords]
  for (const p of ports) {
    if (p) s = s.split(p).join("")
  }
  s = s.replace(/[-\s]/g, "").trim()
  return s.length > 0 ? s : null
}

function groupStatus(items: MtisItem[]): RouteStatus {
  if (items.length === 0) return "unknown"
  if (items.some((it) => it.nvg_stts_nm !== "결항")) return "operating"
  return "cancelled"
}

function nextDay(date: string): string {
  const y = +date.slice(0, 4), m = +date.slice(4, 6), d = +date.slice(6, 8)
  const dt = new Date(Date.UTC(y, m - 1, d + 1))
  return dt.toISOString().slice(0, 10).replace(/-/g, "")
}

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
  let json: unknown
  try { json = await res.json() } catch { return { items: [], totalCount: 0 } }
  const j = json as { response?: { header?: { resultCode?: string }; body?: { items?: { item?: unknown }; totalCount?: number } } }
  if (j?.response?.header?.resultCode !== "200") return { items: [], totalCount: 0 }
  const body = j?.response?.body
  const raw = body?.items?.item
  const items = (Array.isArray(raw) ? raw : raw ? [raw] : []) as MtisItem[]
  const totalCount = Number(body?.totalCount ?? items.length)
  return { items, totalCount }
}

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

const getMtisDay = cache((key: string, date: string): Promise<MtisItem[]> => fetchMtisAll(key, date))

function makeDepGroupKey(groups: RouteGroupConfig[]) {
  return (item: MtisItem): string | null => {
    for (const g of groups) {
      const depMatch = g.depPortKeywords.some((k) => item.oport_nm.includes(k))
      const destMatch = g.destKeywords.some((k) => item.dest_nm.includes(k))
      if (depMatch && destMatch) return g.key
    }
    return null
  }
}

function makeArrGroupKey(groups: RouteGroupConfig[]) {
  return (item: MtisItem): string | null => {
    for (const g of groups) {
      // 도착편: 섬 출발(destKeywords) → 본항(depPortKeywords)
      const fromIsland = g.destKeywords.some((k) => item.oport_nm.includes(k))
      const toMain = g.depPortKeywords.some((k) => item.dest_nm.includes(k))
      if (fromIsland && toMain) return g.key
    }
    return null
  }
}

async function fetchTomorrowData(
  key: string,
  todayDate: string,
  keyFn: (item: MtisItem) => string | null,
): Promise<Record<string, { tripCount: number; times: string[] }>> {
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
  } catch { /* 내일 데이터 실패는 무시 */ }
  return Object.fromEntries(
    Object.entries(timesPerGroup).map(([gk, rawTimes]) => {
      const times = deduplicateTimes(rawTimes)
      return [gk, { tripCount: times.length, times }]
    }),
  )
}

function makeStaticDep(config: RegionConfig): WandoRoute[] {
  return config.routeGroups
    .filter((g) => g.fallbackDep?.length)
    .map((g, i) => ({
      id: `dep-${g.key}`,
      to: g.label,
      operator: "",
      times: g.fallbackDep!,
      status: "unknown" as RouteStatus,
      isLive: false,
      terminal: config.mainTerminal,
      originName: config.name,
      fareUrl: g.fareUrl,
    }))
}

function makeStaticArr(config: RegionConfig): WandoRoute[] {
  return config.routeGroups
    .filter((g) => g.fallbackArr?.length)
    .map((g) => ({
      id: `arr-${g.key}`,
      to: config.name,
      from: g.label,
      operator: "",
      times: g.fallbackArr!,
      status: "unknown" as RouteStatus,
      isLive: false,
      terminal: config.mainTerminal,
      islandTerminal: g.islandTerminal,
      fareUrl: g.fareUrl,
    }))
}

export async function getRoutesForRegion(
  config: RegionConfig,
): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: makeStaticDep(config), isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  const depGroupKey = makeDepGroupKey(config.routeGroups)

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrowData] = await Promise.all([
      getMtisDay(key, date),
      fetchTomorrowData(key, date, depGroupKey),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, {
      times: string[]; ships: Set<string>; allItems: MtisItem[]; via: Record<string, string>
    }> = {}

    for (const it of items) {
      const gk = depGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], via: {} }
      grouped[gk].allItems.push(it)
      if (it.nvg_stts_nm === "결항") continue
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
      const v = extractVia(it, config.routeGroups.find(g => g.key === gk)?.depPortKeywords ?? [], config.routeGroups.find(g => g.key === gk)?.destKeywords ?? [])
      if (v) grouped[gk].via[parseSailTime(it.sail_tm)] = v
    }

    if (!Object.keys(grouped).length) return fallback()

    const groupMap = Object.fromEntries(config.routeGroups.map((g, i) => [g.key, i]))
    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (groupMap[a] ?? 99) - (groupMap[b] ?? 99))
      .map(([gk, { times, ships, allItems, via }]) => {
        const cfg = config.routeGroups.find((g) => g.key === gk)!
        const tmrw = tomorrowData[gk]
        return {
          id: `dep-${gk}`,
          to: cfg.label,
          operator: [...ships].join(" · "),
          times: deduplicateTimes(times),
          status: groupStatus(allItems),
          isLive: true,
          terminal: config.mainTerminal,
          fareUrl: cfg.fareUrl,
          ...(tmrw ? { tomorrow: tmrw } : {}),
          ...(Object.keys(via).length ? { via } : {}),
        }
      })

    return { routes, isLive: true }
  } catch {
    return fallback()
  }
}

export async function getArrivalsForRegion(
  config: RegionConfig,
): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: makeStaticArr(config), isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  const arrGroupKey = makeArrGroupKey(config.routeGroups)

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrowData] = await Promise.all([
      getMtisDay(key, date),
      fetchTomorrowData(key, date, arrGroupKey),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, {
      times: string[]; ships: Set<string>; allItems: MtisItem[]; via: Record<string, string>
    }> = {}

    for (const it of items) {
      const gk = arrGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], via: {} }
      grouped[gk].allItems.push(it)
      if (it.nvg_stts_nm === "결항") continue
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
    }

    if (!Object.keys(grouped).length) return fallback()

    const groupMap = Object.fromEntries(config.routeGroups.map((g, i) => [g.key, i]))
    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (groupMap[a] ?? 99) - (groupMap[b] ?? 99))
      .map(([gk, { times, ships, allItems, via }]) => {
        const cfg = config.routeGroups.find((g) => g.key === gk)!
        const tmrw = tomorrowData[gk]
        return {
          id: `arr-${gk}`,
          to: config.name,
          from: cfg.label,
          operator: [...ships].join(" · "),
          times: deduplicateTimes(times),
          status: groupStatus(allItems),
          isLive: true,
          terminal: config.mainTerminal,
          islandTerminal: cfg.islandTerminal,
          fareUrl: cfg.fareUrl,
          ...(tmrw ? { tomorrow: tmrw } : {}),
          ...(Object.keys(via).length ? { via } : {}),
        }
      })

    return { routes, isLive: true }
  } catch {
    return fallback()
  }
}
