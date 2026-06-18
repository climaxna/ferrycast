"use client"

import { useState } from "react"

interface Props {
  routeLabel: string
  departureTime: string // "HH:MM"
  onClose: () => void
  onAlarmSet?: (time: string) => void
}

const OFFSETS = [30, 10, 5] // 분 전

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    !!(window.navigator as { standalone?: boolean }).standalone
  )
}

function getDelayMs(departureTime: string, offsetMinutes: number): number {
  const now = new Date()
  const [h, m] = departureTime.split(":").map(Number)
  const dep = new Date(now)
  dep.setHours(h, m, 0, 0)
  return dep.getTime() - now.getTime() - offsetMinutes * 60 * 1000
}

export default function AlarmSheet({ routeLabel, departureTime, onClose, onAlarmSet }: Props) {
  const [status, setStatus] = useState<"idle" | "done" | "denied" | "unsupported">("idle")
  const standalone = isStandalone()
  const availableOffsets = OFFSETS.filter((off) => getDelayMs(departureTime, off) > 0)

  async function handleSet() {
    if (!("Notification" in window)) {
      setStatus("unsupported")
      return
    }
    const perm = await Notification.requestPermission()
    if (perm !== "granted") {
      setStatus("denied")
      return
    }
    const sw = await navigator.serviceWorker.ready
    for (const off of availableOffsets) {
      sw.active?.postMessage({
        type: "SCHEDULE_ALARM",
        routeLabel,
        departureTime,
        offsetMinutes: off,
        delayMs: getDelayMs(departureTime, off),
      })
    }
    setStatus("done")
    onAlarmSet?.(departureTime)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg rounded-t-3xl bg-white px-5 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

        <p className="text-lg font-bold text-slate-900">{routeLabel}</p>
        <p className="mt-0.5 text-2xl font-bold tabular-nums text-blue-600">{departureTime} 출발</p>

        {/* 홈화면 미설치 시 안내 */}
        {!standalone ? (
          <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-4">
            <p className="font-bold text-amber-700">홈화면 설치 후 사용 가능합니다</p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-600">
              알림 기능은 홈화면에 앱을 설치한 경우에만 안정적으로 작동합니다.
            </p>
            <p className="mt-1 text-sm text-amber-600">
              iOS: 공유 버튼 → 홈 화면에 추가
            </p>
            <p className="text-sm text-amber-600">
              Android: 브라우저 메뉴 → 앱 설치
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-2xl bg-amber-100 py-3 text-sm font-bold text-amber-700"
            >
              닫기
            </button>
          </div>
        ) : status === "done" ? (
          <div className="mt-6 rounded-2xl bg-blue-50 py-5 text-center">
            <p className="text-3xl">✅</p>
            <p className="mt-2 font-bold text-blue-700">
              {availableOffsets.map((o) => `${o}분 전`).join(" · ")} 알림 설정 완료
            </p>
          </div>
        ) : status === "denied" ? (
          <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-4">
            <p className="font-bold text-rose-600">알림 권한이 거부되었습니다</p>
            <p className="mt-1 text-sm text-rose-500">설정 → 브라우저 → 알림에서 권한을 허용해 주세요</p>
          </div>
        ) : status === "unsupported" ? (
          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-500">이 브라우저는 알림을 지원하지 않습니다</p>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              {availableOffsets.length > 0 ? (
                availableOffsets.map((off) => (
                  <div key={off} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-blue-500">🔔</span>
                    <span className="font-semibold text-slate-700">{off}분 전 알림</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">출발 시간이 너무 가까워 설정할 수 없습니다</p>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              {availableOffsets.length > 0 && (
                <button
                  onClick={handleSet}
                  className="flex-1 rounded-2xl bg-blue-500 py-3.5 text-base font-bold text-white"
                >
                  알림 설정
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-2xl bg-slate-100 px-5 py-3.5 text-base font-semibold text-slate-600"
              >
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
