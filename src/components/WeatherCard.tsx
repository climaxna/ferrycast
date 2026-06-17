import { getWandoWeather, windDirLabel, ptyLabel, waveLabel } from "@/lib/weather"
import RefreshButton from "./RefreshButton"

export default async function WeatherCard() {
  const w = await getWandoWeather()

  if (!w) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        날씨 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
      </div>
    )
  }

  const { text: ptyText, icon: ptyIcon } = ptyLabel(w.pty)
  const timeStr = `${w.baseDate.slice(4, 6)}.${w.baseDate.slice(6)} ${w.baseTime.slice(0, 2)}:${w.baseTime.slice(2)}`
  const wave = w.waveHeight !== undefined ? waveLabel(w.waveHeight) : null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 via-cyan-800 to-slate-900 p-5 text-white shadow-lg shadow-cyan-900/10">
      {/* 장식용 물결 */}
      <svg
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/5"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="50" />
      </svg>

      <div className="relative flex items-center justify-between">
        <h2 className="text-sm font-medium text-white/70">완도 현재 날씨</h2>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-white/50">{timeStr} 기준</span>
          <RefreshButton />
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-3">
        <span className="text-5xl font-bold tracking-tight">{w.temp}°</span>
        <span className="text-4xl">{ptyIcon}</span>
        <span className="text-lg font-medium text-white/90">{ptyText}</span>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3.5 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-white/50">바람</span>
          <span className="font-semibold">
            {w.windSpeed}<span className="text-xs font-normal text-white/70"> m/s</span>
          </span>
          <span className="text-[11px] text-white/60">{windDirLabel(w.windDir)}풍</span>
        </div>
        <div className="flex flex-col gap-0.5 border-l border-white/10 pl-2">
          <span className="text-[11px] text-white/50">습도</span>
          <span className="font-semibold">{w.humidity}%</span>
          {w.rain1h > 0 && <span className="text-[11px] text-white/60">강수 {w.rain1h}mm</span>}
        </div>
        <div className="flex flex-col gap-0.5 border-l border-white/10 pl-2">
          <span className="text-[11px] text-white/50">파고</span>
          {wave ? (
            <>
              <span className="font-semibold">{w.waveHeight!.toFixed(1)}m</span>
              <span className="text-[11px] font-medium text-cyan-200">{wave.text}</span>
            </>
          ) : (
            <span className="text-xs text-white/40">정보 없음</span>
          )}
        </div>
      </div>
    </div>
  )
}
