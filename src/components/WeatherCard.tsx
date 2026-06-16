import { getWandoWeather, windDirLabel, ptyLabel } from "@/lib/weather"

export default async function WeatherCard() {
  const w = await getWandoWeather()

  if (!w) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        날씨 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.
      </div>
    )
  }

  const { text: ptyText, icon: ptyIcon } = ptyLabel(w.pty)
  const timeStr = `${w.baseDate.slice(0, 4)}-${w.baseDate.slice(4, 6)}-${w.baseDate.slice(6)} ${w.baseTime.slice(0, 2)}:${w.baseTime.slice(2)}`

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-blue-900">완도 현재 날씨</h2>
        <span className="text-xs text-blue-400">기준 {timeStr}</span>
      </div>

      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-blue-900">{w.temp}°C</span>
        <span className="mb-1 text-2xl">{ptyIcon}</span>
        <span className="mb-1 text-base font-medium text-blue-700">{ptyText}</span>
      </div>

      <div className="mt-3 flex gap-6 text-sm text-blue-700">
        <span>💨 {w.windSpeed} m/s · {windDirLabel(w.windDir)}</span>
        <span>💧 습도 {w.humidity}%</span>
        {w.rain1h > 0 && <span>🌧 {w.rain1h} mm/h</span>}
      </div>
    </div>
  )
}
