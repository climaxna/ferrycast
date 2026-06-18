"use client"

import { useEffect, useState } from "react"

type DeferredPrompt = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface Window { __deferredPrompt?: DeferredPrompt }
}

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [prompt, setPrompt] = useState<DeferredPrompt | null>(null)

  useEffect(() => {
    if (
      localStorage.getItem("install-dismissed") ||
      window.matchMedia("(display-mode: standalone)").matches
    ) return

    // service worker 등록 (Android 설치 조건)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      // iOS: Safari에서만 안내 (크롬·파이어폭스 인앱브라우저 제외)
      const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)
      if (isSafari) setShow(true)
      return
    }

    // 페이지 로드 초반에 캡처된 프롬프트 확인 (layout의 beforeInteractive 스크립트에서 저장)
    if (window.__deferredPrompt) {
      setPrompt(window.__deferredPrompt)
      setShow(true)
      return
    }

    // 아직 안 왔으면 이벤트 대기
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as DeferredPrompt)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (prompt) await prompt.prompt()
    dismiss()
  }

  const dismiss = () => {
    localStorage.setItem("install-dismissed", "1")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] flex justify-center px-4 pb-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 px-5 py-4 shadow-2xl">
        {isIOS ? (
          <>
            <p className="text-sm font-bold text-white">홈화면에 추가하면 앱처럼 사용할 수 있어요</p>
            <p className="mt-1 text-xs text-slate-400">
              하단 공유 버튼 <span className="text-base">⎙</span> → <strong className="text-slate-200">"홈 화면에 추가"</strong> 탭
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-white">홈화면에 추가하면 앱처럼 사용할 수 있어요</p>
        )}
        <div className="mt-3 flex gap-2">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-bold text-white"
            >
              홈화면에 추가
            </button>
          )}
          <button
            onClick={dismiss}
            className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
