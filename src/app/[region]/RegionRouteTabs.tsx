"use client"

import { useState, useEffect } from "react"
import RouteItem from "@/components/RouteItem"
import RouteDetail from "@/components/RouteDetail"
import type { WandoRoute } from "@/lib/types"

interface Props {
  departures: { routes: WandoRoute[]; isLive: boolean }
  arrivals: { routes: WandoRoute[]; isLive: boolean }
  regionName: string
}

export default function RegionRouteTabs({ departures, arrivals, regionName }: Props) {
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
      <div className={`mb-3 flex items-center gap-1 rounded-xl p-1 transition-colors ${
        isDeparture ? "bg-blue-50" : "bg-teal-50"
      }`}>
        <TabButton active={tab === "dep"} variant="dep" onClick={() => setTab("dep")}>
          🚢 {regionName} 출발
        </TabButton>
        <TabButton active={tab === "arr"} variant="arr" onClick={() => setTab("arr")}>
          ⚓ {regionName} 도착
        </TabButton>
        {!isLive && (
          <span className="mr-1.5 shrink-0 text-[11px] font-medium text-amber-500">
            참고 시간표
          </span>
        )}
      </div>

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
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          항로 정보를 불러올 수 없습니다.
        </div>
      )}

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
    ? "bg-white text-teal-700 shadow-sm"
    : "bg-white text-blue-700 shadow-sm"

  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
        active ? activeClass : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  )
}
