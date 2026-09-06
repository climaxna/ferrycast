// Process-local cache and in-flight deduplication. A cold instance may have no
// previous observation; never fabricate a fallback or change its observation time.
import type { WeatherData } from "./weather"

const values = new Map<string, { data: WeatherData; at: number }>()
const pending = new Map<string, Promise<WeatherData | null>>()

export function observationAge(data: WeatherData, now = Date.now()): number {
  const d = data.baseDate
  const t = data.baseTime
  return now - Date.parse(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${t.slice(0, 2)}:${t.slice(2, 4)}:00+09:00`)
}

export function cachedWeather(key: string, load: () => Promise<WeatherData | null>): Promise<WeatherData | null> {
  const prev = values.get(key)
  if (prev && Date.now() - prev.at < 300_000 && observationAge(prev.data) < 3_600_000) return Promise.resolve(prev.data)
  const running = pending.get(key)
  if (running) return running
  const request = load().catch(() => null).then(data => {
    if (data && Number.isFinite(data.temp) && observationAge(data) >= 0 && observationAge(data) < 3 * 3_600_000) {
      values.set(key, { data, at: Date.now() })
      return data
    }
    console.warn(`[weather] ${key}: current observation unavailable`)
    if (prev && observationAge(prev.data) >= 0 && observationAge(prev.data) < 3 * 3_600_000) return { ...prev.data, stale: true }
    return null
  }).finally(() => pending.delete(key))
  pending.set(key, request)
  return request
}
