"use client"

import { useEffect, useState } from "react"
import type { StatusSummary } from "@/lib/mtis"

// 메인화면 요약 바 — 정상/결항/종료 건수 + 결항 알림 티커(3.5초 회전).
// 지연은 데이터 확보가 어려워 제외. summary가 null이면(API 장애) 아무것도 렌더 안 함.
export default function StatusBar({
  summary,
  regionName,
}: {
  summary: StatusSummary | null
  regionName: string
}) {
  const alerts = summary?.alerts ?? []
  const [idx, setIdx] = useState(0)

  // 결항 알림 2개 이상이면 3.5초마다 회전
  useEffect(() => {
    if (alerts.length < 2) return
    const id = setInterval(() => setIdx((i) => (i + 1) % alerts.length), 3500)
    return () => clearInterval(id)
  }, [alerts.length])

  if (!summary) return null

  const cur = alerts.length ? alerts[idx % alerts.length] : null

  return (
    <div className="space-y-2">
      {/* 3열 요약 카드 */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="정상" value={summary.normal} tone="emerald" icon="●" />
        <StatCard label="결항" value={summary.cancelled} tone="rose" icon="⊘" />
        <StatCard label="종료" value={summary.done} tone="slate" icon="✓" />
      </div>

      {/* 결항 알림 티커 (또는 정상 안내) */}
      {cur ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50/70 px-3.5 py-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white">!</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-rose-500">
              결항 알림 {alerts.length > 1 && <span className="text-rose-400">· {idx % alerts.length + 1}/{alerts.length}</span>}
            </p>
            <p key={`${cur.time}-${cur.label}`} className="animate-fadein truncate text-sm font-medium text-rose-700">
              {regionName} → {cur.label} <span className="font-bold tabular-nums">{cur.time}</span>{" "}
              {cur.suspended ? "비운항" : "결항"}
              {cur.reason && <span className="text-rose-500"> ({cur.reason})</span>}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">✓</span>
          <p className="text-sm font-medium text-emerald-700">현재 결항 없이 정상 운항 중입니다</p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: number
  tone: "emerald" | "rose" | "slate"
  icon: string
}) {
  const c = {
    emerald: { icon: "text-emerald-500", num: "text-emerald-600" },
    rose: { icon: "text-rose-500", num: "text-rose-600" },
    slate: { icon: "text-slate-400", num: "text-slate-500" },
  }[tone]
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white py-2 shadow-sm">
      <span className={`text-xs font-semibold ${c.icon}`}>
        <span className="mr-1">{icon}</span>
        {label}
      </span>
      <span className={`text-xl font-extrabold tabular-nums leading-tight ${c.num}`}>{value}</span>
    </div>
  )
}
