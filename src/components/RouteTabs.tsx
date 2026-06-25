"use client"

import { useState, useEffect } from "react"
import RouteItem from "./RouteItem"
import RouteDetail from "./RouteDetail"
import type { WandoRoute } from "@/lib/types"

interface Props {
  departures: { routes: WandoRoute[]; isLive: boolean }
  arrivals: { routes: WandoRoute[]; isLive: boolean }
}

export default function RouteTabs({ departures, arrivals }: Props) {
  const [tab, setTab] = useState<"dep" | "arr">("dep")
  const [selected, setSelected] = useState<WandoRoute | null>(null)
  const [nowMinutes, setNowMinutes] = useState(0)

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setNowMinutes(d.getHours() * 60 + d.getMinutes())
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  const isDeparture = tab === "dep"
  const { routes, isLive } = isDeparture ? departures : arrivals

  return (
    <section>
      {/* 탭 헤더 — 출발(파랑) / 도착(초록) 색 분리 */}
      <div className="mb-3 flex items-center gap-1 rounded-xl bg-slate-800/80 p-1">
        <TabButton active={tab === "dep"} variant="dep" onClick={() => setTab("dep")}>
          🚢 완도 출발
        </TabButton>
        <TabButton active={tab === "arr"} variant="arr" onClick={() => setTab("arr")}>
          ⚓ 완도 도착
        </TabButton>
        {!isLive && (
          <span className="mr-1.5 shrink-0 text-[11px] font-medium text-amber-500">
            참고 시간표
          </span>
        )}
      </div>

      {/* 항로 목록 */}
      {routes.length > 0 ? (
        <div className="space-y-2.5">
          {routes.map((route) => (
            <RouteItem
              key={route.id}
              route={route}
              nowMinutes={nowMinutes}
              isArrival={!isDeparture}
              onClick={() => setSelected(route)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-400">
          항로 정보를 불러올 수 없습니다.
        </div>
      )}

      {/* 상세 바텀 시트 */}
      {selected && (
        <RouteDetail
          route={selected}
          isDeparture={isDeparture}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  )
}

function TabButton({
  active,
  variant,
  onClick,
  children,
}: {
  active: boolean
  variant: "dep" | "arr"
  onClick: () => void
  children: React.ReactNode
}) {
  const activeClass = variant === "arr"
    ? "bg-slate-700 text-emerald-300 shadow-sm"
    : "bg-slate-700 text-sky-300 shadow-sm"

  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
        active ? activeClass : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {children}
    </button>
  )
}
