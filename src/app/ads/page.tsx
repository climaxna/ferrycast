import type { Metadata } from "next"
import AdsPageContent from "@/components/AdsPageContent"

const TITLE = "FerryCast — 완도 지역 광고 안내"
const DESC = "완도 배편·날씨를 보러 오는 방문자에게 사장님 가게를 소개하세요. 배너 제작 무료."

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/ads" },
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
