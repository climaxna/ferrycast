export function kstDateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + (9 * 60 * 60 + offsetDays * 86400) * 1000)
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`
}

export function dayLabel(date: string, today: string): string {
  const toMs = (s: string) => new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`).getTime()
  const diff = Math.round((toMs(date) - toMs(today)) / 86400000)
  if (diff === 0) return "오늘"
  if (diff === 1) return "내일"
  if (diff === 2) return "모레"
  return `${date.slice(4, 6)}/${date.slice(6)}`
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export function relativeTime(t: string, nowMin: number): string {
  const diff = toMinutes(t) - nowMin
  if (diff <= 0) return ""
  if (diff < 60) return `${diff}분 후`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}시간 ${m}분 후` : `${h}시간 후`
}
