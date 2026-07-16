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
