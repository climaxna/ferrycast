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
  originName?: string   // 출발 지역명 (기본값: "완도", 다지역 확장용)
  islandTerminal?: string  // 도착 탭 전용: 섬에서 타는 터미널 (예: "도청항")
  fare?: FareInfo
  fareUrl?: string
  tomorrow?: {
    tripCount: number
    times: string[]
  }
  via?: Record<string, string>  // "HH:MM" → 경유지명. 예: { "13:40": "추자도" }. 없으면 직항.
  arrivals?: Record<string, string>  // "출발HH:MM" → "도착예정HH:MM" (TAGO 여객선 실데이터)
  durationMin?: number          // TAGO 도착시각 미존재/비정상 시 fallback 계산용 소요시간(분)
  cancelReason?: string         // 결항 사유 (예: "풍랑주의보") — MTIS 통제/미운항 사유
  // 부분 결항 — 노선 전체는 운항(status="operating")이지만 일부 편만 결항일 때 그 편들.
  // 정상편과 5분 이내 겹치는 시각은 제외(정상 우선). status="cancelled"(전편 결항)면 비움.
  cancelledTimes?: { time: string; reason?: string }[]
  // 섬↔섬 노선(약산권) 전용 — 한 카드에 왕복을 함께 담기 위한 반대 방향 시간표
  returnTrip?: {
    label: string               // "금일 → 약산"
    times: string[]
    tomorrow?: { tripCount: number; times: string[] }
  }
  noBooking?: boolean           // 온라인 예매 없음(현장 매표소 발권) → 해운조합 예약 버튼 숨김
  bookingNote?: string          // 예약 버튼 대체 안내 (예: "현장 매표소 발권 · 약산농협 061-553-9088")
}
