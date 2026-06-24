"use client"

import { useEffect, useState } from "react"
import { useModalClose } from "@/hooks/useModalClose"
import { toMinutes } from "@/lib/utils"
import type { RegionTrainData, TrainRun } from "@/lib/regionTrain"

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h && m) return `${h}시간 ${m}분`
  if (h) return `${h}시간`
  return `${m}분`
}

export default function RegionTrainDetail({
  data,
  direction,
  onClose,
}: {
  data: RegionTrainData
  direction: "dep" | "arr"
  onClose: () => void
}) {
  const dir = direction === "dep" ? data.outbound : data.inbound
  const [nowMinutes, setNowMinutes] = useState(0)

  useEffect(() => {
    const update = () => {
      const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
      setNowMinutes(kst.getUTCHours() * 60 + kst.getUTCMinutes())
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  useModalClose(onClose)

  const nextIdx = dir.runs.findIndex((r) => toMinutes(r.dep) > nowMinutes)

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white" style={{ height: "100dvh" }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-full p-2.5 text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="닫기"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">{dir.fromName} → {dir.toName}</h2>
          <p className="truncate text-xs text-slate-400">{data.stationName} · 코레일 KTX</p>
        </div>
        <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700">KTX</span>
      </div>

      {/* 스크롤 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg space-y-5 px-4 py-5">

          {/* 타는 역 — 카카오지도 */}
          <a
            href={`https://map.kakao.com/?q=${encodeURIComponent(dir.fromStation)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-2xl bg-indigo-50 px-4 py-4 transition-opacity active:opacity-70"
          >
            <svg className="mt-0.5 shrink-0 text-indigo-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="2.2" />
            </svg>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-indigo-500">타는 곳</p>
                  <p className="text-base font-bold text-indigo-800">{dir.fromStation}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-indigo-500">지도 보기 →</span>
              </div>
            </div>
          </a>

          {/* 오늘 전체 시간표 */}
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
              오늘 {dir.fromName} 출발 시간표
            </p>
            {dir.runs.length === 0 ? (
              <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                실시간 시간표를 불러올 수 없습니다. 아래 코레일에서 확인해 주세요.
              </p>
            ) : (
              <div className="space-y-1.5">
                {dir.runs.map((run, i) => (
                  <TrainRow key={run.dep + run.trainNo} run={run} state={
                    nextIdx === -1 ? "past" : i < nextIdx ? "past" : i === nextIdx ? "next" : "future"
                  } />
                ))}
              </div>
            )}
          </div>

          {/* 운임 + 예매 */}
          {data.fare && (
            <p className="text-center text-sm text-slate-500">
              성인 편도 <strong className="font-bold text-slate-700">{data.fare.toLocaleString()}원</strong> ~ (운임은 열차·좌석별 상이)
            </p>
          )}
          {data.bookingUrl && (
            <a
              href={data.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-center text-base font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
            >
              코레일에서 예매하기
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function TrainRow({ run, state }: { run: TrainRun; state: "past" | "next" | "future" }) {
  const base = "flex items-center justify-between rounded-xl px-4 py-3"
  const cls =
    state === "next"
      ? `${base} bg-gradient-to-r from-indigo-50 to-violet-50 ring-1 ring-indigo-200`
      : state === "past"
        ? `${base} bg-slate-50 opacity-60`
        : `${base} bg-slate-50`
  const timeColor = state === "next" ? "text-indigo-800" : "text-slate-700"
  return (
    <div className={cls}>
      <div className="flex items-baseline gap-2">
        <span className={`text-lg font-bold tabular-nums ${timeColor}`}>{run.dep}</span>
        <span className="text-xs text-slate-400">→ {run.arr}</span>
        {state === "next" && (
          <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[11px] font-bold text-white">다음</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>{fmtDuration(run.durationMin)}</span>
        <span className="text-slate-300">·</span>
        <span className="truncate max-w-[120px]">{run.grade}</span>
      </div>
    </div>
  )
}
