"use client"

import { windDirLabel, ptyLabel, waveLabel } from "@/lib/weather"
import { nextTidalEvent } from "@/lib/tide"
import { skyIconKind, skyLabel } from "@/lib/forecast"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast, TidalDayForecast } from "@/lib/tide"
import type { DailyForecast } from "@/lib/forecast"
import { useModalClose } from "@/hooks/useModalClose"
import WeatherIcon, { weatherIconTone } from "./WeatherIcon"
import TideCurve from "./TideCurve"

// 날씨 + 물때 통합 상세 (완도·다지역 공용). 컴팩트 카드 클릭 시 전체화면으로:
//   ① 지금 실황(기온·바람·습도·파고 + 다음 조석) ② 5일 날씨 예보 ③ 5일 조석 예보(조석 지역만)
export default function WeatherTideDetail({
  regionName,
  w,
  tidal,
  forecast5,
  tidal5,
  onClose,
}: {
  regionName: string
  w: WeatherData
  tidal: TidalForecast | null
  forecast5: DailyForecast[]
  tidal5: TidalDayForecast[]
  onClose: () => void
}) {
  useModalClose(onClose)

  const { text: ptyText, kind: ptyKind } = ptyLabel(w.pty, w.sky)
  const wave = w.waveHeight !== undefined ? waveLabel(w.waveHeight) : null
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const todayStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
  const nextTide = tidal ? nextTidalEvent(tidal.events, nowMin) : null
  const hasTidal = tidal5.length > 0

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white" style={{ height: "100dvh" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
        <button
          onClick={onClose}
          className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="닫기"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{regionName} 날씨 · 물때</h2>
          <p className="text-xs text-slate-400">기상청 · 국립해양조사원(KHOA) 기준</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-4 py-5 space-y-6">

          {/* ① 지금 실황 */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">지금</h3>
            <div className="rounded-2xl bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] p-4 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold tabular-nums leading-none">{Math.round(w.temp)}°</span>
                <WeatherIcon kind={ptyKind} size={30} className="text-white" />
                <span className="text-base font-medium text-white/90">{ptyText}</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/15 pt-3">
                <StatCol label="바람">{w.windSpeed}<Sub> m/s {windDirLabel(w.windDir)}</Sub></StatCol>
                <StatCol label="습도">{w.humidity}<Sub>%</Sub></StatCol>
                {wave ? (
                  <StatCol label="파고" valueClass={wave.color}>{w.waveHeight}m<Sub small> {wave.text}</Sub></StatCol>
                ) : (
                  <StatCol label="파고"><span className="text-white/60">–</span></StatCol>
                )}
              </div>
              {nextTide && (
                <div className="mt-2 flex items-center gap-2 border-t border-white/15 pt-2 text-sm">
                  <span className="text-[11px] text-white/70">다음 조석</span>
                  <span className="font-bold text-sky-300">{nextTide.type === "high" ? "만조" : "간조"}</span>
                  <span className="tabular-nums">{nextTide.time}</span>
                  <span className="text-xs text-white/70">{nextTide.height}cm</span>
                </div>
              )}
            </div>
          </section>

          {/* ② 5일 날씨 예보 */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">단기 날씨 예보</h3>
            {forecast5.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">날씨 예보를 불러올 수 없습니다</p>
            ) : (
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
                {forecast5.map((day) => (
                  <div key={day.date} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-12 shrink-0">
                      <p className={`text-sm font-bold ${day.dateLabel === "오늘" ? "text-blue-600" : "text-slate-800"}`}>{day.dateLabel}</p>
                      <p className="text-[11px] text-slate-400">{day.date.slice(4, 6)}/{day.date.slice(6)}</p>
                    </div>
                    <div className="flex w-16 shrink-0 flex-col items-center gap-0.5">
                      {(() => { const kind = skyIconKind(day.sky, day.pty); return <WeatherIcon kind={kind} size={26} className={weatherIconTone(kind)} /> })()}
                      <span className="text-[11px] text-slate-500">{skyLabel(day.sky, day.pty)}</span>
                    </div>
                    <div className="flex flex-1 items-center justify-center gap-2.5">
                      <span className="text-lg font-bold text-blue-700">{day.tempMin !== undefined ? `${Math.round(day.tempMin)}°` : "–"}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-lg font-bold text-rose-600">{day.tempMax !== undefined ? `${Math.round(day.tempMax)}°` : "–"}</span>
                    </div>
                    <div className="w-11 shrink-0 text-right">
                      <p className="text-[11px] text-slate-400">강수</p>
                      <p className={`text-sm font-bold ${day.popMax >= 60 ? "text-blue-600" : day.popMax >= 30 ? "text-slate-600" : "text-slate-400"}`}>{day.popMax}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ③ 5일 조석 예보 — 조석 관측소 있는 지역만 */}
          {hasTidal && (
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">조석(물때) 예보</h3>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
                {tidal5.map((day) => (
                  <DayTidal key={day.date} day={day} isToday={day.date === todayStr} nowMin={day.date === todayStr ? nowMin : -1} />
                ))}
              </div>
            </section>
          )}

          <p className="pb-6 text-xs leading-relaxed text-slate-400">
            기상청 단기예보·국립해양조사원(KHOA) 예보 기준이며 기상 상황에 따라 변동될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCol({ label, valueClass = "", children }: { label: string; valueClass?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] leading-none text-white/70">{label}</p>
      <p className={`mt-1 truncate text-sm font-bold leading-none ${valueClass}`}>{children}</p>
    </div>
  )
}
function Sub({ children, small = false }: { children: React.ReactNode; small?: boolean }) {
  return <span className={`font-normal text-white/80 ${small ? "text-[10px]" : "text-[11px]"}`}>{children}</span>
}

function DayTidal({ day, isToday, nowMin }: { day: TidalDayForecast; isToday: boolean; nowMin: number }) {
  const nextIdx = isToday
    ? day.events.findIndex((e) => { const [h, m] = e.time.split(":").map(Number); return h * 60 + m > nowMin })
    : -1
  return (
    <div className="px-4 py-4">
      <div className="mb-2 flex items-center gap-2">
        <span className={`text-sm font-bold ${isToday ? "text-blue-600" : "text-slate-800"}`}>{day.dateLabel}</span>
        <span className="text-xs text-slate-400">{day.date.slice(4, 6)}/{day.date.slice(6)}</span>
        {isToday && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-600">TODAY</span>}
      </div>
      {day.events.length === 0 ? (
        <p className="text-sm text-slate-400">정보 없음</p>
      ) : (
        <>
          <div className="rounded-2xl bg-slate-50/70 px-1 py-2">
            <TideCurve events={day.events} nowMin={isToday ? nowMin : -1} gradientId={`tide-${day.date}`} />
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
            {day.events.map((event, i) => {
              const isHigh = event.type === "high"
              const isPast = isToday && i < nextIdx
              const isNext = i === nextIdx
              return (
                <div key={i} className={`flex flex-col items-center rounded-xl px-1 py-2 ${isNext ? "bg-blue-50 ring-1 ring-blue-200" : "bg-slate-50"} ${isPast ? "opacity-45" : ""}`}>
                  <span className={`text-[11px] font-bold ${isHigh ? "text-blue-600" : "text-slate-500"}`}>{isHigh ? "▲ 만조" : "▼ 간조"}</span>
                  <span className="mt-0.5 text-sm font-bold tabular-nums text-slate-800">{event.time}</span>
                  <span className="text-[11px] tabular-nums text-slate-400">{event.height}cm</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
