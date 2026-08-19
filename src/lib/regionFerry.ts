import type { WandoRoute, RouteStatus } from "./types"
import type { RegionConfig, RouteGroupConfig } from "@/config/regions"
import { buildArrivalLookup, findPortNames } from "./shipArrival"
import {
  type MtisItem, type CancelledEntry, type DirSummary,
  getMtisDay, fetchTomorrowData, nextDay, statusSummary,
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
      if (!depMatch) continue
      const destMatch = g.destKeywords.some((k) => item.dest_nm.includes(k))
      // 순환항로(oport=dest=본항)는 dest로 목적지를 알 수 없어 항로명으로 보조 매칭한다.
      // 예: 목포->목포 "목포가거도(소흑산)" — dest는 "목포"라 destKeywords로는 안 걸리는 가거도행.
      // 이 보조 매칭이 없으면 같은 섬인데 일부 편만 표시되는 누락이 생긴다.
      const seawayMatch = g.seawayKeywords?.some((k) => (item.nvg_seawy_nm || "").includes(k)) ?? false
      if (destMatch || seawayMatch) return g.key
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
      // 순환항로 안내는 API 상태와 무관한 사실이라 정적 fallback에서도 유지한다
      ...(g.note ? { routeNote: g.note } : {}),
      ...(config.inbound ? { to: config.name, from: g.label } : { to: g.label }),
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
      ...(config.inbound ? { to: g.label, from: config.name } : { to: config.name, from: g.label }),
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

// 메인 요약 바 — 지역 출발/도착 각 방향 집계 (출발/도착 탭에 따라 전환)
export async function getRegionStatusSummaries(config: RegionConfig): Promise<DirSummary> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return { dep: null, arr: null }
  try {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const items = await getMtisDay(key, date)
    if (!items.length) return { dep: null, arr: null }
    const depGroupKey = makeDepGroupKey(config.routeGroups)
    const arrKey = makeArrGroupKey(config.routeGroups)
    const grp = (k: string) => config.routeGroups.find((gg) => gg.key === k)
    // islandHops(연평·굴업·장봉 등)도 요약에 포함 — 순환항로/타 항구라 별도 매칭.
    // 이들은 모두 '출발편' 성격이라 출발(dep) 요약에만 넣는다. (도착 탭 요약은 본항 직항만)
    const hops = config.islandHops ?? []
    const hopKey = (it: MtisItem) => {
      for (const h of hops) {
        if (it.oport_nm.includes(h.depKeyword) && (it.nvg_seawy_nm || "").includes(h.seawayKeyword)) return `hop-${h.key}`
      }
      return null
    }
    const hopOf = (k: string) => hops.find((h) => `hop-${h.key}` === k)
    const depKey = (it: MtisItem) => depGroupKey(it) ?? hopKey(it)
    const depLabel = (k: string) => {
      const g = grp(k); if (g) return config.inbound ? `${g.label} → ${config.name}` : `${config.name} → ${g.label}`
      const h = hopOf(k); if (h) return `${h.originName} → ${h.label}`
      return k
    }
    const arrLabel = (k: string) => {
      const g = grp(k)
      if (!g) return k
      return config.inbound ? `${config.name} → ${g.label}` : `${g.label} → ${config.name}`
    }
    return {
      dep: statusSummary(items, depKey, depLabel),
      arr: statusSummary(items, arrKey, arrLabel),
    }
  } catch {
    return { dep: null, arr: null }
  }
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
    // 목적지 허브(제주·울릉도)는 출발항이 5곳이라 TAGO 노드가 수십 개로 불어난다.
    // 도착 예정시각(부가 정보)을 얻으려다 API 키를 소진해 시간표(본 정보)를 잃는 건 손해다.
    // 이들 노선은 장거리 정기항로라 config의 durationMin으로 대체할 수 있다.
    const depNodeNames = config.inbound ? [] : await findPortNames(depKeywords(config))
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
      const via1 = extractVia(it, [...(cfgG?.depPortKeywords ?? []), ...(cfgG?.destKeywords ?? []), ...(cfgG?.seawayKeywords ?? [])])
      if (isCancelled(it)) {
        grouped[gk].cancelled.push({ time: parseSailTime(it.sail_tm), reason: itemReason(it), suspended: isSuspended(it), ...(via1 ? { via: via1 } : {}), ...(it.psnshp_nm ? { ship: it.psnshp_nm } : {}) })
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
          ...(cfg.note ? { routeNote: cfg.note } : {}),
          // inbound(제주 등): cfg.label이 출발지다 → "완도 → 제주"로 그려야 한다.
          // RouteItem은 from이 있으면 `from → to`로 렌더하므로 필드만 맞춰주면 된다.
          ...(config.inbound ? { to: config.name, from: cfg.label } : { to: cfg.label }),
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
    const islandNodeNames = config.inbound ? [] : await findPortNames(destKeywords(config))
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
        grouped[gk].cancelled.push({ time: parseSailTime(it.sail_tm), reason: itemReason(it), suspended: isSuspended(it), ...(it.psnshp_nm ? { ship: it.psnshp_nm } : {}) })
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
          // inbound면 "제주 → 완도" (제주에서 나오는 배)
          ...(config.inbound ? { to: cfg.label, from: config.name } : { to: config.name, from: cfg.label }),
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

// ────────────────────────────────────────────────
// 섬↔섬 보조 노선 (예: 울릉도 → 독도) — 순환항로라 항로명(nvg_seawy_nm)으로 매칭.
// 본항(포항) 출발/도착 탭과 무관한 별도 섹션으로, config.islandHops가 있을 때만 동작.
// ────────────────────────────────────────────────
export async function getIslandHopsForRegion(config: RegionConfig): Promise<WandoRoute[]> {
  const hops = config.islandHops
  if (!hops?.length) return []
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return []

  try {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrow] = await Promise.all([
      getMtisDay(key, date),
      getMtisDay(key, nextDay(date)).catch(() => [] as MtisItem[]),
    ])
    if (!items.length) return []

    const routes: WandoRoute[] = []
    for (const h of hops) {
      // 순환항로: 출발항이 섬(depKeyword)이고 목적지 섬은 항로명(seawayKeyword)에만 존재
      const match = (it: MtisItem) =>
        it.oport_nm.includes(h.depKeyword) && (it.nvg_seawy_nm || "").includes(h.seawayKeyword)
      const all = items.filter(match)
      if (!all.length) continue  // 오늘 MTIS에 아예 없으면 카드 생략

      const times = deduplicateTimes(all.filter((it) => !isCancelled(it)).map((it) => parseSailTime(it.sail_tm)))
      const cancelled: CancelledEntry[] = all
        .filter(isCancelled)
        .map((it) => ({ time: parseSailTime(it.sail_tm), reason: itemReason(it), suspended: isSuspended(it), ...(it.psnshp_nm ? { ship: it.psnshp_nm } : {}) }))
      const status = groupStatus(all)
      const partial = status === "operating" ? partialCancelled(cancelled, times) : []
      const ships = [...new Set(all.filter((it) => !isCancelled(it) && it.psnshp_nm).map((it) => it.psnshp_nm))]
      const tmrwTimes = deduplicateTimes(tomorrow.filter(match).filter((it) => !isCancelled(it)).map((it) => parseSailTime(it.sail_tm)))

      routes.push({
        id: `hop-${h.key}`,
        to: h.label,
        originName: h.originName,
        operator: ships.join(" · "),
        times,
        status,
        isLive: true,
        terminal: h.terminal,
        noBooking: true,
        ...(h.bookingNote ? { bookingNote: h.bookingNote } : {}),
        ...(partial.length ? { cancelledTimes: partial } : {}),
        ...(status === "cancelled" ? { cancelKind: cancelKindOf(all) } : {}),
        ...(tmrwTimes.length ? { tomorrow: { tripCount: tmrwTimes.length, times: tmrwTimes } } : {}),
        ...(() => { const r = cancelReason(all); return r ? { cancelReason: r } : {} })(),
      })
    }
    return routes
  } catch {
    return []
  }
}
