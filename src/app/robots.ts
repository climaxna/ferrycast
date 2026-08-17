import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 예매·QR 등 색인 가치가 낮은 유틸 경로는 제외(검색 스니펫 품질 유지)
      disallow: ["/api/", "/ads/preview"],
    },
    sitemap: "https://ferrycast.kr/sitemap.xml",
    host: "https://ferrycast.kr",
  }
}
