import { REGIONS } from "@/config/regions"
import type { Guide } from "@/content/guides"
import type { RouteStatus, WandoRoute } from "@/lib/types"
import { getWandoRoutes } from "@/lib/ferry"
import { getRoutesForRegion } from "@/lib/regionFerry"
import { toMinutes } from "@/lib/utils"

// 가이드 페이지에 심는 "그 항로만" 실시간 상태.
// 검색으로 가이드에 착지한 사용자가 클릭 없이 오늘 운항/결항을 바로 보게 한다.
export interface GuideLiveStatus {
  status: RouteStatus              // operating | cancelled | unknown
  isLive: boolean                  // false면 API 장애 fallback — 상태를 단정하지 않는다
  todayTimes: string[]             // 오늘 전체 출발 시각
  nextTimes: string[]              // 지금 이후 남은 출발 시각(최대 4개)
  cancelReason?: string
  cancelKind?: "cancelled" | "suspended"
}

export async function getGuideLiveStatus(guide: Guide): Promise<GuideLiveStatus | null> {
  // 실시간 매칭 키가 없는 가이드(약산 섬↔섬 집계 등)는 인라인 위젯 생략 → 링크만.
  if (!guide.liveGroupKey) return null

  let routes: WandoRoute[] = []
  let isLive = false
  try {
    if (guide.regionSlug === "") {
      const r = await getWandoRoutes()
      routes = r.routes
      isLive = r.isLive
    } else {
      const config = REGIONS[guide.regionSlug]
      if (!config) return null
      const r = await getRoutesForRegion(config)
      routes = r.routes
      isLive = r.isLive
    }
  } catch {
    return { status: "unknown", isLive: false, todayTimes: [], nextTimes: [] }
  }

  const route = routes.find((x) => x.id === `dep-${guide.liveGroupKey}`)
  if (!route) return { status: "unknown", isLive, todayTimes: [], nextTimes: [] }

  const nowMin = new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCHours() * 60 +
    new Date(Date.now() + 9 * 60 * 60 * 1000).getUTCMinutes()
  const next = route.times.filter((t) => toMinutes(t) > nowMin).slice(0, 4)

  return {
    status: route.status,
    isLive: route.isLive ?? isLive,
    todayTimes: route.times,
    nextTimes: next,
    cancelReason: route.cancelReason,
    cancelKind: route.cancelKind,
  }
}
