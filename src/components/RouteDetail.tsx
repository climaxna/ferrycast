"use client"

import type { WandoRoute } from "@/lib/types"

interface Props {
  route: WandoRoute
  isDeparture: boolean
  onClose: () => void
}

export default function RouteDetail({ route, isDeparture, onClose }: Props) {
  const isCancelled = route.status === "cancelled"
  const routeLabel = route.from ? `${route.from} → ${route.to}` : `완도 → ${route.to}`
  const timeHeading = isDeparture ? "오늘 출발 시간표" : "오늘 완도 도착 예정"

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 바텀 시트 */}
      <div
        className="relative w-full max-w-lg rounded-t-2xl bg-white pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 pt-2 pb-8">
          {/* 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{routeLabel}</h2>
              {route.operator && (
                <p className="text-sm text-gray-500 mt-0.5">🚢 {route.operator}</p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  isCancelled
                    ? "bg-red-100 text-red-700"
                    : route.status === "unknown"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {isCancelled ? "🔴 결항" : route.status === "unknown" ? "운항예정" : "🟢 운항"}
              </span>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="닫기"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 시간표 */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {timeHeading}
            </p>
            {isCancelled ? (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                오늘 이 항로는 결항입니다. 공식 채널에서 최종 확인하세요.
              </p>
            ) : route.times.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {route.times.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">시간표 정보 없음</p>
            )}
          </div>

          {/* 안내 문구 */}
          <p className="text-xs text-gray-400 mb-5">
            {route.isLive
              ? "실시간 데이터 기준 · 기상 상황에 따라 변동될 수 있습니다"
              : "참고용 시간표 · 실제 운항 여부는 공식 채널에서 확인하세요"}
          </p>

          {/* 예약 버튼 */}
          <a
            href="https://www.ferry.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            🎫 해운조합 승선 예약하기
          </a>
        </div>
      </div>
    </div>
  )
}
