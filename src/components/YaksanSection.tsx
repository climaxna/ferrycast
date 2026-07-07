"use client"

import { useState, useEffect } from "react"
import RouteItem from "./RouteItem"
import RouteDetail from "./RouteDetail"
import type { WandoRoute } from "@/lib/types"

interface Props {
  data: { routes: WandoRoute[]; isLive: boolean }
}

// 약산권 섬↔섬 배편 — 완도 본섬 미경유 노선. 완도 출발/도착 아래 별도 섹션.
// 방향 토글 없이(클릭 없이) 약산 출발편을 바로 노출하고, 복편은 카드/상세에서 함께 안내.
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
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">약산 섬 사이 배편</h2>
          <p className="mt-0.5 text-xs text-slate-400">약산(당목) ↔ 금일 · 생일 · 완도 본섬 노선과 별개</p>
        </div>
        {!data.isLive && (
          <span className="shrink-0 text-[11px] font-medium text-amber-500">참고 시간표</span>
        )}
      </div>

      <div className="space-y-2.5">
        {data.routes.map((route) => (
          <RouteItem
            key={route.id}
            route={route}
            nowMinutes={nowMinutes}
            onClick={() => setSelected(route)}
          />
        ))}
      </div>

      {selected && (
        <RouteDetail route={selected} isDeparture onClose={() => setSelected(null)} />
      )}
    </section>
  )
}
