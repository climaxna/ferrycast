import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import InstallBanner from "@/components/InstallBanner"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

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
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* beforeinstallprompt는 React 마운트 전에 발생하므로 미리 캡처 */}
        <Script id="pwa-capture" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html:
          `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__deferredPrompt=e;});`
        }} />
      </head>
      <body>
        {children}
        <InstallBanner />
        <Analytics />
      </body>
    </html>
  )
}
