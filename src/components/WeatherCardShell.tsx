import { ptyLabel } from "@/lib/weather"
import type { WeatherData } from "@/lib/weather"
import WeatherIcon from "./WeatherIcon"

// 컴팩트 날씨 카드 — 온도 + 날씨 + 관측시각 한 줄만. 나머지(바람·습도·파고·조석·5일예보)는
// 클릭 시 WeatherTideDetail 전체화면에서. 실시간 배편이 주인공이라 날씨는 최소 높이로.
export default function WeatherCardShell({
  w,
  onOpen,
}: {
  w: WeatherData
  onOpen: () => void
}) {
  const { text: ptyText, kind: ptyKind } = ptyLabel(w.pty, w.sky)
  const timeStr = `${w.baseDate.slice(4, 6)}/${w.baseDate.slice(6)} ${w.baseTime.slice(0, 2)}:${w.baseTime.slice(2)}`

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="날씨·물때 자세히 보기"
      className="relative flex w-full items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-4 py-3 text-left text-white shadow-sm transition-colors hover:brightness-105 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
    >
      <span className="shrink-0 text-3xl font-bold tabular-nums leading-none">{Math.round(w.temp)}°</span>
      <WeatherIcon kind={ptyKind} size={24} className="shrink-0 text-white" />
      <span className="truncate text-sm font-medium text-white/90">{ptyText}</span>
      <span className="ml-auto shrink-0 text-[11px] leading-none text-white/60">{timeStr} 기준</span>
      {/* 자세히 열기 표시 (접근성 이름은 button aria-label이 담당) */}
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
    </button>
  )
}
