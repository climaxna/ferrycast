export type RouteStatus = "operating" | "cancelled" | "unknown"

export interface WandoRoute {
  id: string
  to: string
  from?: string  // 도착 탭 전용: 출발지 (예: "제주")
  operator: string
  times: string[]
  status: RouteStatus
  isLive: boolean
  terminal: string  // 완도측 터미널 (예: "완도여객선터미널", "화흥포항")
}
