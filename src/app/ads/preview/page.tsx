import type { Metadata } from "next"
import PreviewClient from "./PreviewClient"

// 광고주에게 링크로 보내는 배너 게재 미리보기.
// robots noindex — 영업용 화면이라 검색에 노출되면 안 된다(실제 서비스와 혼동 방지).
export const metadata: Metadata = {
  title: "광고 게재 미리보기 — FerryCast",
  description: "완도 배편 화면에 광고 배너가 어떻게 노출되는지 보여주는 미리보기입니다.",
  robots: { index: false, follow: false },
}

export default function AdPreviewPage() {
  return <PreviewClient />
}
