import Link from "next/link"
import { AD_MAIL, AD_MAILTO } from "@/lib/adInquiry"

// 완도 메인 전용 — 카카오 애드핏 대신 지역 광고를 모집하는 빈 슬롯.
// 메일 버튼은 광고 문의 메일(제목·양식 자동 완성), 예시 버튼은 /ads 시안 페이지로.
// 다지역 페이지는 AdFitBanner 유지.
export default function LocalAdSlot() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 11 18-5v12L3 13v-2Z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">
            이 자리에 사장님의 가게를 알려보세요
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            펜션 · 식당 · 카페 · 특산물 · 렌터카 — 완도 배편과 날씨를 보러
            하루 100여 명이 찾는 화면에 단독으로 소개됩니다.
            배너 제작도 무료로 해드립니다.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <a
              href={AD_MAILTO}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              광고 문의하기
              <span aria-hidden="true">→</span>
            </a>
            <Link
              href="/ads"
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              게재 예시 보기
            </Link>
            <span className="text-[11px] text-slate-400">{AD_MAIL}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
