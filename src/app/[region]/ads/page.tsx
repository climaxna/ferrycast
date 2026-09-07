import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { REGIONS } from "@/config/regions"
import AdsPageContent from "@/components/AdsPageContent"

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
  const title = `FerryCast — ${config.name} 지역 광고 안내`
  const desc = `${config.name} 배편·날씨를 보러 오는 방문자에게 사장님 가게를 소개하세요. 배너 제작 무료.`
  const url = `https://ferrycast.kr/${config.slug}/ads`
  return {
    title,
    description: desc,
    alternates: { canonical: `/${config.slug}/ads` },
    // /ads와 동일한 광고주 안내 페이지: 검색 색인 제외, 링크 이동은 허용.
    // noindex는 애드센스 심사 제외나 승인 보장을 의미하지 않는다.
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: "FerryCast",
      title,
      description: desc,
      url,
      locale: "ko_KR",
    },
  }
}

export default async function RegionAdsPage({
  params,
}: {
  params: Promise<{ region: string }>
}) {
  const { region } = await params
  const config = REGIONS[region]
  if (!config) notFound()
  return (
    <AdsPageContent
      regionName={config.name}
      adsPath={`/${config.slug}/ads`}
      homePath={`/${config.slug}`}
    />
  )
}
