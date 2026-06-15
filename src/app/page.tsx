import { Suspense } from "react"
import { ferries } from "@/lib/ferry-data"
import DepartureBoard from "@/components/DepartureBoard"

export const metadata = {
  title: "Ferrycast — 여수 출발 현황",
  description: "여수항 페리 실시간 출발 현황판",
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

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⛴</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ferrycast</h1>
              <p className="text-sm text-gray-500">여수항 출발 현황판</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Suspense fallback={<BoardSkeleton />}>
          <DepartureBoard initial={ferries} />
        </Suspense>
      </div>
    </main>
  )
}
