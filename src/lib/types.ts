export type RouteStatus = "operating" | "cancelled" | "unknown"

export interface WandoRoute {
  id: string
  to: string
  operator: string
  times: string[]
  status: RouteStatus
  isLive: boolean
}
