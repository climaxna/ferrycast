import { cache } from "react"
import type { WandoRoute, RouteStatus } from "./types"
import type { RegionConfig, RouteGroupConfig } from "@/config/regions"
import { buildArrivalLookup, findPortNames } from "./shipArrival"

const MTIS_BASE = "https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2"
const MTIS_PAGE_SIZE = 2000
const MTIS_MAX_PAGES = 5

interface MtisItem {
  sail_tm: string
  oport_nm: string
  dest_nm: string
  nvg_stts_nm: string           // 진행상태: "출항전"|"운항중"|"완료"|(드물게)"결항"
  nvg_se_cd?: string            // 운항구분코드: 1=정상 2=증선 3=증회 4=비운 5=통제
  nvg_se_nm?: string            // 운항구분명
  psnshp_nm: string
  nvg_seawy_nm: string
  cntrl_rsn_nm?: string | null  // 통제사유 (예: "풍랑주의보")
  nnavi_rsn_nm?: string | null  // 미운항사유 (예: "선박정비")
}

// 실제 미운항 판정 — 운항구분(nvg_se_nm)이 권위 필드. 비운(선박검사·정비·휴항)·통제(기상)
// = 미운항. nvg_stts_nm="결항"은 드물게만 나타나므로 보조로만 본다.
// ⚠️ nnavi_rsn_nm은 정상 운항편에도 붙는 노이즈라 결항 판정에 쓰지 말 것. (ferry.ts 동일)
function isCancelled(it: MtisItem): boolean {
  return it.nvg_se_cd === "4" || it.nvg_se_cd === "5"
    || it.nvg_se_nm === "비운" || it.nvg_se_nm === "통제"
    || it.nvg_stts_nm === "결항"
}

// 결항편에서 사유 추출 (기상 통제사유 우선)
function cancelReason(items: MtisItem[]): string | undefined {
  for (const it of items) {
    if (!isCancelled(it)) continue
    const r = it.cntrl_rsn_nm || it.nnavi_rsn_nm
    if (r && r !== "null") return r
  }
  return undefined
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

// 한 편의 결항 사유 (통제사유 우선, 없으면 미운항사유)
function itemReason(it: MtisItem): string | undefined {
  const r = it.cntrl_rsn_nm || it.nnavi_rsn_nm
  return r && r !== "null" ? r : undefined
}

// 부분 결항편 정리 — 정상편과 5분 이내 겹치면 제외(정상 우선), 결항끼리도 5분 병합, 시각순.
function partialCancelled(
  cancelled: { time: string; reason?: string }[],
  operating: string[],
): { time: string; reason?: string }[] {
  const min = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m }
  const opMins = operating.map(min)
  const out: { time: string; reason?: string }[] = []
  for (const c of [...cancelled].sort((a, b) => min(a.time) - min(b.time))) {
    const cm = min(c.time)
    if (opMins.some((o) => Math.abs(o - cm) < 5)) continue
    if (out.some((o) => Math.abs(min(o.time) - cm) < 5)) continue
    out.push(c)
  }
  return out
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
  if (items.some((it) => !isCancelled(it))) return "operating"
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

// TAGO 항구명 한 쌍(출발항, 도착항) → groupKey. MTIS와 달리 TAGO 항구명은
// 키워드가 서로 포함될 수 있어("포항"⊂"포항영일만"), 가장 구체적(긴) 키워드 매칭을 우선한다.
function makeDepGroupOf(groups: RouteGroupConfig[]) {
  return (o: string, d: string): string | null => {
    let best: string | null = null, bestLen = -1
    for (const g of groups) {
      const dep = g.depPortKeywords.filter((k) => o.includes(k))
      const destMatch = g.destKeywords.some((k) => d.includes(k))
      if (dep.length && destMatch) {
        const len = Math.max(...dep.map((k) => k.length))
        if (len > bestLen) { bestLen = len; best = g.key }
      }
    }
    return best
  }
}

function makeArrGroupOf(groups: RouteGroupConfig[]) {
  return (o: string, d: string): string | null => {
    let best: string | null = null, bestLen = -1
    for (const g of groups) {
      const island = g.destKeywords.filter((k) => o.includes(k))
      const toMain = g.depPortKeywords.some((k) => d.includes(k))
      if (island.length && toMain) {
        const len = Math.max(...island.map((k) => k.length))
        if (len > bestLen) { bestLen = len; best = g.key }
      }
    }
    return best
  }
}

// 지역 config의 모든 출발/도착 키워드 집합
function depKeywords(config: RegionConfig): string[] {
  return [...new Set(config.routeGroups.flatMap((g) => g.depPortKeywords))]
}
function destKeywords(config: RegionConfig): string[] {
  return [...new Set(config.routeGroups.flatMap((g) => g.destKeywords))]
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
      if (isCancelled(it)) continue
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
      terminal: g.depTerminal ?? config.mainTerminal,
      originName: config.name,
      fareUrl: g.fareUrl,
      ...(g.durationMin ? { durationMin: g.durationMin } : {}),
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
      terminal: g.depTerminal ?? config.mainTerminal,
      originName: config.name,
      islandTerminal: g.islandTerminal,
      fareUrl: g.fareUrl,
      ...(g.durationMin ? { durationMin: g.durationMin } : {}),
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
    const depNodeNames = await findPortNames(depKeywords(config))
    const [items, tomorrowData, arrLookup] = await Promise.all([
      getMtisDay(key, date),
      fetchTomorrowData(key, date, depGroupKey),
      buildArrivalLookup(depNodeNames, date, makeDepGroupOf(config.routeGroups)),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, {
      times: string[]; ships: Set<string>; allItems: MtisItem[]; via: Record<string, string>; cancelled: { time: string; reason?: string }[]
    }> = {}

    for (const it of items) {
      const gk = depGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], via: {}, cancelled: [] }
      grouped[gk].allItems.push(it)
      if (isCancelled(it)) {
        grouped[gk].cancelled.push({ time: parseSailTime(it.sail_tm), reason: itemReason(it) })
        continue
      }
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
      const v = extractVia(it, config.routeGroups.find(g => g.key === gk)?.depPortKeywords ?? [], config.routeGroups.find(g => g.key === gk)?.destKeywords ?? [])
      if (v) grouped[gk].via[parseSailTime(it.sail_tm)] = v
    }

    if (!Object.keys(grouped).length) return fallback()

    const groupMap = Object.fromEntries(config.routeGroups.map((g, i) => [g.key, i]))
    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (groupMap[a] ?? 99) - (groupMap[b] ?? 99))
      .map(([gk, { times, ships, allItems, via, cancelled }]) => {
        const cfg = config.routeGroups.find((g) => g.key === gk)!
        const tmrw = tomorrowData[gk]
        const dedup = deduplicateTimes(times)
        const arrivals = arrLookup(gk, dedup, [...ships])
        const status = groupStatus(allItems)
        const partial = status === "operating" ? partialCancelled(cancelled, dedup) : []
        return {
          id: `dep-${gk}`,
          to: cfg.label,
          operator: [...ships].join(" · "),
          times: dedup,
          status,
          isLive: true,
          terminal: cfg.depTerminal ?? config.mainTerminal,
          originName: config.name,
          fareUrl: cfg.fareUrl,
          ...(cfg.durationMin ? { durationMin: cfg.durationMin } : {}),
          ...(tmrw ? { tomorrow: tmrw } : {}),
          ...(Object.keys(via).length ? { via } : {}),
          ...(Object.keys(arrivals).length ? { arrivals } : {}),
          ...(partial.length ? { cancelledTimes: partial } : {}),
          ...(() => { const r = cancelReason(allItems); return r ? { cancelReason: r } : {} })(),
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
    const islandNodeNames = await findPortNames(destKeywords(config))
    const [items, tomorrowData, arrLookup] = await Promise.all([
      getMtisDay(key, date),
      fetchTomorrowData(key, date, arrGroupKey),
      buildArrivalLookup(islandNodeNames, date, makeArrGroupOf(config.routeGroups)),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, {
      times: string[]; ships: Set<string>; allItems: MtisItem[]; via: Record<string, string>; cancelled: { time: string; reason?: string }[]
    }> = {}

    for (const it of items) {
      const gk = arrGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], via: {}, cancelled: [] }
      grouped[gk].allItems.push(it)
      if (isCancelled(it)) {
        grouped[gk].cancelled.push({ time: parseSailTime(it.sail_tm), reason: itemReason(it) })
        continue
      }
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
    }

    if (!Object.keys(grouped).length) return fallback()

    const groupMap = Object.fromEntries(config.routeGroups.map((g, i) => [g.key, i]))
    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (groupMap[a] ?? 99) - (groupMap[b] ?? 99))
      .map(([gk, { times, ships, allItems, via, cancelled }]) => {
        const cfg = config.routeGroups.find((g) => g.key === gk)!
        const tmrw = tomorrowData[gk]
        const dedup = deduplicateTimes(times)
        const arrivals = arrLookup(gk, dedup, [...ships])
        const status = groupStatus(allItems)
        const partial = status === "operating" ? partialCancelled(cancelled, dedup) : []
        return {
          id: `arr-${gk}`,
          to: config.name,
          from: cfg.label,
          operator: [...ships].join(" · "),
          times: dedup,
          status,
          isLive: true,
          terminal: cfg.depTerminal ?? config.mainTerminal,
          originName: config.name,
          islandTerminal: cfg.islandTerminal,
          fareUrl: cfg.fareUrl,
          ...(cfg.durationMin ? { durationMin: cfg.durationMin } : {}),
          ...(tmrw ? { tomorrow: tmrw } : {}),
          ...(Object.keys(via).length ? { via } : {}),
          ...(Object.keys(arrivals).length ? { arrivals } : {}),
          ...(partial.length ? { cancelledTimes: partial } : {}),
          ...(() => { const r = cancelReason(allItems); return r ? { cancelReason: r } : {} })(),
        }
      })

    return { routes, isLive: true }
  } catch {
    return fallback()
  }
}
