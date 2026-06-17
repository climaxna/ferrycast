"use client"

import { windDirLabel, ptyLabel } from "@/lib/weather"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast, TidalEvent } from "@/lib/tide"
import { useModalClose } from "@/hooks/useModalClose"

interface Props {
  weather: WeatherData
  tidal: TidalForecast | null
  onClose: () => void
}

export default function WeatherDetail({ weather: w, tidal, onClose }: Props) {
  useModalClose(onClose)
  const { text: ptyText, icon: ptyIcon } = ptyLabel(w.pty)
  const baseStr = `${w.baseDate.slice(0, 4)}.${w.baseDate.slice(4, 6)}.${w.baseDate.slice(6)} ${w.baseTime.slice(0, 2)}:${w.baseTime.slice(2)} 기준`

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white" style={{ height: '100dvh' }}>
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
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">완도 날씨 상세</h2>
          <p className="text-xs text-slate-400">{baseStr}</p>
        </div>
      </div>

      {/* 스크롤 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-4 py-5 space-y-6">

          {/* 현재 날씨 카드 */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-5 text-white">
            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold tracking-tight">{w.temp}°</span>
              <span className="text-4xl">{ptyIcon}</span>
              <span className="text-xl font-medium text-white/90">{ptyText}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-white/50">바람</p>
                <p className="mt-1 text-lg font-bold">{w.windSpeed} <span className="text-sm font-normal text-white/70">m/s</span></p>
                <p className="text-xs text-white/60">{windDirLabel(w.windDir)}풍</p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-xs text-white/50">습도</p>
                <p className="mt-1 text-lg font-bold">{w.humidity}<span className="text-sm font-normal text-white/70">%</span></p>
              </div>
              <div className="border-l border-white/10 pl-3">
                <p className="text-xs text-white/50">강수</p>
                <p className="mt-1 text-lg font-bold">{w.rain1h > 0 ? `${w.rain1h}` : "–"}<span className="text-sm font-normal text-white/70">{w.rain1h > 0 ? " mm" : ""}</span></p>
                {w.rain1h <= 0 && <p className="text-xs text-white/60">없음</p>}
              </div>
            </div>
          </div>

          {/* 조석예보 */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">오늘 조석예보</h3>
              {tidal && (
                <span className="text-xs text-slate-400">{tidal.obsName} 관측소 기준</span>
              )}
            </div>

            {tidal && tidal.events.length > 0 ? (
              <TidalTable events={tidal.events} />
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
                <p className="text-3xl">🌊</p>
                <p className="mt-3 text-base font-semibold text-slate-500">조석 정보를 불러올 수 없습니다</p>
                <p className="mt-1.5 text-sm text-slate-400">
                  잠시 후 다시 시도해 주세요
                </p>
              </div>
            )}
          </div>

          <p className="pb-6 text-xs text-slate-400">
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
    <div className="space-y-3">
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
            className={`rounded-2xl px-4 py-4 ${
              isNext
                ? "bg-blue-50 ring-2 ring-blue-200"
                : isPast
                  ? "bg-slate-50 opacity-50"
                  : "bg-slate-50"
            }`}
          >
            {/* 시간 + 만조/간조 + 다음 뱃지 */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold tabular-nums ${isNext ? "text-blue-700" : "text-slate-700"}`}>
                  {e.time}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    isHigh
                      ? isNext ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"
                      : isNext ? "bg-slate-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isHigh ? "만조" : "간조"}
                </span>
                {isNext && (
                  <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    다음
                  </span>
                )}
              </div>
              <span className={`text-2xl font-bold tabular-nums ${isNext ? "text-blue-700" : "text-slate-700"}`}>
                {e.height}<span className="ml-0.5 text-base font-normal text-slate-400">cm</span>
              </span>
            </div>

            {/* 수위 바 */}
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${isHigh ? "bg-blue-500" : "bg-slate-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
