"use client"

import { useEffect, useState } from "react"

const banners = [
  { src: "https://coupa.ng/cnzk5R", link: "https://link.coupang.com/a/eMkMaQmliK", label: "완도 특산물 1" },
  { src: "https://coupa.ng/cnzlh4", link: "https://link.coupang.com/a/eMxY1bJHrg", label: "완도 특산물 2" },
  { src: "https://coupa.ng/cnzlPC", link: "https://link.coupang.com/a/eMyd9PcYgK", label: "제주도 특산물" },
]

export default function CoupangSection() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <p className="mb-2 text-[15px] font-bold text-slate-700">🦐 완도 특산물</p>

      {/* 배너 — iframe 재로딩 방지 위해 모두 마운트 후 opacity 전환 */}
      <div className="relative mx-auto h-[100px] w-[320px] max-w-full overflow-hidden">
        {banners.map((banner, i) => (
          <div
            key={banner.src}
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: i === idx ? 1 : 0,
              pointerEvents: i === idx ? "auto" : "none",
            }}
          >
            <iframe
              src={banner.src}
              title={banner.label}
              width="320"
              height="100"
              referrerPolicy="unsafe-url"
              style={{ border: 0 }}
            />
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="mt-2 flex justify-center gap-2">
        {banners.map((banner, i) => (
          <div
            key={banner.src}
            className={`h-2 w-2 rounded-full transition-colors ${i === idx ? "bg-blue-500" : "bg-slate-300"}`}
          />
        ))}
      </div>

      {/* 고지 문구 (쿠팡 파트너스 — 법적 필수) */}
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  )
}
