"use client"
import { useEffect } from "react"

const UNIT_ID = process.env.NEXT_PUBLIC_ADFIT_UNIT_ID ?? ""

export default function AdFitBanner() {
  useEffect(() => {
    if (!UNIT_ID) return
    const existing = document.querySelector('script[src*="ba.min.js"]')
    if (existing) existing.remove()
    const s = document.createElement("script")
    s.src = "//t1.kakaocdn.net/kas/static/ba.min.js"
    s.async = true
    document.head.appendChild(s)
    return () => { s.remove() }
  }, [])

  if (!UNIT_ID) return null

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-2">
      <div className="flex justify-center">
        <ins
          className="kakao_ad_area"
          style={{ display: "none" }}
          data-ad-unit={UNIT_ID}
          data-ad-width="320"
          data-ad-height="50"
        />
      </div>
    </div>
  )
}
