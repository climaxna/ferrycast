import type { MetadataRoute } from "next"
import { REGIONS } from "@/config/regions"
import { GUIDES } from "@/content/guides"

const BASE = "https://ferrycast.kr"

// 검색엔진 색인용 사이트맵. 실시간 화면(홈·지역)은 자주 바뀌므로 우선순위·주기를 높게,
// 가이드는 고정 콘텐츠라 낮은 갱신 주기로.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const core: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/guide`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/ads`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ]

  const regions: MetadataRoute.Sitemap = Object.keys(REGIONS).map((slug) => ({
    url: `${BASE}/${slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  }))

  const guides: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${BASE}/guide/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...core, ...regions, ...guides]
}
