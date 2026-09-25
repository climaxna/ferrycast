import type { MetadataRoute } from "next"

/**
 * 검색 로봇 안내.
 *
 * **왜 일부를 막나.** 이 프로젝트는 Vercel 무료 팀(universe-s-projects2)의 네
 * 프로젝트 중 하나이고, 엣지 요청 1,000,000건을 함께 나눠 쓴다. 2026-09-25 기준
 * 30일 사용량이 768K(75%)였고 그중 ferrycast 가 330,473건(42.9%)이다.
 * 한도를 넘기면 **프로젝트가 자동으로 일시중지된다** — 팀의 네 프로젝트가 같이
 * 멈춘다. 같은 팀의 u-jeverse.com 이 애드센스 심사 중이라 더 위험하다.
 *
 * **엣지 요청은 렌더 수가 아니라 요청 수다.** 정적 파일 하나하나가 따로 센다.
 * 그래서 렌더를 줄이는 것보다 불필요한 방문 자체를 줄이는 쪽이 직접적이다.
 *
 * 가르는 기준은 '트래픽을 되돌려주는가'다. 검색엔진(구글·빙·네이버·다음)은
 * 색인이 곧 유입이라 * 규칙으로 전부 열어 둔다. 학습용으로 긁기만 하는 봇과
 * SEO 분석 도구는 받아 가기만 하고 돌려주는 것이 없는데 한도만 먹으므로 막는다.
 * 같은 기준을 바로답(`C:\portal`)·팝노트(`C:\popnote`)에도 적용했다.
 */

/** 학습용 수집 — 긁어 가기만 하고 유입을 돌려주지 않는다. */
const TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "meta-externalagent",
  "FacebookBot",
  // 구글 검색과는 별개다. 이것만 막아도 색인·순위에는 영향이 없다.
  "Google-Extended",
]

/** SEO 분석 도구 — 경쟁사 조사용이라 이 사이트에 돌아오는 것이 없다. */
const SEO_TOOL_CRAWLERS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
  "Barkrowler",
  "SeekportBot",
  "ZoominfoBot",
  "Timpibot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 광고 크롤러는 막으면 그 화면의 광고 수익이 죽는다. 명시적으로 연다.
      { userAgent: ["Mediapartners-Google", "AdsBot-Google", "AdsBot-Google-Mobile"], allow: "/" },
      { userAgent: [...TRAINING_CRAWLERS, ...SEO_TOOL_CRAWLERS], disallow: "/" },
      {
        userAgent: "*",
        allow: "/",
        // 미리보기는 페이지의 noindex를 읽을 수 있도록 크롤링은 허용한다.
        // noindex는 광고 심사 제외나 접근 제한을 뜻하지 않는다.
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://ferrycast.kr/sitemap.xml",
    host: "https://ferrycast.kr",
  }
}
