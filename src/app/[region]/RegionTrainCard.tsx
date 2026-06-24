"use client"

import { useState, useEffect } from "react"
import { toMinutes, relativeTime } from "@/lib/utils"
import type { RegionTrainData, TrainDirection } from "@/lib/regionTrain"

export default function RegionTrainCard({ data }: { data: RegionTrainData }) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setNow(d.getHours() * 60 + d.getMinutes())
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold tracking-wide text-slate-500">
        <span aria-hidden="true">🚆</span> {data.stationName} 기차
      </h2>

      <div className="space-y-2.5">
        <Direction dir={data.outbound} now={now} />
        <Direction dir={data.inbound} now={now} />
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        {data.fare ? (
          <span className="text-xs text-slate-400">성인 편도 {data.fare.toLocaleString()}원~</span>
        ) : <span />}
        {data.bookingUrl && (
          <a
            href={data.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            코레일 예매 →
          </a>
        )}
      </div>
    </section>
  )
}

function Direction({ dir, now }: { dir: TrainDirection; now: number }) {
  const nextIdx = dir.times.findIndex((t) => toMinutes(t) > now)
  const next = nextIdx >= 0 ? dir.times[nextIdx] : null
  const past = dir.times.slice(0, nextIdx === -1 ? dir.times.length : nextIdx)
  const future = nextIdx >= 0 ? dir.times.slice(nextIdx + 1) : []

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
      <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />
      <div className="pl-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-slate-900">{dir.label}</span>
          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
            {dir.grade}
          </span>
        </div>

        {dir.times.length === 0 ? (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
            시간표 정보를 불러올 수 없습니다
          </p>
        ) : next ? (
          <>
            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-indigo-500">다음 출발</span>
                <span className="text-2xl font-bold tabular-nums text-indigo-800">{next}</span>
              </div>
              <span className="text-xs font-semibold text-indigo-600">{relativeTime(next, now)}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {past.map((t) => (
                <span key={t} className="rounded-md px-2 py-1 text-sm tabular-nums text-slate-400">{t}</span>
              ))}
              <span className="rounded-md bg-indigo-500 px-2.5 py-1 text-sm font-bold tabular-nums text-white">{next}</span>
              {future.map((t) => (
                <span key={t} className="rounded-md bg-indigo-100 px-2.5 py-1 text-sm font-semibold tabular-nums text-indigo-700">{t}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-2.5 rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-xs text-slate-400">오늘 운행 종료</span>
          </div>
        )}
      </div>
    </div>
  )
}
