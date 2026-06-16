import { Suspense } from "react"
import WeatherCard from "@/components/WeatherCard"
import RouteSection from "@/components/RouteSection"

export const metadata = {
  title: "FerryCast — 완도 날씨·항로 현황",
  description: "완도 현재 날씨와 여객선 출발·도착 시간표·운항 현황을 한눈에",
}

function WeatherSkeleton() {
  return <div className="h-28 animate-pulse rounded-xl bg-blue-50" />
}

function RouteSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⛴️</span>
          <div>
            <h1 className="text-xl font-bold leading-tight text-gray-900">FerryCast</h1>
            <p className="text-xs text-gray-500">완도 날씨 · 항로 현황</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-4 space-y-4">
        <Suspense fallback={<WeatherSkeleton />}>
          <WeatherCard />
        </Suspense>

        <Suspense fallback={<RouteSkeleton />}>
          <RouteSection />
        </Suspense>

        {/* 광고 슬롯 자리 — AdSense 승인 후 활성화 */}
        <div className="h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
          <span className="text-xs text-gray-300">광고 영역</span>
        </div>

        <footer className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs leading-relaxed text-amber-800">
            ⚠️ 이 정보는 참고용입니다.{" "}
            <strong>실제 운항 여부는 출발 전 공식 채널에서 반드시 최종 확인하세요.</strong>{" "}
            기상 악화·조류 등에 의해 예고 없이 결항될 수 있습니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="https://www.wando.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
            >
              🌐 완도군청 여객선
            </a>
            <a
              href="https://island.theksa.co.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
            >
              🎫 해운조합 승선예약
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
