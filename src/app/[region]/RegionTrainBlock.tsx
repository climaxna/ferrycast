"use client"

import { useState } from "react"
import { toMinutes, relativeTime } from "@/lib/utils"
import type { RegionTrainData, TrainDirection } from "@/lib/regionTrain"
import RegionTrainDetail from "./RegionTrainDetail"

// 배편 출발/도착 탭 안에 들어가는 KTX 블록 — 구분선으로 모드 구분
export default function RegionTrainBlock({
  data,
  direction,
  now,
}: {
  data: RegionTrainData
  direction: "dep" | "arr"
  now: number
}) {
  const [open, setOpen] = useState(false)
  const dir = direction === "dep" ? data.outbound : data.inbound

  return (
    <div className="pt-1.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-px flex-1 bg-slate-100" />
        <span className="flex items-center gap-1 text-xs font-bold tracking-wide text-indigo-500">
          <span aria-hidden="true">🚆</span> {data.stationName} KTX
        </span>
        <span className="h-px flex-1 bg-slate-100" />
      </div>

      <TrainItem dir={dir} now={now} onClick={() => setOpen(true)} />

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

      {open && (
        <RegionTrainDetail data={data} direction={direction} onClose={() => setOpen(false)} />
      )}
    </div>
  )
}

function TrainItem({ dir, now, onClick }: { dir: TrainDirection; now: number; onClick: () => void }) {
  const deps = dir.runs.map((r) => r.dep)
  const nextIdx = deps.findIndex((t) => toMinutes(t) > now)
  const next = nextIdx >= 0 ? deps[nextIdx] : null
  const past = deps.slice(0, nextIdx === -1 ? deps.length : nextIdx)
  const future = nextIdx >= 0 ? deps.slice(nextIdx + 1) : []
  const nextRun = nextIdx >= 0 ? dir.runs[nextIdx] : null

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-slate-200 hover:shadow-md active:scale-[0.99]"
    >
      <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />
      <div className="min-w-0 flex-1 pl-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-slate-900">{dir.fromName} → {dir.toName}</span>
          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">KTX</span>
        </div>

        {deps.length === 0 ? (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">시간표 정보를 불러올 수 없습니다</p>
        ) : next ? (
          <>
            <div className="mt-2.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-indigo-500">{dir.fromName} 출발</span>
                <span className="text-2xl font-bold tabular-nums text-indigo-800">{next}</span>
                {nextRun && <span className="text-xs text-indigo-500">→ {nextRun.arr} 도착</span>}
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
          <div className="mt-2.5 rounded-xl bg-slate-50 px-3 py-2"><span className="text-xs text-slate-400">오늘 {dir.fromName} 출발 종료</span></div>
        )}
      </div>
      <span className="mt-0.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5">›</span>
    </button>
  )
}
