import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import InstallBanner from "@/components/InstallBanner"
import PwaTracker from "@/components/PwaTracker"
import "./globals.css"

// Pretendard Variable — 한글·라틴·숫자를 단일 패밀리로 (자체 호스팅, tabular-nums 지원)
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://ferrycast.kr"),
  title: "FerryCast — 완도 여객선 정보",
  description: "완도 날씨·조석·항로 시간표·운항 현황을 한 화면에",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "FerryCast",
    title: "FerryCast — 완도 여객선 정보",
    description: "완도 날씨·조석·항로 시간표·운항 현황을 한 화면에",
    url: "https://ferrycast.kr",
    locale: "ko_KR",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FerryCast",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
  verification: {
    google: "1wsmQDSYZHeS0pVt48CUaOCeoL8KBI87ZSqt8pROcdI",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-NNK3PPZZRT" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html:
          `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-NNK3PPZZRT');`
        }} />
        {/* beforeinstallprompt는 React 마운트 전에 발생하므로 미리 캡처 */}
        <Script id="pwa-capture" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html:
          `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__deferredPrompt=e;});`
        }} />
      </head>
      <body>
        {children}
        <InstallBanner />
        <PwaTracker />
        <Analytics />
      </body>
    </html>
  )
}
