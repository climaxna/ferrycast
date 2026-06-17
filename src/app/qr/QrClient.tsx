"use client"

import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"

export default function QrClient() {
  const [url, setUrl] = useState("")

  useEffect(() => {
    // 현재 도메인의 루트 URL (배포 환경에 자동 대응)
    setUrl(window.location.origin)
  }, [])

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-8 print:p-4">
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm print:border-0 print:shadow-none print:bg-white">
        {/* 로고 + 앱명 */}
        <div className="flex flex-col items-center gap-2">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-md">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3.5 13.5h17l-1.8 4.2a1 1 0 0 1-.92.6H6.2a1 1 0 0 1-.92-.6L3.5 13.5Z" fill="white" />
              <path d="M7.5 13.5V8.8a1 1 0 0 1 1-1h3.2l2.8 2.7v3" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M2.5 20.5c1.2 0 1.2-.9 2.4-.9s1.2.9 2.4.9 1.2-.9 2.4-.9 1.2.9 2.4.9 1.2-.9 2.4-.9 1.2.9 2.4.9 1.2-.9 2.4-.9" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              Ferry<span className="text-blue-600">Cast</span>
            </p>
            <p className="mt-0.5 text-sm text-slate-400">완도 날씨 · 여객선 현황</p>
          </div>
        </div>

        {/* QR 코드 */}
        {url && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={url}
              size={220}
              level="M"
              bgColor="#ffffff"
              fgColor="#1e3a5f"
            />
          </div>
        )}

        {/* 안내 문구 */}
        <div className="text-center">
          <p className="text-base font-semibold text-slate-700">QR 코드를 스캔하세요</p>
          <p className="mt-1 text-sm text-slate-400">완도 날씨와 여객선 시간표를 바로 확인</p>
          {url && (
            <p className="mt-2 rounded-lg bg-white px-3 py-1.5 text-xs font-mono text-blue-600 shadow-sm">
              {url}
            </p>
          )}
        </div>
      </div>

      {/* 인쇄 버튼 — 스크린에서만 표시 */}
      <button
        onClick={() => window.print()}
        className="print:hidden flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        인쇄하기
      </button>

      <a
        href="/"
        className="print:hidden text-sm text-slate-400 underline-offset-2 hover:text-blue-600 hover:underline"
      >
        ← 메인으로
      </a>
    </main>
  )
}
