import type { WandoRoute, RouteStatus } from "./types"
import type { RegionConfig, RouteGroupConfig } from "@/config/regions"
import { buildArrivalLookup, findPortNames } from "./shipArrival"
import {
  type MtisItem, type CancelledEntry,
  getMtisDay, fetchTomorrowData,
  isCancelled, isSuspended, cancelKindOf, cancelReason, itemReason,
  extractVia, parseSailTime, deduplicateTimes, partialCancelled, groupStatus,
} from "./mtis"

// ────────────────────────────────────────────────
// 다지역(포항·목포·인천) 항로 — MTIS 코어는 ./mtis, 노선 매핑은 config/regions 기반.
// 완도(ferry.ts)와 동일한 코어를 공유해 결항 판정·시간표 파싱이 어긋나지 않는다.
// ────────────────────────────────────────────────

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

function makeStaticDep(config: RegionConfig): WandoRoute[] {
  return config.routeGroups
    .filter((g) => g.fallbackDep?.length)
    .map((g) => ({
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
      times: string[]; ships: Set<string>; allItems: MtisItem[]; via: Record<string, string>; cancelled: CancelledEntry[]
    }> = {}

    for (const it of items) {
      const gk = depGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], via: {}, cancelled: [] }
      grouped[gk].allItems.push(it)
      const cfgG = config.routeGroups.find(g => g.key === gk)
      const via1 = extractVia(it, [...(cfgG?.depPortKeywords ?? []), ...(cfgG?.destKeywords ?? [])])
      if (isCancelled(it)) {
        grouped[gk].cancelled.push({ time: parseSailTime(it.sail_tm), reason: itemReason(it), suspended: isSuspended(it), ...(via1 ? { via: via1 } : {}) })
        continue
      }
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
      if (via1) grouped[gk].via[parseSailTime(it.sail_tm)] = via1
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
          ...(status === "cancelled" ? { cancelKind: cancelKindOf(allItems) } : {}),
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
      times: string[]; ships: Set<string>; allItems: MtisItem[]; via: Record<string, string>; cancelled: CancelledEntry[]
    }> = {}

    for (const it of items) {
      const gk = arrGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], via: {}, cancelled: [] }
      grouped[gk].allItems.push(it)
      if (isCancelled(it)) {
        grouped[gk].cancelled.push({ time: parseSailTime(it.sail_tm), reason: itemReason(it), suspended: isSuspended(it) })
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
          ...(status === "cancelled" ? { cancelKind: cancelKindOf(allItems) } : {}),
          ...(() => { const r = cancelReason(allItems); return r ? { cancelReason: r } : {} })(),
        }
      })

    return { routes, isLive: true }
  } catch {
    return fallback()
  }
}
