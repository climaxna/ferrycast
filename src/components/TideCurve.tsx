"use client"

import type { TidalEvent } from "@/lib/tide"

// 조석 곡선 SVG — 만조/간조 사이를 코사인 보간해 물결 곡선으로 그린다.
// 막대 대신 "지금 물이 차오르는 중인지 빠지는 중인지"가 한눈에 보이도록.

const W = 340
const H = 150
const PAD_X = 26
const PAD_TOP = 30
const PAD_BOTTOM = 34

function toMin(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export default function TideCurve({
  events,
  nowMin,
  gradientId,
}: {
  events: TidalEvent[]
  nowMin: number // 오늘이 아니면 -1
  gradientId: string
}) {
  if (events.length < 2) return null

  const heights = events.map((e) => e.height)
  const minH = Math.min(...heights)
  const maxH = Math.max(...heights)
  const range = Math.max(maxH - minH, 1)
  const plotW = W - PAD_X * 2
  const plotH = H - PAD_TOP - PAD_BOTTOM

  const x = (min: number) => PAD_X + (min / 1440) * plotW
  const y = (h: number) => PAD_TOP + (1 - (h - minH) / range) * plotH

  // 연속한 두 극점 사이를 코사인 보간 → 부드러운 물결
  const pts: Array<[number, number]> = []
  for (let i = 0; i < events.length - 1; i++) {
    const t0 = toMin(events[i].time)
    const t1 = toMin(events[i + 1].time)
    const h0 = events[i].height
    const h1 = events[i + 1].height
    const steps = 16
    for (let s = 0; s <= steps; s++) {
      const f = s / steps
      const tcos = (1 - Math.cos(Math.PI * f)) / 2
      const t = t0 + (t1 - t0) * f
      const h = h0 + (h1 - h0) * tcos
      pts.push([x(t), y(h)])
    }
  }

  const linePath = pts.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ")
  const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)} ${H - PAD_BOTTOM} L${pts[0][0].toFixed(1)} ${H - PAD_BOTTOM} Z`

  const nowX = nowMin >= 0 ? x(nowMin) : null
  const firstMin = toMin(events[0].time)
  const lastMin = toMin(events[events.length - 1].time)
  const nowInRange = nowX !== null && nowMin >= firstMin && nowMin <= lastMin

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="조석 곡선">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* 채움 영역 */}
      <path d={areaPath} fill={`url(#${gradientId})`} />
      {/* 곡선 */}
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* 현재 시각 표시선 */}
      {nowInRange && nowX !== null && (
        <>
          <line x1={nowX} y1={PAD_TOP - 8} x2={nowX} y2={H - PAD_BOTTOM} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x={nowX} y={PAD_TOP - 12} textAnchor="middle" className="fill-rose-500" fontSize="10" fontWeight="700">
            지금
          </text>
        </>
      )}

      {/* 극점 마커 + 라벨 */}
      {events.map((e, i) => {
        const px = x(toMin(e.time))
        const py = y(e.height)
        const isHigh = e.type === "high"
        const labelAbove = isHigh
        const anchor = px < PAD_X + 14 ? "start" : px > W - PAD_X - 14 ? "end" : "middle"
        const isPast = nowMin >= 0 && toMin(e.time) < nowMin

        return (
          <g key={i} opacity={isPast ? 0.45 : 1}>
            <circle cx={px} cy={py} r="4" fill={isHigh ? "#2563eb" : "#94a3b8"} stroke="#fff" strokeWidth="2" />
            {/* 시각 */}
            <text
              x={px}
              y={labelAbove ? py - 11 : py + 18}
              textAnchor={anchor}
              fontSize="11"
              fontWeight="700"
              className={isHigh ? "fill-blue-700" : "fill-slate-500"}
            >
              {e.time}
            </text>
            {/* 높이 */}
            <text
              x={px}
              y={labelAbove ? py - 22 : py + 29}
              textAnchor={anchor}
              fontSize="9"
              className="fill-slate-400"
            >
              {e.height}cm
            </text>
          </g>
        )
      })}
    </svg>
  )
}
