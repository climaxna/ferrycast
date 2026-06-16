import { Suspense } from "react"
import { ferries } from "@/lib/ferry-data"
import DepartureBoard from "@/components/DepartureBoard"
import WeatherCard from "@/components/WeatherCard"

export const metadata = {
  title: "FerryCast — 완도 날씨·항로 현황",
  description: "완도 현재 날씨와 여객선 항로 운항 현황",
}

function BoardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  )
}

function WeatherSkeleton() {
  return <div className="h-28 animate-pulse rounded-xl bg-blue-50" />
}

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⛴️</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">FerryCast</h1>
              <p className="text-sm text-gray-500">완도 날씨 · 항로 현황</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 space-y-6">
        <Suspense fallback={<WeatherSkeleton />}>
          <WeatherCard />
        </Suspense>

        <Suspense fallback={<BoardSkeleton />}>
          <DepartureBoard initial={ferries} />
        </Suspense>
      </div>
    </main>
  )
}
