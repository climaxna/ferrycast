import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { REGIONS } from "@/config/regions"
import RegionQrClient from "./QrClient"

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
  return {
    title: `FerryCast ${config.name} QR 코드`,
    description: `FerryCast ${config.name} 배 시간표·결항·날씨 QR 코드`,
  }
}

export default async function RegionQrPage({
  params,
}: {
  params: Promise<{ region: string }>
}) {
  const { region } = await params
  const config = REGIONS[region]
  if (!config) notFound()
  return <RegionQrClient regionName={config.name} slug={config.slug} />
}
