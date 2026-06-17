"use client"

import { useEffect } from "react"
import type { WandoRoute } from "@/lib/types"

interface Props {
  route: WandoRoute
  isDeparture: boolean
  onClose: () => void
}

export default function RouteDetail({ route, isDeparture, onClose }: Props) {
  const isCancelled = route.status === "cancelled"
  const isUnknown = route.status === "unknown"
  const routeLabel = route.from ? `${route.from} → ${route.to}` : `완도 → ${route.to}`
  const timeHeading = isDeparture ? "오늘 출발 시간표" : `오늘 ${route.from} 출발 시간표`

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* 바텀 시트 */}
      <div
        className="relative w-full max-w-lg rounded-t-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pt-2 pb-8">
          {/* 헤더 */}
          <div className="mb-5 flex items-start justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{routeLabel}</h2>
              {route.operator && (
                <p className="mt-1 truncate text-sm text-slate-400">{route.operator}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  isCancelled
                    ? "bg-rose-50 text-rose-600"
                    : isUnknown
                      ? "bg-slate-100 text-slate-500"
                      : "bg-teal-50 text-teal-700"
                }`}
              >
                {isCancelled ? "결항" : isUnknown ? "운항예정" : "운항"}
              </span>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="닫기"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* 시간표 */}
          <div className="mb-5">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {timeHeading}
            </p>
            {isCancelled ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
                오늘 이 항로는 결항입니다. 공식 채널에서 최종 확인하세요.
              </p>
            ) : route.times.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {route.times.map((t) => (
                  <span
                    key={t}
                    className="rounded-xl bg-slate-50 px-3 py-1.5 text-sm font-semibold tabular-nums text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">시간표 정보 없음</p>
            )}
          </div>

          {/* 안내 문구 */}
          <p className="mb-4 text-xs text-slate-400">
            {route.isLive
              ? "실시간 데이터 기준 · 기상 상황에 따라 변동될 수 있습니다"
              : "참고용 시간표 · 실제 운항 여부는 공식 채널에서 확인하세요"}
          </p>

          {/* 예약 버튼 */}
          <a
            href="https://island.theksa.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
          >
            해운조합 승선 예약하기
          </a>
        </div>
      </div>
    </div>
  )
}
