export type RouteStatus = "operating" | "cancelled" | "unknown"

export interface FareInfo {
  adult: number        // 성인 편도 (원)
  teen?: number        // 청소년 (중·고교생)
  child?: number       // 어린이
  carSmall?: number    // 소형차 (차량선적)
  carRegular?: number  // 일반 승용차
}

export interface WandoRoute {
  id: string
  to: string
  from?: string  // 도착 탭 전용: 출발지 (예: "제주")
  operator: string
  times: string[]
  status: RouteStatus
  isLive: boolean
  terminal: string      // 완도측 터미널 (예: "완도여객선터미널", "화흥포항")
  islandTerminal?: string  // 도착 탭 전용: 섬에서 타는 터미널 (예: "도청항")
  fare?: FareInfo
  fareUrl?: string
}
