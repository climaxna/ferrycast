"use client"

import { QRCodeSVG } from "qrcode.react"

// 공유용 QR은 접속 경로와 무관하게 항상 정식 도메인의 해당 지역 페이지를 가리킨다
export default function RegionQrClient({
  regionName,
  slug,
}: {
  regionName: string
  slug: string
}) {
  const url = `https://ferrycast.kr/${slug}`
  const displayUrl = `ferrycast.kr/${slug}`

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-6 print:p-0">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm print:max-w-none print:border-0 print:shadow-none print:gap-8">
        {/* 큰 한글 제목 — 멀리서도 무엇인지 즉시 인지 */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 print:text-6xl">
            {regionName} 배 시간표
          </h1>
          <p className="mt-2 text-2xl font-bold text-blue-600 print:text-4xl">
            결항 · 날씨 한눈에
          </p>
        </div>

        {/* QR 코드 — 원거리 스캔 위해 크게 */}
        <div className="rounded-2xl border-4 border-slate-900 bg-white p-4 print:border-[6px]">
          <QRCodeSVG
            value={url}
            size={300}
            level="M"
            bgColor="#ffffff"
            fgColor="#0f172a"
            className="h-auto w-full print:h-[420px] print:w-[420px]"
          />
        </div>

        {/* 스캔 방법 안내 — 크고 강조 */}
        <div className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-50 px-5 py-4 print:bg-blue-50">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-blue-600 print:h-12 print:w-12"
            aria-hidden="true"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          <p className="text-2xl font-bold leading-snug text-slate-900 print:text-3xl">
            휴대폰 카메라로
            <br />
            비추면 열려요
          </p>
        </div>

        {/* 주소 — 가독성 위해 키움 */}
        <p className="rounded-xl bg-slate-50 px-4 py-2.5 text-lg font-bold tracking-wide text-blue-700 print:text-2xl">
          {displayUrl}
        </p>
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
        href={`/${slug}`}
        className="print:hidden text-sm text-slate-400 underline-offset-2 hover:text-blue-600 hover:underline"
      >
        ← {regionName} 화면으로
      </a>
    </main>
  )
}
