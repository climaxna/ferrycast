"use client"

import { useEffect, useRef } from "react"

export default function CoupangSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ""

    const initWidget = () => {
      // g.js가 body에 직접 요소를 append하므로, 추가 전 목록을 기록해둠
      const before = new Set(Array.from(document.body.children))
      const width = Math.min(container.offsetWidth || 320, 480)

      const observer = new MutationObserver(() => {
        for (const el of Array.from(document.body.children)) {
          if (!before.has(el) && el.tagName !== "SCRIPT") {
            observer.disconnect()
            container.appendChild(el) // 우리 카드 안으로 이동
            return
          }
        }
      })
      observer.observe(document.body, { childList: true })

      const s = document.createElement("script")
      s.textContent = `new PartnersCoupang.G({"id":999626,"template":"carousel","trackingCode":"AF7008655","width":"${width}","height":"140","tsource":""})`
      document.body.appendChild(s)

      return observer
    }

    let observer: MutationObserver | undefined
    const w = window as Window & { PartnersCoupang?: unknown }

    if (w.PartnersCoupang) {
      observer = initWidget()
    } else {
      const sdk = document.createElement("script")
      sdk.src = "https://ads-partners.coupang.com/g.js"
      sdk.async = true
      sdk.onload = () => {
        observer = initWidget()
      }
      document.head.appendChild(sdk)
    }

    return () => {
      observer?.disconnect()
      container.innerHTML = ""
    }
  }, [])

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div ref={containerRef} className="min-h-[140px] w-full overflow-hidden" />
      <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-none text-slate-400">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  )
}
