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
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/ads`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ]

  const regions: MetadataRoute.Sitemap = Object.keys(REGIONS).map((slug) => ({
    url: `${BASE}/${slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.9,
  }))

  // thin(자동 생성) 가이드는 색인 대상에서 뺀다. sitemap의 인상은 "품질 신호"라
  // 얇은 페이지를 여기 나열하면 사이트 전체의 콘텐츠 밀도가 낮게 평가된다.
  // 페이지 자체는 robots noindex로도 이중 차단한다([slug]/page.tsx 참고).
  const guides: MetadataRoute.Sitemap = GUIDES.filter((g) => !g.thin).map((g) => ({
    url: `${BASE}/guide/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...core, ...regions, ...guides]
}
