import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 미리보기는 페이지의 noindex를 읽을 수 있도록 크롤링은 허용한다.
      // noindex는 광고 심사 제외나 접근 제한을 뜻하지 않는다.
      disallow: ["/api/"],
    },
    sitemap: "https://ferrycast.kr/sitemap.xml",
    host: "https://ferrycast.kr",
  }
}
