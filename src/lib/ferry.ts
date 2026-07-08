import type { WandoRoute } from "./types"
import { buildArrivalLookup } from "./shipArrival"
import {
  type MtisItem, type CancelledEntry,
  getMtisDay, fetchTomorrowData,
  isCancelled, isSuspended, cancelKindOf, cancelReason, itemReason,
  extractVia, parseSailTime, deduplicateTimes, partialCancelled, groupStatus, nextDay,
} from "./mtis"

const TERMINAL_MAIN = "완도여객선터미널"
const TERMINAL_HWAHEUNGPO = "화흥포항"

const FARE_URL_MAP: Record<string, string> = {
  "jeju":             "https://www.hanilexpress.co.kr",  // 한일고속(골드스텔라·실버클라우드) — 완도↔제주 요금·예매
  "cheongsando":      "https://cheongsannh.nonghyup.com/user/indexSub.do?codyMenuSeq=1048386239&siteId=cheongsannh",
  "hwaheungpo-route": "https://island.theksa.co.kr/page/booking",
}

// ────────────────────────────────────────────────
// 노선 그룹 설정 (완도 전용 — MTIS 코어는 ./mtis)
// ────────────────────────────────────────────────
interface DepGroupCfg {
  label: string; priority: number; terminal: string
  fareUrl?: string
  durationMin?: number  // TAGO 미등록 노선(청산농협 등) 도착시각 fallback용 소요시간(분)
}
interface ArrGroupCfg extends DepGroupCfg { islandTerminal: string }

// 청산도는 청산농협 운영 여객선이 TAGO 미등록(행정선만 존재) → 실데이터 도착시각 불가.
// 완도↔청산도는 고정 단거리 노선(약 50분)이라 fallback 소요시간으로 도착 예정시각 제공.
const CHEONGSANDO_DURATION_MIN = 50

const DEP_CFG: Record<string, DepGroupCfg> = {
  "jeju":             { label: "제주",             priority: 1, terminal: TERMINAL_MAIN, fareUrl: FARE_URL_MAP["jeju"] },
  "cheongsando":      { label: "청산도",            priority: 2, terminal: TERMINAL_MAIN, fareUrl: FARE_URL_MAP["cheongsando"], durationMin: CHEONGSANDO_DURATION_MIN },
  "hwaheungpo-route": { label: "소안도·보길도·노화", priority: 3, terminal: TERMINAL_HWAHEUNGPO, fareUrl: FARE_URL_MAP["hwaheungpo-route"] },
}

const ARR_CFG: Record<string, ArrGroupCfg> = {
  "jeju":             { label: "제주",   priority: 1, terminal: TERMINAL_MAIN,       islandTerminal: "제주항 연안여객터미널", fareUrl: FARE_URL_MAP["jeju"] },
  "cheongsando":      { label: "청산도", priority: 2, terminal: TERMINAL_MAIN,       islandTerminal: "도청항", fareUrl: FARE_URL_MAP["cheongsando"], durationMin: CHEONGSANDO_DURATION_MIN },
  "hwaheungpo-route": { label: "소안도·보길도·노화", priority: 3, terminal: TERMINAL_HWAHEUNGPO, islandTerminal: "소안항여객터미널", fareUrl: FARE_URL_MAP["hwaheungpo-route"] },
}

// 출발항·도착항 이름 한 쌍 → 노선 groupKey (MTIS·TAGO 공용)
function depGroupOf(o: string, d: string): string | null {
  if (o.includes("완도") && d.includes("제주")) return "jeju"
  if (o.includes("완도") && d.includes("청산")) return "cheongsando"
  if (o.includes("화흥") && (d.includes("소안") || d.includes("보길") || d.includes("노화"))) return "hwaheungpo-route"
  return null
}
function depGroupKey(item: MtisItem): string | null {
  return depGroupOf(item.oport_nm, item.dest_nm)
}

function arrGroupOf(o: string, d: string): string | null {
  if (o.includes("제주") && (d.includes("완도") || d.includes("화흥"))) return "jeju"
  if (o.includes("청산") && (d.includes("완도") || d.includes("화흥"))) return "cheongsando"
  if ((o.includes("소안") || o.includes("보길") || o.includes("노화")) && (d.includes("완도") || d.includes("화흥"))) return "hwaheungpo-route"
  return null
}
function arrGroupKey(item: MtisItem): string | null {
  return arrGroupOf(item.oport_nm, item.dest_nm)
}

// ────────────────────────────────────────────────
// 완도 출발 항로
// ────────────────────────────────────────────────
export async function getWandoRoutes(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: makeStaticDep(kst), isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrowData, arrLookup] = await Promise.all([
      getMtisDay(key, date),
      fetchTomorrowData(key, date, depGroupKey),
      // 완도·화흥포 출항편 TAGO 도착시각 (실패해도 빈 룩업)
      buildArrivalLookup(["완도", "완도_화흥포"], date, depGroupOf),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, { times: string[]; ships: Set<string>; allItems: MtisItem[]; via: Record<string, string>; cancelled: CancelledEntry[] }> = {}
    for (const it of items) {
      const gk = depGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], via: {}, cancelled: [] }
      grouped[gk].allItems.push(it)
      // 미운항편(비운·통제·결항)은 시간표·운영사에서 제외 (상태 판정용 allItems·부분결항 표시용 cancelled에만 남김)
      if (isCancelled(it)) {
        const cv = gk === "jeju" ? extractVia(it) : null  // 미운항편도 경유(추자도) 라벨 유지
        grouped[gk].cancelled.push({ time: parseSailTime(it.sail_tm), reason: itemReason(it), suspended: isSuspended(it), ...(cv ? { via: cv } : {}) })
        continue
      }
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
      // 경유편 표시는 제주만 (제주는 일부 편만 경유 → 표시 가치 큼.
      // 소안 노선은 전편이 동일 경유 구조라 통합 라벨로 충분)
      if (gk === "jeju") {
        const v = extractVia(it)
        if (v) grouped[gk].via[parseSailTime(it.sail_tm)] = v
      }
    }
    if (!Object.keys(grouped).length) return fallback()

    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (DEP_CFG[a]?.priority ?? 99) - (DEP_CFG[b]?.priority ?? 99))
      .map(([gk, { times, ships, allItems, via, cancelled }]) => {
        const cfg = DEP_CFG[gk]
        const tmrw = tomorrowData[gk]
        const dedup = deduplicateTimes(times)
        const arrivals = arrLookup(gk, dedup, [...ships])
        const status = groupStatus(allItems)
        // 부분 결항 — 노선은 운항하나 일부 편만 결항일 때만 표시(전편 결항이면 status로 이미 표현)
        const partial = status === "operating" ? partialCancelled(cancelled, dedup) : []
        return {
          id: `dep-${gk}`,
          to: cfg.label,
          operator: [...ships].join(" · "),
          times: dedup,
          status,
          isLive: true,
          terminal: cfg.terminal,
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
// 완도 도착 항로
// ────────────────────────────────────────────────
export async function getWandoArrivals(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: makeStaticArr(kst), isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrowData, arrLookup] = await Promise.all([
      getMtisDay(key, date),
      fetchTomorrowData(key, date, arrGroupKey),
      // 섬 → 완도 입항편 TAGO 도착시각 (완도 도착 예정시각)
      buildArrivalLookup(["제주도", "청산도", "소안도", "노화_산양 보길"], date, arrGroupOf),
    ])
    if (!items.length) return fallback()

    const grouped: Record<string, { times: string[]; ships: Set<string>; allItems: MtisItem[]; cfg: ArrGroupCfg; via: Record<string, string>; cancelled: CancelledEntry[] }> = {}
    for (const it of items) {
      const gk = arrGroupKey(it)
      if (!gk) continue
      if (!grouped[gk]) grouped[gk] = { times: [], ships: new Set(), allItems: [], cfg: ARR_CFG[gk], via: {}, cancelled: [] }
      grouped[gk].allItems.push(it)
      // 미운항편(비운·통제·결항)은 시간표·운영사에서 제외 (상태 판정용 allItems·부분결항 표시용 cancelled에만 남김)
      if (isCancelled(it)) {
        const cv = gk === "jeju" ? extractVia(it) : null  // 미운항편도 경유(추자도) 라벨 유지
        grouped[gk].cancelled.push({ time: parseSailTime(it.sail_tm), reason: itemReason(it), suspended: isSuspended(it), ...(cv ? { via: cv } : {}) })
        continue
      }
      grouped[gk].times.push(parseSailTime(it.sail_tm))
      if (it.psnshp_nm) grouped[gk].ships.add(it.psnshp_nm)
      // 경유편 표시는 제주만 (도착 탭 제주→완도도 추자도 경유편 존재)
      if (gk === "jeju") {
        const v = extractVia(it)
        if (v) grouped[gk].via[parseSailTime(it.sail_tm)] = v
      }
    }
    if (!Object.keys(grouped).length) return fallback()

    const routes: WandoRoute[] = Object.entries(grouped)
      .sort(([a], [b]) => (ARR_CFG[a]?.priority ?? 99) - (ARR_CFG[b]?.priority ?? 99))
      .map(([gk, { times, ships, allItems, cfg, via, cancelled }]) => {
        const tmrw = tomorrowData[gk]
        const dedup = deduplicateTimes(times)
        const arrivals = arrLookup(gk, dedup, [...ships])
        const status = groupStatus(allItems)
        const partial = status === "operating" ? partialCancelled(cancelled, dedup) : []
        return {
          id: `arr-${gk}`,
          to: "완도",
          from: cfg.label,
          operator: [...ships].join(" · "),
          times: dedup,
          status,
          isLive: true,
          terminal: cfg.terminal,
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
// 약산권 섬↔섬 노선 (완도 본섬 미경유 — 별도 섹션)
//   약산도 당목항 ↔ 금일도 일정항  (완농페리3호·풍진메이슨·평화페리9호)
//   약산도 당목항 ↔ 생일도 서성항  (완농페리5호·완농페리호)
// 두 노선 모두 MTIS 실시간 등록 (docs/약산.md 대조 검증). 완도 터미널 로직과 무관하므로 전용 매핑.
// ⚠️ 당목↔녹동(약산↔고흥) 편도 존재 → dest/oport를 "일정"·"서성"으로 명시 매칭해 제외한다.
// ────────────────────────────────────────────────
const YAKSAN_TERMINAL = "당목항"
const YAKSAN_PHONE = "061-553-9088"  // 약산농협(당목)

interface YaksanGroupCfg {
  key: string
  island: string          // 상대 섬 이름 (금일 / 생일)
  destPort: string        // MTIS 도착항명 (일정 / 서성)
}

const YAKSAN_GROUPS: YaksanGroupCfg[] = [
  { key: "geumil",  island: "금일", destPort: "일정" },
  { key: "saengil", island: "생일", destPort: "서성" },
]

// 약산(당목) 출발편 groupKey — 반드시 dest가 일정/서성이어야 함(녹동편 제외)
function yaksanForwardKey(it: MtisItem): string | null {
  if (!it.oport_nm.includes("당목")) return null
  for (const g of YAKSAN_GROUPS) if (it.dest_nm.includes(g.destPort)) return g.key
  return null
}
// 약산(당목) 도착편(=돌아오는 배) groupKey
function yaksanReturnKey(it: MtisItem): string | null {
  if (!it.dest_nm.includes("당목")) return null
  for (const g of YAKSAN_GROUPS) if (it.oport_nm.includes(g.destPort)) return g.key
  return null
}

// groupKey별 시각 집계 (결항 제외, 5분 이내 중복 병합)
function collectTimes(items: MtisItem[], keyFn: (it: MtisItem) => string | null): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const it of items) {
    if (isCancelled(it)) continue
    const gk = keyFn(it)
    if (!gk) continue
    ;(out[gk] ??= []).push(parseSailTime(it.sail_tm))
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, deduplicateTimes(v)]))
}

// groupKey별 결항편 집계 (부분결항 표시용)
function collectCancelled(items: MtisItem[], keyFn: (it: MtisItem) => string | null): Record<string, CancelledEntry[]> {
  const out: Record<string, CancelledEntry[]> = {}
  for (const it of items) {
    if (!isCancelled(it)) continue
    const gk = keyFn(it)
    if (!gk) continue
    ;(out[gk] ??= []).push({ time: parseSailTime(it.sail_tm), reason: itemReason(it), suspended: isSuspended(it) })
  }
  return out
}

export async function getYaksanRoutes(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const key = process.env.DATAGOKR_API_KEY
  if (!key) return { routes: [], isLive: false }

  try {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")
    const [items, tomorrow] = await Promise.all([
      getMtisDay(key, date),
      getMtisDay(key, nextDay(date)).catch(() => [] as MtisItem[]),
    ])
    if (!items.length) return { routes: [], isLive: false }

    const fwdTimes = collectTimes(items, yaksanForwardKey)
    const retTimes = collectTimes(items, yaksanReturnKey)
    const fwdCancelled = collectCancelled(items, yaksanForwardKey)
    const fwdTomorrow = collectTimes(tomorrow, yaksanForwardKey)
    const retTomorrow = collectTimes(tomorrow, yaksanReturnKey)

    // 상태·운영선사는 방향 무관하게 전체 편 기준
    const allByKey: Record<string, MtisItem[]> = {}
    const shipsByKey: Record<string, Set<string>> = {}
    for (const it of items) {
      const gk = yaksanForwardKey(it) ?? yaksanReturnKey(it)
      if (!gk) continue
      ;(allByKey[gk] ??= []).push(it)
      if (!isCancelled(it) && it.psnshp_nm) (shipsByKey[gk] ??= new Set()).add(it.psnshp_nm)
    }

    const routes: WandoRoute[] = []
    for (const g of YAKSAN_GROUPS) {
      const all = allByKey[g.key] ?? []
      if (!all.length) continue  // 오늘 MTIS에 아예 없는 노선만 생략 (전편 결항은 '결항'으로 노출)
      const times = fwdTimes[g.key] ?? []
      const fTmrw = fwdTomorrow[g.key] ?? []
      const rTmrw = retTomorrow[g.key] ?? []
      const status = groupStatus(all)
      const partial = status === "operating" ? partialCancelled(fwdCancelled[g.key] ?? [], times) : []
      const cKind = status === "cancelled" ? cancelKindOf(all) : undefined
      routes.push({
        id: `yaksan-${g.key}`,
        to: g.island,
        originName: "약산",
        operator: [...(shipsByKey[g.key] ?? [])].join(" · "),
        times,
        status,
        isLive: true,
        terminal: YAKSAN_TERMINAL,
        noBooking: true,
        bookingNote: `현장 매표소 발권 · 약산농협 ${YAKSAN_PHONE}`,
        ...(partial.length ? { cancelledTimes: partial } : {}),
        ...(cKind ? { cancelKind: cKind } : {}),
        ...(fTmrw.length ? { tomorrow: { tripCount: fTmrw.length, times: fTmrw } } : {}),
        returnTrip: {
          label: `${g.island} → 약산`,
          times: retTimes[g.key] ?? [],
          ...(rTmrw.length ? { tomorrow: { tripCount: rTmrw.length, times: rTmrw } } : {}),
        },
        ...(() => { const r = cancelReason(all); return r ? { cancelReason: r } : {} })(),
      })
    }

    return { routes, isLive: routes.length > 0 }
  } catch {
    return { routes: [], isLive: false }
  }
}

// ────────────────────────────────────────────────
// 정적 fallback (API 완전 장애 시에만 노출 — "참고 시간표")
// 출처: docs/청산도.md, docs/소안도.md (소안농협 공식 시간표)
// ────────────────────────────────────────────────

// 청산도: 겨울(10/16~익년3/16) / 여름(3/17~9/15) / 가을(9/16~10/15)
const CHEONGSANDO_TIMES = {
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

// 소안도·노화(동천): 하절기(3/1~9/30) / 동절기(10/1~2/28)
// 하절기 dep은 MTIS 실측 화흥포 출항시각(공식 게시표보다 약 5분 늦음)으로 보정 — 평상시엔 MTIS 실시간 사용
const SOAN_TIMES = {
  summer: {
    dep: ["06:45", "07:55", "08:55", "09:55", "10:55", "11:55", "12:55", "13:55", "14:55", "15:55", "16:55", "18:25", "21:00"],
    arr: ["06:40", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:20", "19:50"],
  },
  winter: {
    dep: ["07:00", "07:50", "08:50", "09:50", "10:50", "11:50", "12:50", "13:50", "14:50", "15:50", "17:50", "21:00"],
    arr: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "19:50"],
  },
}

function cheongsandoSeason(m: number, d: number): "winter" | "summer" | "autumn" {
  const md = m * 100 + d
  if (md >= 317 && md <= 915) return "summer"
  if (md >= 916 && md <= 1015) return "autumn"
  return "winter"
}

function soanSeason(m: number): "summer" | "winter" {
  return m >= 3 && m <= 9 ? "summer" : "winter"
}

function makeStaticDep(kst: Date): WandoRoute[] {
  const m = kst.getUTCMonth() + 1, d = kst.getUTCDate()
  const cs = CHEONGSANDO_TIMES[cheongsandoSeason(m, d)]
  const so = SOAN_TIMES[soanSeason(m)]
  return [
    {
      id: "dep-jeju",
      to: "제주", operator: "한일골드스텔라 · 실버클라우드",
      times: ["02:30", "09:20", "15:00"],
      status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    },
    {
      id: "dep-cheongsando",
      to: "청산도", operator: "슬로시티청산도호 · 청산아일랜드호 · 퀸청산호",
      times: cs.dep,
      status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
      fareUrl: FARE_URL_MAP["cheongsando"],
    },
    {
      id: "dep-hwaheungpo-route",
      to: "소안도·보길도·노화", operator: "대한호 · 민국호",
      times: so.dep,
      status: "unknown", isLive: false, terminal: TERMINAL_HWAHEUNGPO,
      fareUrl: FARE_URL_MAP["hwaheungpo-route"],
    },
  ]
}

function makeStaticArr(kst: Date): WandoRoute[] {
  const m = kst.getUTCMonth() + 1, d = kst.getUTCDate()
  const cs = CHEONGSANDO_TIMES[cheongsandoSeason(m, d)]
  const so = SOAN_TIMES[soanSeason(m)]
  return [
    {
      id: "arr-jeju",
      to: "완도", from: "제주", operator: "한일골드스텔라 · 실버클라우드",
      times: ["16:00"],
      status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
      islandTerminal: "제주항 연안여객터미널",
    },
    {
      id: "arr-cheongsando",
      to: "완도", from: "청산도", operator: "슬로시티청산도호 · 청산아일랜드호 · 퀸청산호",
      times: cs.arr,
      status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
      islandTerminal: "도청항",
      fareUrl: FARE_URL_MAP["cheongsando"],
    },
    {
      id: "arr-hwaheungpo-route",
      to: "완도", from: "소안도", operator: "대한호 · 민국호",
      times: so.arr,
      status: "unknown", isLive: false, terminal: TERMINAL_HWAHEUNGPO,
      islandTerminal: "소안항여객터미널",
      fareUrl: FARE_URL_MAP["hwaheungpo-route"],
    },
  ]
}
