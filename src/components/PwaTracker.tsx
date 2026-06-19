"use client"

import { useEffect } from "react"

// 홈화면에서 실행됐는지 감지 → pwa_launch 이벤트
// iOS: navigator.standalone, Android/PC: display-mode: standalone
export default function PwaTracker() {
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) {
      const platform = /iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "android"
      window.gtag?.("event", "pwa_launch", { platform })
    }
  }, [])

  return null
}
