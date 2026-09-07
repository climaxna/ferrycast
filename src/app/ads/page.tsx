import type { Metadata } from "next"
import AdsPageContent from "@/components/AdsPageContent"

const TITLE = "FerryCast — 완도 지역 광고 안내"
const DESC = "완도 배편·날씨를 보러 오는 방문자에게 사장님 가게를 소개하세요. 배너 제작 무료."

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/ads" },
  // 광고주에게 직접 전달하는 영업 안내 페이지다. 여객선 이용 정보와 혼동되거나
  // 검색 결과에서 얇은 상업 페이지로 평가되지 않도록 색인만 막고 링크 이동은 허용한다.
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: "FerryCast",
    title: TITLE,
    description: DESC,
    url: "https://ferrycast.kr/ads",
    locale: "ko_KR",
  },
}

export default function AdsPage() {
  return <AdsPageContent regionName="완도" adsPath="/ads" homePath="/" />
}
