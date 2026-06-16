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
      <div className="flex border-b border-gray-200 mb-3">
        <TabButton active={tab === "dep"} onClick={() => setTab("dep")}>
          ⛴️ 완도 출발
        </TabButton>
        <TabButton active={tab === "arr"} onClick={() => setTab("arr")}>
          🚢 완도 도착
        </TabButton>
        {!isLive && (
          <span className="ml-auto self-end mb-1.5 text-xs text-amber-500">참고 시간표</span>
        )}
      </div>

      {/* 항로 목록 */}
      {routes.length > 0 ? (
        <div className="space-y-2">
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
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
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
      className={`px-4 pb-2.5 pt-1 text-sm font-medium transition-colors border-b-2 -mb-px ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  )
}
