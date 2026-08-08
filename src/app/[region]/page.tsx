import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { REGIONS } from "@/config/regions"
import { getWeatherForRegion } from "@/lib/regionWeather"
import { getTidalForRegion, get5DayTidalForRegion } from "@/lib/regionTide"
import { get5DayForecastForRegion } from "@/lib/regionForecast"
import { getRoutesForRegion, getArrivalsForRegion, getIslandHopsForRegion, getRegionStatusSummary } from "@/lib/regionFerry"
import { getTrainsForRegion } from "@/lib/regionTrain"
import RegionWeatherCardClient from "./RegionWeatherCardClient"
import RegionRouteTabs from "./RegionRouteTabs"
import RegionIslandHopSection from "@/components/RegionIslandHopSection"
import StatusBar from "@/components/StatusBar"
import AppHeaderTitle from "@/components/AppHeaderTitle"
import LocalAdSlot from "@/components/LocalAdSlot"
import AdFitBanner from "@/components/AdFitBanner"
import CoupangSection from "@/components/CoupangSection"
import RegionNav from "@/components/RegionNav"

export function generateStaticParams() {
  return Object.keys(REGIONS).map((region) => ({ region }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>
}): Promise<Metadata> {
  const { region } = await params
  const config = REGIONS[region]
  if (!config) return {}
  // 링크 미리보기(카톡·블로그·네이버)는 <title>이 아닌 og:title/og:description을 읽는다.
  // openGraph를 지역별로 덮어쓰지 않으면 루트 layout의 완도 OG가 그대로 노출된다.
  const title = `FerryCast — ${config.name} 날씨·항로 현황`
  const url = `https://ferrycast.kr/${config.slug}`
  return {
    title,
    description: config.metaDescription,
    alternates: { canonical: `/${config.slug}` },
    openGraph: {
      type: "website",
      siteName: "FerryCast",
      title,
      description: config.metaDescription,
      url,
      locale: "ko_KR",
    },
  }
}

function WeatherSkeleton() {
  return <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
}

function StatusBarSkeleton() {
  return <div className="h-[104px] animate-pulse rounded-2xl bg-slate-100" />
}

// 요약 바 — 지역 출발편 정상/결항/종료 + 결항 알림
async function RegionStatusBar({ region }: { region: string }) {
  const config = REGIONS[region]
  const summary = await getRegionStatusSummary(config)
  return <StatusBar summary={summary} />
}

function RouteSkeleton() {
  return (
    <div className="space-y-2.5">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-100" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  )
}

async function RegionWeatherCard({
  region,
}: {
  region: string
}) {
  const config = REGIONS[region]
  const [weather, tidal, forecast5, tidal5] = await Promise.all([
    getWeatherForRegion(config),
    config.tidalObsCode ? getTidalForRegion(config.tidalObsCode) : Promise.resolve(null),
    get5DayForecastForRegion([config.weatherGrid, ...config.seaGrids]),
    config.tidalObsCode ? get5DayTidalForRegion(config.tidalObsCode) : Promise.resolve([]),
  ])
  return (
    <RegionWeatherCardClient
      weather={weather}
      tidal={tidal}
      forecast5={forecast5}
      tidal5={tidal5}
      regionName={config.name}
      regionSlug={config.slug}
    />
  )
}

async function RegionRouteSection({ region }: { region: string }) {
  const config = REGIONS[region]
  const [departures, arrivals, train] = await Promise.all([
    getRoutesForRegion(config),
    getArrivalsForRegion(config),
    config.train ? getTrainsForRegion(config) : Promise.resolve(null),
  ])
  return (
    <RegionRouteTabs
      departures={departures}
      arrivals={arrivals}
      regionName={config.name}
      train={train}
      adSlot={<LocalAdSlot regionName={config.name} adsPath={`/${config.slug}/ads`} />}
    />
  )
}

// 섬↔섬 보조 노선(예: 울릉도→독도) — KTX 아래 별도 섹션. 데이터 없으면 아무것도 렌더 안 함.
async function RegionIslandHops({ region }: { region: string }) {
  const config = REGIONS[region]
  if (!config.islandHops?.length) return null
  const routes = await getIslandHopsForRegion(config)
  if (!routes.length) return null
  return (
    <RegionIslandHopSection
      routes={routes}
      title={config.islandHopTitle ?? "섬 사이 배편"}
      note={config.islandHopNote}
    />
  )
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>
}) {
  const { region } = await params
  const config = REGIONS[region]
  if (!config) notFound()

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          {/* 로고+제목 = 새로고침 (수동 새로고침 아이콘을 없앤 뒤의 갱신 수단) */}
          <AppHeaderTitle subtitle={`${config.name} 날씨 · 여객선 현황`} />
          <Link
            href={`/${config.slug}/qr`}
            aria-label="QR 코드"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
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
          <RegionWeatherCard region={region} />
        </Suspense>

        <div className="space-y-2">
          <RegionNav current={config.slug} />
          <Suspense fallback={<StatusBarSkeleton />}>
            <RegionStatusBar region={region} />
          </Suspense>
        </div>

        <Suspense fallback={<RouteSkeleton />}>
          <RegionRouteSection region={region} />
        </Suspense>

        <Suspense fallback={null}>
          <RegionIslandHops region={region} />
        </Suspense>

        <div className="space-y-2">
          {/* 지역 광고는 시간표 직후 단락으로 이동(RegionRouteTabs adSlot). 하단은 특산물+애드핏 */}
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
              href="https://island.theksa.co.kr/page/booking"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              해운조합 승선예약
            </a>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              개인정보처리방침
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
