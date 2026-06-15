"use client"

import { use, useEffect, useState, useTransition } from "react"
import type { Ferry } from "@/lib/types"
import FerryCard from "./FerryCard"

async function fetchFerries(): Promise<Ferry[]> {
  const res = await fetch("/api/ferries", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch ferry data")
  return res.json()
}

export default function DepartureBoard({ initial }: { initial: Ferry[] }) {
  const [ferries, setFerries] = useState<Ferry[]>(initial)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const id = setInterval(() => {
      startTransition(async () => {
        try {
          const data = await fetchFerries()
          setFerries(data)
          setLastUpdated(new Date())
        } catch {
          // keep stale data on error
        }
      })
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}
        </p>
        {isPending && (
          <span className="text-xs text-blue-500 animate-pulse">업데이트 중…</span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ferries.map((ferry) => (
          <FerryCard key={ferry.id} ferry={ferry} />
        ))}
      </div>
    </div>
  )
}
