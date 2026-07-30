import type { ReactNode } from "react"
import { windDirLabel, ptyLabel, waveLabel } from "@/lib/weather"
import { nextTidalEvent } from "@/lib/tide"
import { kstDateStr } from "@/lib/utils"
import type { WeatherData } from "@/lib/weather"
import type { TidalForecast } from "@/lib/tide"
import RefreshButton from "./RefreshButton"
import WeatherIcon from "./WeatherIcon"

// 날씨·조석 카드의 시각 표현 전담 — 완도(WeatherCardClient)·다지역(RegionWeatherCardClient) 공용.
// 두 파일에 동일 마크업이 복제돼 있어 한쪽만 고치면 어긋나던 것을 여기로 합쳤다.
// 상세 모달 배선(어떤 ForecastDetail을 열지)은 각 클라이언트가 담당하고, 여기서는 콜백만 받는다.
//
// 레이아웃 원칙: 지표를 flex-wrap으로 흘리지 않고 **균등 그리드**로 고정한다.
// (예전엔 기온·바람·습도·파고 4개가 358px에 안 맞아 파고만 둘째 줄로 떨어지고,
//  데이터 길이에 따라 줄바꿈 위치가 바뀌어 레이아웃이 매번 달라졌다.)
export default function WeatherCardShell({
  w,
  tidal,
  showTidalZone,
  onWeather,
  onTidal,
}: {
  w: WeatherData
  tidal: TidalForecast | null
  showTidalZone: boolean   // 조석 관측소가 없는 지역(포항 등)은 false로 존 자체를 숨김
  onWeather: () => void
  onTidal: () => void
}) {
  const { text: ptyText, kind: ptyKind } = ptyLabel(w.pty, w.sky)
  // 관측시각 — 오늘 관측이면 시각만 표시(현재 날씨 카드에서 오늘 날짜는 군더더기이고,
  // 히어로 한 줄에 넣을 공간을 벌어 날씨 라벨이 잘리지 않는다).
  // 단 API 실패로 직전값(최대 6시간, weather.ts의 _lastGood*)이 다른 날짜면 날짜까지 밝혀 오해를 막는다.
  const hhmm = `${w.baseTime.slice(0, 2)}:${w.baseTime.slice(2)}`
  const timeStr = w.baseDate === kstDateStr()
    ? hhmm
    : `${w.baseDate.slice(4, 6)}/${w.baseDate.slice(6)} ${hhmm}`
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nextTide = tidal ? nextTidalEvent(tidal.events, nowMin) : null
  const wave = w.waveHeight !== undefined ? waveLabel(w.waveHeight) : null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] text-white shadow-sm">
      {/* 새로고침 — 날씨존 버튼 밖(중첩 버튼 방지), 우상단 절대배치 */}
      <div className="absolute right-2 top-2 z-10">
        <RefreshButton />
      </div>

      {/* 날씨 존 — 클릭 시 5일 예보 */}
      <button
        type="button"
        onClick={onWeather}
        aria-label="단기 날씨 예보 보기"
        className="relative w-full px-4 pb-2.5 pt-3 text-left transition-colors hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
      >
        {/* 히어로 — 기온·날씨·관측시각을 한 줄로 (세로 한 줄 절약).
            pr-10은 우상단 새로고침 자리 확보 — 관측시각을 오른쪽 끝으로 밀지 않고
            날씨 텍스트 바로 뒤에 붙여, 새로고침 버튼과 나란히 붙어 보이는 것을 피한다.
            긴 라벨("빗방울·눈날림")일 때는 관측시각(shrink-0) 대신 라벨이 줄어든다. */}
        <div className="flex items-center gap-2.5 pr-10">
          <span className="shrink-0 text-3xl font-bold tabular-nums leading-none">{Math.round(w.temp)}°</span>
          <WeatherIcon kind={ptyKind} size={26} className="text-white" />
          <span className="truncate text-sm font-medium text-white/90">{ptyText}</span>
          <span className="shrink-0 text-[11px] leading-none text-white/60">{timeStr} 기준</span>
        </div>

        {/* 지표 행 — 그리드(파고 유무로 3열/2열, Tailwind JIT용 완전 리터럴) + 열기(+)를 같은 행에
            두어 세로 한 줄을 절약 (모바일에서 배편 카드를 밀어내지 않도록) */}
        <div className="mt-2 flex items-center gap-2 border-t border-white/15 pt-2">
          <div className={`grid min-w-0 flex-1 gap-2 ${wave ? "grid-cols-3" : "grid-cols-2"}`}>
            <Metric label="바람">
              {w.windSpeed}
              <Unit> m/s</Unit>
              <Unit className="ml-1">{windDirLabel(w.windDir)}</Unit>
            </Metric>
            <Metric label="습도">
              {w.humidity}
              <Unit>%</Unit>
            </Metric>
            {wave && (
              /* 파고 색 강조는 유지 — 보통(amber)·거침(orange)·매우거침(red)은 배 뜨는지와 직결 */
              <Metric label="파고" valueClass={wave.color}>
                {w.waveHeight}m
                <Unit className="ml-1" small>{wave.text}</Unit>
              </Metric>
            )}
          </div>
          <PlusBadge />
        </div>
      </button>

      {/* 조석 존 — 클릭 시 5일 조석 예보 */}
      {showTidalZone && (
        <button
          type="button"
          onClick={onTidal}
          aria-label="5일 조석 예보 보기"
          className="relative w-full border-t border-white/10 px-4 py-2.5 text-left transition-colors hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] text-white/70">다음 조석</span>
              {nextTide ? (
                <>
                  <span className="shrink-0 text-sm font-bold text-sky-300">
                    {nextTide.type === "high" ? "만조" : "간조"}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums">{nextTide.time}</span>
                  <span className="shrink-0 text-xs text-white/70">{nextTide.height}cm</span>
                </>
              ) : (
                <span className="text-sm text-white/90">정보 없음</span>
              )}
            </div>
            <PlusBadge />
          </div>
        </button>
      )}
    </div>
  )
}

// 지표 한 칸 — 라벨(11px, 흐림) 위 / 값(14px bold) 아래. 그리드 칸을 넘치면 잘라 레이아웃 보호.
function Metric({
  label,
  valueClass = "",
  children,
}: {
  label: string
  valueClass?: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] leading-none text-white/70">{label}</p>
      <p className={`mt-1 truncate text-sm font-bold leading-none ${valueClass}`}>{children}</p>
    </div>
  )
}

// 단위·보조 텍스트 (m/s, %, 풍향, 파고 상태). small은 좁은 칸(파고 상태)용.
function Unit({
  children,
  className = "",
  small = false,
}: {
  children: ReactNode
  className?: string
  small?: boolean
}) {
  return (
    <span className={`font-normal text-white/80 ${small ? "text-[10px]" : "text-[11px]"} ${className}`}>
      {children}
    </span>
  )
}

// 열기 액션 — "단기 날씨 예보 →"/"5일 조석 예보 →" 텍스트를 대체하는 + 기호.
// 접근성 이름은 감싸는 button의 aria-label이 담당하므로 여기서는 aria-hidden.
function PlusBadge() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  )
}
