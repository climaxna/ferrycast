import Link from "next/link"
import { AD_MAIL, buildAdMailto } from "@/lib/adInquiry"
import AdLabel from "./AdLabel"

// 카카오 애드핏 대신 지역 광고를 모집하는 빈 슬롯 (완도·포항·목포·인천 공용).
// 문구는 지역 무관 공용 — 지역명·미리보기 경로만 props로 주입.
// 메일 버튼은 광고 문의(제목·양식 자동 완성), 예시 버튼은 지역 /ads 시안 페이지로.
export default function LocalAdSlot({
  regionName,
  adsPath,
}: {
  regionName: string
  adsPath: string
}) {
  const mailto = buildAdMailto({ regionName, adsPath })
  return (
    /* 배편 카드(흰 배경+그림자=떠 있음)와 구분되도록 중성 회색 + 눌린 느낌(그림자 없음).
       앱의 의미색(파랑·teal·indigo·amber·rose)을 피해 "서비스 데이터가 아님"을 조용히 알린다.
       dashed 테두리는 아직 광고주가 없는 '모집 슬롯'이라는 뜻 (실제 배너는 solid로). */
    <div className="relative rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 px-4 py-3.5">
      <AdLabel text="광고 자리" />
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 11 18-5v12L3 13v-2Z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          {/* pr-14 — 우상단 "광고 자리" 라벨과 겹치지 않게 */}
          <p className="pr-14 text-sm font-bold text-slate-800">
            이 자리에 사장님의 가게를 알려보세요
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            펜션 · 식당 · 카페 · 특산물 · 렌터카 — 배편과 날씨를 보러 찾는
            방문자에게 매일 소개됩니다. 배너 제작도 무료로 해드립니다.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <a
              href={mailto}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
            >
              광고 문의하기
              <span aria-hidden="true">→</span>
            </a>
            <Link
              href={adsPath}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
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
