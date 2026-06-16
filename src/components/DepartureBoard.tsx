"use client"

import { useEffect, useState, useTransition } from "react"
import type { Ferry } from "@/lib/types"
import FerryCard from "./FerryCard"
import FerryDetail from "./FerryDetail"

type Tab = "yeosu" | "wando"

async function fetchFerries(tab: Tab): Promise<Ferry[]> {
  const url = tab === "yeosu" ? "/api/ferries" : "/api/wando"
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch ferry data")
  return res.json()
}

export default function DepartureBoard({
  initial,
  wandoInitial,
}: {
  initial: Ferry[]
  wandoInitial: Ferry[]
}) {
  const [tab, setTab] = useState<Tab>("yeosu")
  const [ferries, setFerries] = useState<Ferry[]>(initial)
  const [wandoFerries, setWandoFerries] = useState<Ferry[]>(wandoInitial)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isPending, startTransition] = useTransition()
  const [selectedFerry, setSelectedFerry] = useState<Ferry | null>(null)

  const currentFerries = tab === "yeosu" ? ferries : wandoFerries

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(async () => {
        try {
          const data = await fetchFerries(tab)
          if (tab === "yeosu") setFerries(data)
          else setWandoFerries(data)
          setLastUpdated(new Date())
        } catch {
          // keep stale data on error
        }
      })
    }, 30_000)
    return () => clearInterval(id)
  }, [tab])

  function switchTab(next: Tab) {
    setTab(next)
    setSelectedFerry(null)
  }

  return (
    <>
      <div>
        <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
          <button
            onClick={() => switchTab("yeosu")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "yeosu"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            여수 출발
          </button>
          <button
            onClick={() => switchTab("wando")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "wando"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            완도 도착
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}
          </p>
          {isPending && (
            <span className="text-xs text-blue-500 animate-pulse">업데이트 중…</span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentFerries.map((ferry) => (
            <FerryCard key={ferry.id} ferry={ferry} onClick={() => setSelectedFerry(ferry)} />
          ))}
        </div>
      </div>

      {selectedFerry && (
        <FerryDetail ferry={selectedFerry} onClose={() => setSelectedFerry(null)} />
      )}
    </>
  )
}
