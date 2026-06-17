"use client"

import { useEffect } from "react"
import { windDirLabel, ptyLabel } from "@/lib/weather"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast, TidalEvent } from "@/lib/tide"

interface Props {
  weather: WeatherData
  tidal: TidalForecast | null
  onClose: () => void
}

export default function WeatherDetail({ weather: w, tidal, onClose }: Props) {
  const { text: ptyText, icon: ptyIcon } = ptyLabel(w.pty)
  const baseStr = `${w.baseDate.slice(0, 4)}.${w.baseDate.slice(4, 6)}.${w.baseDate.slice(6)} ${w.baseTime.slice(0, 2)}:${w.baseTime.slice(2)} 기준`

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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div
        className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pt-2 pb-8">
          {/* 헤더 */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">완도 날씨 상세</h2>
              <p className="mt-0.5 text-xs text-slate-400">{baseStr}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="닫기"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* 현재 날씨 카드 */}
          <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-4 text-white">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold tracking-tight">{w.temp}°</span>
              <span className="text-3xl">{ptyIcon}</span>
              <span className="text-lg text-white/90">{ptyText}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-sm">
              <div>
                <p className="text-[11px] text-white/50">바람</p>
                <p className="font-semibold">{w.windSpeed} m/s</p>
                <p className="text-[11px] text-white/60">{windDirLabel(w.windDir)}풍</p>
              </div>
              <div className="border-l border-white/10 pl-2">
                <p className="text-[11px] text-white/50">습도</p>
                <p className="font-semibold">{w.humidity}%</p>
              </div>
              <div className="border-l border-white/10 pl-2">
                <p className="text-[11px] text-white/50">강수</p>
                <p className="font-semibold">
                  {w.rain1h > 0 ? `${w.rain1h} mm` : "없음"}
                </p>
              </div>
            </div>
          </div>

          {/* 조석예보 섹션 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                오늘 조석예보
              </p>
              {tidal && (
                <span className="text-[11px] text-slate-400">{tidal.obsName} 관측소 기준</span>
              )}
            </div>

            {tidal && tidal.events.length > 0 ? (
              <TidalTable events={tidal.events} />
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
                <p className="text-2xl">🌊</p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  조석 정보를 불러올 수 없습니다
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  KHOA_API_KEY 환경변수가 설정되면 만조·간조 예보를 확인할 수 있습니다
                </p>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            조석 정보는 국립해양조사원(KHOA) 예보 기준이며 참고용입니다.
          </p>
        </div>
      </div>
    </div>
  )
}

function TidalTable({ events }: { events: TidalEvent[] }) {
  const maxH = Math.max(...events.map((e) => e.height), 400)
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  return (
    <div className="space-y-2">
      {events.map((e, i) => {
        const [h, m] = e.time.split(":").map(Number)
        const eventMin = h * 60 + m
        const isPast = eventMin < nowMin
        const isNext = !isPast && events.slice(0, i).every((prev) => {
          const [ph, pm] = prev.time.split(":").map(Number)
          return ph * 60 + pm < nowMin
        })
        const pct = Math.round((e.height / maxH) * 100)
        const isHigh = e.type === "high"

        return (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
              isNext
                ? "bg-blue-50 ring-1 ring-blue-200"
                : isPast
                  ? "opacity-40 bg-slate-50"
                  : "bg-slate-50"
            }`}
          >
            <div
              className={`w-14 text-sm font-semibold tabular-nums ${
                isNext ? "text-blue-700" : isPast ? "text-slate-400" : "text-slate-700"
              }`}
            >
              {e.time}
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isHigh
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {isHigh ? "만조" : "간조"}
            </span>
            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    isHigh ? "bg-blue-500" : "bg-slate-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <div
              className={`w-16 text-right text-sm font-semibold tabular-nums ${
                isNext ? "text-blue-700" : isPast ? "text-slate-400" : "text-slate-700"
              }`}
            >
              {e.height}
              <span className="text-xs font-normal text-slate-400"> cm</span>
            </div>
            {isNext && (
              <span className="shrink-0 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                다음
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
