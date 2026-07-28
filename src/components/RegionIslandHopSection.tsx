"use client"

import { useState, useEffect } from "react"
import RouteItem from "./RouteItem"
import RouteDetail from "./RouteDetail"
import { ROUTE_THEME } from "@/lib/routeTheme"
import type { WandoRoute } from "@/lib/types"

interface Props {
  routes: WandoRoute[]
  title: string
  note?: string
}

// 섬↔섬 보조 노선 섹션 (예: 포항 페이지의 울릉도 → 독도) — KTX 아래에 노출.
// 약산 섹션과 동일한 패턴: 본 노선과 구분되는 indigo 테마, 방향 토글 없이 바로 노출.
const ACCENT = ROUTE_THEME.indigo

export default function RegionIslandHopSection({ routes, title, note }: Props) {
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

  if (!routes.length) return null

  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-bold text-indigo-600">
          <FerryIcon /> {title}
        </span>
        <span className="h-px flex-1 bg-indigo-100" />
      </div>
      {note && <p className="mb-3 text-xs text-slate-400">{note}</p>}

      <div className="space-y-2.5">
        {routes.map((route) => (
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
