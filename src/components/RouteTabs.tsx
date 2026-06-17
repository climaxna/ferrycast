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
  const [nowMinutes, setNowMinutes] = useState(() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  })

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date()
      setNowMinutes(d.getHours() * 60 + d.getMinutes())
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const isDeparture = tab === "dep"
  const { routes, isLive } = isDeparture ? departures : arrivals

  return (
    <section>
      {/* 탭 헤더 */}
      <div className="mb-3 flex items-center gap-1 rounded-xl bg-slate-100 p-1">
        <TabButton active={tab === "dep"} onClick={() => setTab("dep")}>
          완도 출발
        </TabButton>
        <TabButton active={tab === "arr"} onClick={() => setTab("arr")}>
          완도 도착
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
              onClick={() => setSelected(route)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
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
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-white text-blue-700 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  )
}
