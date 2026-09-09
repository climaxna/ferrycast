import { Suspense } from "react"
import { connection } from "next/server"
import Link from "next/link"
import WeatherCard from "@/components/WeatherCard"
import RouteSection from "@/components/RouteSection"
import YaksanRouteSection from "@/components/YaksanRouteSection"
import AppHeaderTitle from "@/components/AppHeaderTitle"
import AdFitBanner from "@/components/AdFitBanner"
import RegionNav from "@/components/RegionNav"
import RegionGuideLinks from "@/components/RegionGuideLinks"

// ⚠️ export const revalidate 를 두지 않는다 — 아래 connection() 때문에 이 페이지는 요청마다
// 렌더되고(빌드 로그 `ƒ /`), 그 상태에서 revalidate 는 효력이 없다. 값이 남아 있으면 읽는 사람이
// "10분 캐시된다"고 오해한다. 외부 API 응답 캐시는 각 lib의 fetch 단위
// (next: { revalidate }) Data Cache가 계속 담당한다.

// 브라우저 탭 제목·검색 결과용. og(링크 미리보기)는 layout.tsx가 담당한다.
// 루트는 전국 진입점이면서 화면 내용은 완도라, 제목은 전국 틀로 통일하고
// 완도 키워드는 description에 남겨 "완도 배편" 검색 유입을 지킨다.
export const metadata = {
  title: "FerryCast — 실시간 여객선 정보",
  description: "완도·울릉도·목포·인천·제주 여객선 시간표와 결항 현황을 실시간으로. 완도 날씨·조석 정보 포함",
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

export default async function Page() {
  await connection()

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          {/* 로고+제목 = 새로고침 (수동 새로고침 아이콘을 없앤 뒤의 갱신 수단) */}
          <AppHeaderTitle subtitle="실시간 여객선 현황" />
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

      <div className="mx-auto max-w-lg space-y-3 px-4 pb-4 pt-2">
        <Suspense fallback={<WeatherSkeleton />}>
          <WeatherCard />
        </Suspense>

        <RegionNav current="" />

        <Suspense fallback={<RouteSkeleton />}>
          <RouteSection />
        </Suspense>

        <Suspense fallback={null}>
          <YaksanRouteSection />
        </Suspense>

        <RegionGuideLinks region="" />

        <div className="space-y-2">
          {/* 지역 광고는 시간표 직후 단락으로 이동(RouteSection adSlot). 하단은 애드핏.
              쿠팡 섹션은 완도 지역광고 컨택 중이라 잠시 숨김(<CoupangSection />). */}
          <AdFitBanner />
        </div>

        <aside aria-label="운항 정보 최종 확인" className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
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
          </div>
        </aside>
      </div>
    </main>
  )
}
