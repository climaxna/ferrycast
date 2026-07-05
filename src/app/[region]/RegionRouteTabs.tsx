"use client"

import { useState, useEffect } from "react"
import RouteItem from "@/components/RouteItem"
import RouteDetail from "@/components/RouteDetail"
import type { WandoRoute } from "@/lib/types"
import type { RegionTrainData } from "@/lib/regionTrain"
import RegionTrainBlock from "./RegionTrainBlock"

interface Props {
  departures: { routes: WandoRoute[]; isLive: boolean }
  arrivals: { routes: WandoRoute[]; isLive: boolean }
  regionName: string
  train?: RegionTrainData | null
}

export default function RegionRouteTabs({ departures, arrivals, regionName, train }: Props) {
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
          {regionName} 출발
        </TabButton>
        <TabButton active={tab === "arr"} variant="arr" onClick={() => setTab("arr")}>
          {regionName} 도착
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

      {train && <RegionTrainBlock data={train} direction={tab} now={nowMinutes} />}

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
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all ${
        active ? activeClass : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {variant === "dep" ? <FerryIcon /> : <AnchorIcon />}
      {children}
    </button>
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

function AnchorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="2.4" />
      <path d="M12 7.4V21" />
      <path d="M5 13H3a9 9 0 0 0 18 0h-2" />
    </svg>
  )
}
