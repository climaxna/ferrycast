import type { WandoRoute, RouteStatus } from "./types"

// 정기 시간표 (TAGO API 연동 전 fallback — 실제 시간은 공식 채널 확인)
const STATIC_ROUTES: WandoRoute[] = [
  {
    id: "wando-jeju",
    to: "제주",
    operator: "청해진해운",
    times: ["08:00", "14:00"],
    status: "unknown",
    isLive: false,
  },
  {
    id: "wando-mokpo",
    to: "목포",
    operator: "남해고속",
    times: ["07:50", "09:30", "13:30", "17:00"],
    status: "unknown",
    isLive: false,
  },
  {
    id: "wando-nokdong",
    to: "녹동",
    operator: "동양고속훼리",
    times: ["08:00", "13:00", "17:00"],
    status: "unknown",
    isLive: false,
  },
  {
    id: "wando-yeosu",
    to: "여수",
    operator: "대저고속",
    times: ["07:30", "13:30"],
    status: "unknown",
    isLive: false,
  },
]

// TAGO 국내선박운항정보서비스 (data.go.kr/1613000/DmstcSvExaminSevice)
async function fetchTaGoRoutes(key: string): Promise<WandoRoute[] | null> {
  const base = "https://apis.data.go.kr/1613000/DmstcSvExaminSevice"
  const url = `${base}/getRouteList?serviceKey=${key}&_type=json&numOfRows=20&pageNo=1&depPlaceNm=${encodeURIComponent("완도")}`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const json = await res.json()
    if (json?.response?.header?.resultCode !== "00") return null

    const raw = json?.response?.body?.items?.item
    if (!raw) return null
    const items: Array<{ routeId: string; arrPlaceNm: string }> = Array.isArray(raw) ? raw : [raw]
    if (!items.length) return null

    // 각 항로별 시간표 조회
    const routes = await Promise.all(
      items.map(async (item): Promise<WandoRoute | null> => {
        const timeUrl = `${base}/getArrTimeList?serviceKey=${key}&_type=json&numOfRows=30&pageNo=1&routeId=${item.routeId}`
        try {
          const timeRes = await fetch(timeUrl, { next: { revalidate: 3600 } })
          if (!timeRes.ok) return null
          const timeJson = await timeRes.json()
          if (timeJson?.response?.header?.resultCode !== "00") return null

          const timeRaw = timeJson?.response?.body?.items?.item
          const timeItems: Array<{ depPlandTime: string | number }> = Array.isArray(timeRaw)
            ? timeRaw
            : timeRaw
              ? [timeRaw]
              : []

          const times = timeItems
            .map((t) => {
              const s = String(t.depPlandTime)
              if (s.length < 12) return null
              return `${s.slice(8, 10)}:${s.slice(10, 12)}`
            })
            .filter(Boolean) as string[]

          return {
            id: item.routeId,
            to: item.arrPlaceNm,
            operator: "",
            times,
            status: "operating",
            isLive: true,
          }
        } catch {
          return null
        }
      })
    )

    const valid = routes.filter(Boolean) as WandoRoute[]
    return valid.length ? valid : null
  } catch {
    return null
  }
}

// KOMSA 연안여객선 운항현황 (data.go.kr/1412000)
// TODO: KOMSA API 엔드포인트 확인 후 연동 예정
async function fetchKomsaStatus(
  _key: string,
  routes: WandoRoute[]
): Promise<WandoRoute[]> {
  // KOMSA API 미연동 상태 — 기상 풍속 기반 임시 상태 반환
  return routes
}

export async function getWandoRoutes(): Promise<{
  routes: WandoRoute[]
  isLive: boolean
}> {
  const key = process.env.DATAGOKR_API_KEY

  if (key) {
    const liveRoutes = await fetchTaGoRoutes(key)
    if (liveRoutes?.length) {
      const withStatus = await fetchKomsaStatus(key, liveRoutes)
      return { routes: withStatus, isLive: true }
    }
  }

  return { routes: STATIC_ROUTES, isLive: false }
}
