"use client"

import { useState, useEffect } from "react"
import RouteItem from "./RouteItem"
import RouteDetail from "./RouteDetail"
import { ROUTE_THEME } from "@/lib/routeTheme"
import type { WandoRoute } from "@/lib/types"

interface Props {
  data: { routes: WandoRoute[]; isLive: boolean }
}

// 약산권 섬↔섬 배편 — 완도 본섬 미경유 노선. 완도 출발/도착 아래 별도 섹션.
// 방향 토글 없이(클릭 없이) 약산 출발편을 바로 노출하고, 복편은 카드/상세에서 함께 안내.
// indigo 색 테마로 완도 노선(blue/teal)과 구분 (포항 KTX가 색으로 구분되는 것과 동일 취지).
const ACCENT = ROUTE_THEME.indigo

export default function YaksanSection({ data }: Props) {
  const [selected, setSelected] = useState<WandoRoute | null>(null)
  const [nowMinutes, setNowMinutes] = useState(0)

  useEffect(() => {
    const update = () => {
      const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
      setNowMinutes(kst.getUTCHours() * 60 + kst.getUTCMinutes())
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!data.routes.length) return null

  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 shadow-sm">
      {/* 구분 헤더 — indigo 라벨 + 구분선 (완도 노선과 다른 노선망임을 표시) */}
      <div className="mb-1 flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-bold text-indigo-600">
          <FerryIcon /> 약산 섬 사이 배편
        </span>
        <span className="h-px flex-1 bg-indigo-100" />
        {!data.isLive && (
          <span className="shrink-0 text-[11px] font-medium text-amber-500">참고 시간표</span>
        )}
      </div>
      <p className="mb-3 text-xs text-slate-400">약산(당목) ↔ 금일 · 생일 · 완도 본섬 노선과 별개</p>

      <div className="space-y-2.5">
        {data.routes.map((route) => (
          <RouteItem
            key={route.id}
            route={route}
            nowMinutes={nowMinutes}
            accent={ACCENT}
            onClick={() => setSelected(route)}
          />
        ))}
      </div>

      {selected && (
        <RouteDetail route={selected} isDeparture accent={ACCENT} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}

function FerryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 14h18l-1.4 4.8a2 2 0 0 1-1.9 1.4H6.3a2 2 0 0 1-1.9-1.4L3 14Z" />
      <path d="M5.5 14V8.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2V14" />
      <path d="M12 3v3.5" />
    </svg>
  )
}
