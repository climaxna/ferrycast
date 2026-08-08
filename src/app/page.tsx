import { Suspense } from "react"
import Link from "next/link"
import WeatherCard from "@/components/WeatherCard"
import RouteSection from "@/components/RouteSection"
import YaksanRouteSection from "@/components/YaksanRouteSection"
import AppHeaderTitle from "@/components/AppHeaderTitle"
import AdFitBanner from "@/components/AdFitBanner"
import CoupangSection from "@/components/CoupangSection"
import RegionNav from "@/components/RegionNav"
import StatusBar from "@/components/StatusBar"
import { getWandoStatusSummary } from "@/lib/ferry"

export const revalidate = 60

export const metadata = {
  title: "FerryCast — 완도 날씨·항로 현황",
  description: "완도 현재 날씨와 여객선 출발·도착 시간표·운항 현황을 한눈에",
}

function WeatherSkeleton() {
  return <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
}

function StatusBarSkeleton() {
  return <div className="h-[104px] animate-pulse rounded-2xl bg-slate-100" />
}

// 요약 바 — 완도 출발편 정상/결항/종료 + 결항 알림 (getMtisDay 캐시 재사용, 추가 호출 없음)
async function WandoStatusBar() {
  const summary = await getWandoStatusSummary()
  return <StatusBar summary={summary} />
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
          {/* 로고+제목 = 새로고침 (수동 새로고침 아이콘을 없앤 뒤의 갱신 수단) */}
          <AppHeaderTitle subtitle="완도 날씨 · 여객선 현황" />
          <Link
            href="/qr"
            aria-label="QR 코드"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
              <rect x="18" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
              <rect x="14" y="18" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
              <rect x="18" y="18" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
              <rect x="5" y="5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
              <rect x="16" y="5" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
              <rect x="5" y="16" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
            </svg>
            <span>QR 코드</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-5 px-4 py-5">
        <Suspense fallback={<WeatherSkeleton />}>
          <WeatherCard />
        </Suspense>

        <div className="space-y-2">
          <RegionNav current="" />
          <Suspense fallback={<StatusBarSkeleton />}>
            <WandoStatusBar />
          </Suspense>
        </div>

        <Suspense fallback={<RouteSkeleton />}>
          <RouteSection />
        </Suspense>

        <Suspense fallback={null}>
          <YaksanRouteSection />
        </Suspense>

        <div className="space-y-2">
          {/* 지역 광고는 시간표 직후 단락으로 이동(RouteSection adSlot). 하단은 특산물+애드핏 */}
          <CoupangSection />
          <AdFitBanner />
        </div>

        <footer className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-500">
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
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              완도군청 여객선
            </a>
            <a
              href="https://island.theksa.co.kr/page/booking"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              해운조합 승선예약
            </a>
            <Link
              href="/privacy"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            >
              개인정보처리방침
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
