"use client"

import { useEffect, useState } from "react"
import type { WandoRoute } from "@/lib/types"

interface Props {
  route: WandoRoute
  isDeparture: boolean
  onClose: () => void
}

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function relativeTime(t: string, nowMin: number): string {
  const diff = toMin(t) - nowMin
  if (diff <= 0) return ""
  if (diff < 60) return `${diff}분 후`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}시간 ${m}분 후` : `${h}시간 후`
}

export default function RouteDetail({ route, isDeparture, onClose }: Props) {
  const isCancelled = route.status === "cancelled"
  const isUnknown = route.status === "unknown"
  const routeLabel = route.from ? `${route.from} → ${route.to}` : `완도 → ${route.to}`
  const timeHeading = isDeparture ? "오늘 출발 시간표" : `오늘 ${route.from} 출발 시간표`
  const isAltTerminal = route.terminal !== "완도여객선터미널"
  const terminalRole = isDeparture ? "출발" : "도착"

  const [nowMinutes, setNowMinutes] = useState(0)
  useEffect(() => {
    const update = () => {
      const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
      setNowMinutes(kst.getUTCHours() * 60 + kst.getUTCMinutes())
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  const nextIdx = route.times.findIndex((t) => toMin(t) > nowMinutes)
  const pastTimes = route.times.slice(0, nextIdx === -1 ? route.times.length : nextIdx)
  const nextTime = nextIdx >= 0 ? route.times[nextIdx] : null
  const futureTimes = nextIdx >= 0 ? route.times.slice(nextIdx + 1) : []

  const { fare } = route

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white" style={{ height: "100dvh" }}>
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="닫기"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">{routeLabel}</h2>
          {route.operator && (
            <p className="truncate text-xs text-slate-400">{route.operator}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${
            isCancelled
              ? "bg-rose-50 text-rose-600"
              : isUnknown
                ? "bg-slate-100 text-slate-500"
                : "bg-blue-50 text-blue-700"
          }`}
        >
          {isCancelled ? "결항" : isUnknown ? "운항예정" : "운항"}
        </span>
      </div>

      {/* 스크롤 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg space-y-5 px-4 py-5">

          {/* 터미널 안내 */}
          <div
            className={`flex items-start gap-3 rounded-2xl px-4 py-4 ${
              isAltTerminal ? "bg-amber-50" : "bg-slate-50"
            }`}
          >
            <svg
              className={`mt-0.5 shrink-0 ${isAltTerminal ? "text-amber-600" : "text-slate-400"}`}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            <div className="min-w-0">
              <p className={`text-base font-bold ${isAltTerminal ? "text-amber-800" : "text-slate-700"}`}>
                완도 {terminalRole} · {route.terminal}
              </p>
              {isAltTerminal && (
                <p className="mt-1.5 text-sm leading-relaxed text-amber-700">
                  완도여객선터미널이 아닌 <strong className="font-bold">화흥포항</strong>에서{" "}
                  {terminalRole}합니다. 터미널 위치가 다르니 방문 전 꼭 확인하세요.
                </p>
              )}
            </div>
          </div>

          {/* 시간표 */}
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
              {timeHeading}
            </p>
            {isCancelled ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-6 text-center">
                <p className="text-3xl">🚢</p>
                <p className="mt-2 text-lg font-bold text-rose-600">오늘 결항</p>
                <p className="mt-1 text-sm text-rose-500">공식 채널에서 최종 확인하세요.</p>
              </div>
            ) : route.times.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {pastTimes.map((t) => (
                  <span
                    key={t}
                    className="rounded-2xl bg-slate-50 px-5 py-3 text-xl font-bold tabular-nums text-slate-300 line-through shadow-sm"
                  >
                    {t}
                  </span>
                ))}
                {nextTime && (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="rounded-2xl bg-blue-500 px-5 py-3 text-xl font-bold tabular-nums text-white shadow-md">
                      {nextTime}
                    </span>
                    <span className="text-xs font-semibold text-blue-500">
                      {relativeTime(nextTime, nowMinutes)}
                    </span>
                  </div>
                )}
                {futureTimes.map((t) => (
                  <span
                    key={t}
                    className="rounded-2xl bg-blue-50 px-5 py-3 text-xl font-bold tabular-nums text-blue-700 shadow-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-base text-slate-400">시간표 정보 없음</p>
            )}
            {!isCancelled && nextTime === null && route.times.length > 0 && (
              <p className="mt-3 text-sm text-slate-400">오늘 모든 편 출발 완료</p>
            )}
          </div>

          {/* 운임 요금 */}
          {fare && (
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">운임 요금</p>
              <div className="divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4 py-1">
                <div className="flex items-center justify-between py-3">
                  <span className="text-base text-slate-600">성인 (편도)</span>
                  <span className="text-lg font-bold text-slate-900">{fare.adult.toLocaleString()}원</span>
                </div>
                {fare.teen !== undefined && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-base text-slate-600">청소년 (중·고교생)</span>
                    <span className="text-lg font-bold text-slate-900">{fare.teen.toLocaleString()}원</span>
                  </div>
                )}
                {fare.child !== undefined && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-base text-slate-600">어린이</span>
                    <span className="text-lg font-bold text-slate-900">{fare.child.toLocaleString()}원</span>
                  </div>
                )}
                {(fare.carSmall !== undefined || fare.carRegular !== undefined) && (
                  <div className="pt-3 pb-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">차량 선적</p>
                    {fare.carSmall !== undefined && (
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-base text-slate-600">소형차</span>
                        <span className="text-lg font-bold text-slate-900">{fare.carSmall.toLocaleString()}원</span>
                      </div>
                    )}
                    {fare.carRegular !== undefined && (
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-base text-slate-600">일반 승용차</span>
                        <span className="text-lg font-bold text-slate-900">{fare.carRegular.toLocaleString()}원</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">* 2024년 기준 참고 요금 · 실제 요금은 운항사 또는 예매 사이트에서 확인하세요</p>
            </div>
          )}

          {/* 안내 문구 */}
          <p className="text-sm text-slate-400">
            {route.isLive
              ? "실시간 데이터 기준 · 기상 상황에 따라 변동될 수 있습니다"
              : "참고용 시간표 · 실제 운항 여부는 공식 채널에서 확인하세요"}
          </p>

          {/* 예약 버튼 */}
          <a
            href="https://island.theksa.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-center text-base font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
          >
            해운조합 승선 예약하기
          </a>
        </div>
      </div>
    </div>
  )
}
