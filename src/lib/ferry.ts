import type { WandoRoute, RouteStatus, FareInfo } from "./types"

// TAGO nodeId
const WANDO_NODE = "SEA31020"
const WANDO_HWAHEUNGPO = "SEA31022"

// 완도측 터미널 이름
const TERMINAL_MAIN = "완도여객선터미널"
const TERMINAL_HWAHEUNGPO = "화흥포항"

// ────────────────────────────────────────────────
// 노선 그룹 정의
// 소안도와 노화_동천 보길은 동일 경유 노선(화흥포 → 소안도 → 보길도·노화)
// ────────────────────────────────────────────────
interface DestInfo { label: string; priority: number; groupKey: string }

const DEP_DEST: Record<string, DestInfo> = {
  "제주도":         { label: "제주",              priority: 1, groupKey: "jeju" },
  "청산도":         { label: "청산도",             priority: 2, groupKey: "cheongsando" },
  "소안도":         { label: "소안도·보길도·노화",   priority: 3, groupKey: "hwaheungpo-route" },
  "노화_동천 보길": { label: "소안도·보길도·노화",   priority: 3, groupKey: "hwaheungpo-route" },
}

// 화흥포항 사용 그룹 키
const HWAHEUNGPO_GROUPS = new Set(["hwaheungpo-route"])

// KOMSA 결항 조회용 선박명 (그룹 키 기준)
const ROUTE_FERRIES: Record<string, string[]> = {
  "jeju":             ["실버클라우드", "골드스텔라", "송림블루오션"],
  "cheongsando":      ["슬로시티청산도호", "청산아일랜드", "섬사랑7호"],
  "hwaheungpo-route": ["대한호", "대한호(700톤)", "민국호(811톤)", "만세호"],
  "bogil-nohua-arr":  ["대한호", "대한호(700톤)", "민국호(811톤)", "만세호"],
}

// TAGO 데이터가 불완전한 노선: 편수가 이 값 미만이면 정적 시간표 사용
// (청산도 = 청산농협 선박이 TAGO 미등록)
const ROUTE_MIN_TRIPS: Record<string, number> = {
  "cheongsando": 3,
}

// 운임 요금표 (그룹 키 기준, 제주 제외)
const FARE_MAP: Record<string, FareInfo> = {
  "cheongsando": { adult: 8700, teen: 7900, child: 4200, carSmall: 21000, carRegular: 25000 },
}

// 공식 운임 확인 링크 (그룹 키 기준)
const FARE_URL_MAP: Record<string, string> = {
  "cheongsando":      "https://cheongsannh.nonghyup.com/user/indexSub.do?codyMenuSeq=1048386239&siteId=cheongsannh",
  "hwaheungpo-route": "https://island.theksa.co.kr",
}

// 도착 탭: 완도로 돌아오는 항로
// 소안도(SEA33830)가 화흥포 직전 마지막 경유지 → 해당 출발 시간을 기준으로 사용
const ARR_QUERIES = [
  { nodeId: "SEA10090", label: "제주",       arrFilter: "완도",        groupKey: "jeju",             islandTerminal: "제주항 연안여객터미널",       priority: 1 },
  { nodeId: "SEA35560", label: "청산도",      arrFilter: "완도",        groupKey: "cheongsando",      islandTerminal: "도청항 (청산도 여객선터미널)", priority: 2 },
  { nodeId: "SEA33830", label: "소안도",      arrFilter: "완도_화흥포", groupKey: "hwaheungpo-route", islandTerminal: "소안도 부황항",               priority: 3 },
  { nodeId: "SEA31891", label: "보길도·노화", arrFilter: "완도_화흥포", groupKey: "bogil-nohua-arr",  islandTerminal: "보길도 청별항 · 노화 산양항", priority: 4 },
] as const

// ────────────────────────────────────────────────
// 청산도 계절별 시간표 (청산농협 공식 + 섬사랑7호 병합)
// 청산농협 차도선(슬로시티청산도호·청산아일랜드호)은 TAGO 미등록 → 정적 적용
// 3개 기간으로 운영, 막배 시각만 계절별로 변동 (겨울 17:00 / 여름 18:00 / 가을 17:30)
// 15:00 출발 · 11:00 도착 = 섬사랑7호(다도해 행정선, TAGO 등록) 병합
// 출처: cheongsannh.nonghyup.com
// ────────────────────────────────────────────────
type CheongsandoSeason = "winter" | "summer" | "autumn"

function cheongsandoSeason(kst: Date): CheongsandoSeason {
  const mmdd = (kst.getUTCMonth() + 1) * 100 + kst.getUTCDate()
  if (mmdd >= 317 && mmdd <= 915) return "summer" // 3.17 ~ 9.15
  if (mmdd >= 916 && mmdd <= 1015) return "autumn" // 9.16 ~ 10.15
  return "winter" // 10.16 ~ 익년 3.16
}

const CHEONGSANDO_TIMES: Record<CheongsandoSeason, { dep: string[]; arr: string[] }> = {
  winter: {
    dep: ["07:00", "08:30", "11:00", "13:00", "14:30", "15:00", "17:00"],
    arr: ["06:50", "09:00", "11:00", "11:30", "13:00", "15:00", "17:00"],
  },
  summer: {
    dep: ["07:00", "08:30", "11:00", "13:00", "14:30", "15:00", "18:00"],
    arr: ["06:50", "09:00", "11:00", "11:30", "13:00", "15:00", "18:00"],
  },
  autumn: {
    dep: ["07:00", "08:30", "11:00", "13:00", "14:30", "15:00", "17:30"],
    arr: ["06:50", "09:00", "11:00", "11:30", "13:00", "15:00", "17:30"],
  },
}

function cheongsandoTimes(dir: "dep" | "arr", kst: Date): string[] {
  return CHEONGSANDO_TIMES[cheongsandoSeason(kst)][dir]
}

// 정적 fallback 배열에 계절별 청산도 시간표 적용
function applySeasonalCheongsando(routes: WandoRoute[], kst: Date, dir: "dep" | "arr"): WandoRoute[] {
  const times = cheongsandoTimes(dir, kst)
  return routes.map((r) => (r.id === `${dir}-cheongsando` ? { ...r, times } : r))
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
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: applySeasonalCheongsando(STATIC_DEP, kst, "dep"), isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")

    const [mainItems, hwaItems] = await Promise.all([
      fetchNodeRoutes(key, WANDO_NODE, date),
      fetchNodeRoutes(key, WANDO_HWAHEUNGPO, date),
    ])
    const allItems = [...mainItems, ...hwaItems]
    if (!allItems.length) return fallback()

    // 소안도·보길도를 동일 groupKey로 묶어서 그룹화
    const grouped: Record<string, { times: string[]; ships: Set<string>; label: string; priority: number }> = {}
    for (const it of allItems) {
      const dest = DEP_DEST[it.arrPlaceNm]
      if (!dest) continue
      const { groupKey, label, priority } = dest
      if (!grouped[groupKey]) grouped[groupKey] = { times: [], ships: new Set(), label, priority }
      const t = parseTime(it.depPlandTime)
      if (t) grouped[groupKey].times.push(t)
      if (it.vihicleNm) grouped[groupKey].ships.add(it.vihicleNm)
    }
    if (!Object.keys(grouped).length) return fallback()

    const groupKeys = Object.keys(grouped)
    const statusMap: Record<string, RouteStatus> = {}
    await Promise.all(
      groupKeys.map(async (k) => {
        statusMap[k] = await fetchKomsaStatus(key, date, ROUTE_FERRIES[k] ?? [])
      })
    )

    const routes: WandoRoute[] = groupKeys
      .sort((a, b) => (grouped[a].priority ?? 99) - (grouped[b].priority ?? 99))
      .map((groupKey) => {
        const { label, times, ships } = grouped[groupKey]
        const uniqueTimes = [...new Set(times)].sort()
        const minTrips = ROUTE_MIN_TRIPS[groupKey]
        // TAGO 편수 부족 → 정적 시간표 + 실시간 운항상태
        if (minTrips && uniqueTimes.length < minTrips) {
          const base = STATIC_DEP.find((r) => r.id === `dep-${groupKey}`)
          if (base) {
            const seasonal = groupKey === "cheongsando" ? cheongsandoTimes("dep", kst) : base.times
            return { ...base, times: seasonal, status: statusMap[groupKey], isLive: false }
          }
        }
        return {
          id: `dep-${groupKey}`,
          to: label,
          operator: [...ships].join(" · "),
          times: uniqueTimes,
          status: statusMap[groupKey],
          isLive: true,
          terminal: HWAHEUNGPO_GROUPS.has(groupKey) ? TERMINAL_HWAHEUNGPO : TERMINAL_MAIN,
          fare: FARE_MAP[groupKey],
          fareUrl: FARE_URL_MAP[groupKey],
        }
      })

    return { routes, isLive: true }
  } catch {
    return fallback()
  }
}

// ────────────────────────────────────────────────
// 완도 도착 항로 (역방향 조회)
// ────────────────────────────────────────────────
export async function getWandoArrivals(): Promise<{ routes: WandoRoute[]; isLive: boolean }> {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const fallback = () => ({ routes: applySeasonalCheongsando(STATIC_ARR, kst, "arr"), isLive: false })

  const key = process.env.DATAGOKR_API_KEY
  if (!key) return fallback()

  try {
    const date = kst.toISOString().slice(0, 10).replace(/-/g, "")

    const results = await Promise.all(
      ARR_QUERIES.map(async ({ nodeId, label, arrFilter, groupKey, islandTerminal, priority }) => {
        const items = await fetchNodeRoutes(key, nodeId, date)
        const filtered = items.filter((it) => it.arrPlaceNm === arrFilter)
        if (!filtered.length) return null

        const times = [...new Set(
          filtered.map((it) => parseTime(it.depPlandTime)).filter(Boolean) as string[]
        )].sort()
        const ships = new Set(filtered.map((it) => it.vihicleNm).filter(Boolean))
        const status = await fetchKomsaStatus(key, date, ROUTE_FERRIES[groupKey] ?? [])

        // TAGO 편수 부족 → 정적 시간표 + 실시간 운항상태
        const minTrips = ROUTE_MIN_TRIPS[groupKey]
        if (minTrips && times.length < minTrips) {
          const base = STATIC_ARR.find((r) => r.id === `arr-${groupKey}`)
          if (base) {
            const seasonal = groupKey === "cheongsando" ? cheongsandoTimes("arr", kst) : base.times
            return { ...base, times: seasonal, status, isLive: false, _priority: priority }
          }
        }

        return {
          id: `arr-${groupKey}`,
          to: "완도",
          from: label,
          operator: [...ships].join(" · "),
          times,
          status,
          isLive: true,
          terminal: arrFilter === "완도_화흥포" ? TERMINAL_HWAHEUNGPO : TERMINAL_MAIN,
          islandTerminal,
          fare: FARE_MAP[groupKey],
          fareUrl: FARE_URL_MAP[groupKey],
          _priority: priority,
        }
      })
    )

    const valid = results.filter(
      (r): r is NonNullable<typeof r> => r !== null
    )
    valid.sort((a, b) => (a._priority ?? 99) - (b._priority ?? 99))
    const routes: WandoRoute[] = valid.map(({ _priority: _, ...r }) => r)

    if (!routes.length) return fallback()
    return { routes, isLive: true }
  } catch {
    return fallback()
  }
}

// ────────────────────────────────────────────────
// 정적 fallback
// ────────────────────────────────────────────────
const STATIC_DEP: WandoRoute[] = [
  {
    id: "dep-jeju",
    to: "제주", operator: "청해진해운",
    times: ["02:30", "09:20", "15:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
  },
  {
    // times는 applySeasonalCheongsando/cheongsandoTimes로 계절별 자동 적용됨 (아래는 여름 기본값)
    id: "dep-cheongsando",
    to: "청산도", operator: "청산농협 · 섬사랑7호",
    times: ["07:00", "08:30", "11:00", "13:00", "14:30", "15:00", "18:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    fare: FARE_MAP["cheongsando"], fareUrl: FARE_URL_MAP["cheongsando"],
  },
  {
    id: "dep-hwaheungpo-route",
    to: "소안도·보길도·노화", operator: "청해진해운",
    times: ["07:20", "08:30", "09:00", "13:00", "15:00", "15:30"],
    status: "unknown", isLive: false, terminal: TERMINAL_HWAHEUNGPO,
    fareUrl: FARE_URL_MAP["hwaheungpo-route"],
  },
]

const STATIC_ARR: WandoRoute[] = [
  {
    id: "arr-jeju",
    to: "완도", from: "제주", operator: "청해진해운",
    times: ["08:00", "08:40", "16:00", "19:30"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    islandTerminal: "제주항 연안여객터미널",
  },
  {
    // times는 applySeasonalCheongsando/cheongsandoTimes로 계절별 자동 적용됨 (아래는 여름 기본값)
    id: "arr-cheongsando",
    to: "완도", from: "청산도", operator: "청산농협 · 섬사랑7호",
    times: ["06:50", "09:00", "11:00", "11:30", "13:00", "15:00", "18:00"],
    status: "unknown", isLive: false, terminal: TERMINAL_MAIN,
    islandTerminal: "도청항 (청산도 여객선터미널)",
    fare: FARE_MAP["cheongsando"], fareUrl: FARE_URL_MAP["cheongsando"],
  },
  {
    id: "arr-hwaheungpo-route",
    to: "완도", from: "소안도", operator: "청해진해운",
    times: ["07:30", "09:47", "13:12", "16:14", "19:04"],
    status: "unknown", isLive: false, terminal: TERMINAL_HWAHEUNGPO,
    islandTerminal: "소안도 부황항",
    fareUrl: FARE_URL_MAP["hwaheungpo-route"],
  },
]
