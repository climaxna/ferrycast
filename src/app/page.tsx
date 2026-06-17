import { Suspense } from "react"
import WeatherCard from "@/components/WeatherCard"
import RouteSection from "@/components/RouteSection"
import Logo from "@/components/Logo"

export const metadata = {
  title: "FerryCast — 완도 날씨·항로 현황",
  description: "완도 현재 날씨와 여객선 출발·도착 시간표·운항 현황을 한눈에",
}

function WeatherSkeleton() {
  return <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
}

function RouteSkeleton() {
  return (
    <div className="space-y-2.5">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-100" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Logo />
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">
              Ferry<span className="text-teal-600">Cast</span>
            </h1>
            <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-400">
              완도 날씨 · 여객선 현황
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-5 px-4 py-5">
        <Suspense fallback={<WeatherSkeleton />}>
          <WeatherCard />
        </Suspense>

        <Suspense fallback={<RouteSkeleton />}>
          <RouteSection />
        </Suspense>

        {/* 광고 슬롯 자리 — AdSense 승인 후 활성화 */}
        <div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
          <span className="text-xs text-slate-300">광고 영역</span>
        </div>

        <footer className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs leading-relaxed text-slate-500">
            이 정보는 참고용입니다.{" "}
            <strong className="font-semibold text-slate-700">
              실제 운항 여부는 출발 전 공식 채널에서 반드시 최종 확인하세요.
            </strong>{" "}
            기상 악화·조류 등으로 예고 없이 결항될 수 있습니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="https://www.wando.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-200 hover:text-teal-700"
            >
              완도군청 여객선
            </a>
            <a
              href="https://island.theksa.co.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-teal-200 hover:text-teal-700"
            >
              해운조합 승선예약
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
