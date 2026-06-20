"use client"
import Script from "next/script"

const UNIT_ID = process.env.NEXT_PUBLIC_ADFIT_UNIT_ID ?? ""

export default function AdFitBanner() {
  if (!UNIT_ID) return null

  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore — kakao_ad_area data-* attrs not in HTMLIns types */}
      <ins
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={UNIT_ID}
        data-ad-width="320"
        data-ad-height="50"
      />
      <Script src="//t1.daumcdn.net/kas/static/ba.min.js" strategy="lazyOnload" />
    </div>
  )
}
