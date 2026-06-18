"use client"

import { useEffect, useState } from "react"
import type { WandoRoute } from "@/lib/types"
import { useModalClose } from "@/hooks/useModalClose"
import { toMinutes as toMin, relativeTime } from "@/lib/utils"
import AlarmSheet from "@/components/AlarmSheet"

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
  const isAltTerminal = route.terminal !== "완도여객선터미널"
  const terminalRole = isDeparture ? "출발" : "도착"

  const [nowMinutes, setNowMinutes] = useState(0)
  const [alarmTime, setAlarmTime] = useState<string | null>(null)
  const [activeAlarms, setActiveAlarms] = useState<Set<string>>(new Set())

  useEffect(() => {
    const update = () => {
      const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
      setNowMinutes(kst.getUTCHours() * 60 + kst.getUTCMinutes())
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  useModalClose(onClose)

  const nextIdx = route.times.findIndex((t) => toMin(t) > nowMinutes)
  const pastTimes = route.times.slice(0, nextIdx === -1 ? route.times.length : nextIdx)
  const nextTime = nextIdx >= 0 ? route.times[nextIdx] : null
  const futureTimes = nextIdx >= 0 ? route.times.slice(nextIdx + 1) : []

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

          {/* 터미널 안내 — 클릭 시 카카오지도 */}
          {isDeparture ? (
            /* 출발 탭: 완도측 터미널 */
            <a
              href={`https://map.kakao.com/?q=${encodeURIComponent(isAltTerminal ? "완도 화흥포항" : "완도여객선터미널")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3 rounded-2xl px-4 py-4 transition-opacity active:opacity-70 ${
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-base font-bold ${isAltTerminal ? "text-amber-800" : "text-slate-700"}`}>
                    완도 출발 · {route.terminal}
                  </p>
                  <span className={`shrink-0 text-xs font-medium ${isAltTerminal ? "text-amber-600" : "text-slate-400"}`}>
                    지도 보기 →
                  </span>
                </div>
                {isAltTerminal && (
                  <p className="mt-1.5 text-sm leading-relaxed text-amber-700">
                    완도여객선터미널이 아닌 <strong className="font-bold">화흥포항</strong>에서 출발합니다.
                    터미널 위치가 다르니 방문 전 꼭 확인하세요.
                  </p>
                )}
              </div>
            </a>
          ) : (
            /* 도착 탭: 섬에서 타는 터미널 */
            <a
              href={`https://map.kakao.com/?q=${encodeURIComponent(route.islandTerminal ?? `${route.from} 여객터미널`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-2xl bg-blue-50 px-4 py-4 transition-opacity active:opacity-70"
            >
              <svg
                className="mt-0.5 shrink-0 text-blue-500"
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.2" />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold text-blue-400">타는 곳</p>
                    <p className="text-base font-bold text-blue-800">
                      {route.islandTerminal ?? `${route.from} 여객터미널`}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-blue-400">지도 보기 →</span>
                </div>
              </div>
            </a>
          )}

          {/* 시간표 */}
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {timeHeading}
              </p>
              {!isCancelled && (nextTime || futureTimes.length > 0) && (
                activeAlarms.size > 0 ? (
                  <button
                    onClick={async () => {
                      const sw = await navigator.serviceWorker?.ready
                      activeAlarms.forEach((t) =>
                        sw?.active?.postMessage({ type: "CANCEL_ALARMS", departureTime: t })
                      )
                      setActiveAlarms(new Set())
                    }}
                    className="text-[11px] font-semibold text-rose-400"
                  >
                    🔔 알림 {activeAlarms.size}개 설정됨 · 취소
                  </button>
                ) : (
                  <p className="text-[11px] text-slate-400">🔔 시간 탭 시 알림 설정</p>
                )
              )}
            </div>
            {isCancelled ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-6 text-center">
                <p className="text-3xl">🚢</p>
                <p className="mt-2 text-lg font-bold text-rose-600">오늘 결항</p>
                <p className="mt-1 text-sm text-rose-500">공식 채널에서 최종 확인하세요.</p>
              </div>
            ) : route.times.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {pastTimes.map((t) => (
                  <div
                    key={t}
                    className="flex items-center justify-center rounded-xl bg-slate-50 py-3 text-base font-bold tabular-nums text-slate-300 line-through shadow-sm"
                  >
                    {t}
                  </div>
                ))}
                {nextTime && (
                  <button
                    key={nextTime}
                    onClick={() => setAlarmTime(nextTime)}
                    className="flex flex-col items-center justify-center rounded-xl bg-blue-500 py-2 shadow-md active:opacity-80"
                  >
                    <span className="text-base font-bold tabular-nums text-white">{nextTime}</span>
                    <span className="text-[10px] font-semibold leading-tight text-blue-200">
                      {relativeTime(nextTime, nowMinutes)}
                    </span>
                  </button>
                )}
                {futureTimes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setAlarmTime(t)}
                    className="flex items-center justify-center rounded-xl bg-blue-50 py-3 text-base font-bold tabular-nums text-blue-700 shadow-sm active:opacity-70"
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-base text-slate-400">시간표 정보 없음</p>
            )}
            {!isCancelled && nextTime === null && route.times.length > 0 && (
              <p className="mt-3 text-sm text-slate-400">오늘 모든 편 출발 완료</p>
            )}
          </div>

          {/* 운임 요금 — 공식 링크 */}
          {route.fareUrl && (
            <a
              href={route.fareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition-opacity active:opacity-70"
            >
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">운임 요금</p>
                  <p className="text-base font-bold text-slate-800">공식 요금표 확인하기</p>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </a>
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

      {alarmTime && (
        <AlarmSheet
          routeLabel={routeLabel}
          departureTime={alarmTime}
          onClose={() => setAlarmTime(null)}
          onAlarmSet={(t) => setActiveAlarms((prev) => new Set(prev).add(t))}
        />
      )}
    </div>
  )
}
