// 완도 메인 전용 — 카카오 애드핏 대신 지역 광고를 모집하는 빈 슬롯.
// 클릭 시 광고 문의 메일(제목·양식 자동 완성)이 열린다. 다지역 페이지는 AdFitBanner 유지.
const MAIL = "climaxna@naver.com"
const SUBJECT = encodeURIComponent("[FerryCast] 완도 지역 광고 문의")
const BODY = encodeURIComponent(
  [
    "아래 내용을 적어 보내주시면 확인 후 게재 방법과 조건을 회신드립니다.",
    "",
    "업체명 : ",
    "연락처 : ",
    "홍보하실 내용(가게 소개 등) : ",
  ].join("\n"),
)

export default function LocalAdSlot() {
  return (
    <a
      href={`mailto:${MAIL}?subject=${SUBJECT}&body=${BODY}`}
      className="block rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 px-4 py-3.5 transition-all hover:border-blue-300 hover:bg-blue-50/70 active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 11 18-5v12L3 13v-2Z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">
            이 자리에 사장님의 가게를 알려보세요
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            펜션 · 식당 · 카페 · 특산물 · 렌터카 — 완도 배편과 날씨를 확인하러 온
            주민과 관광객에게 매일 보이는 자리입니다.
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
            광고 문의하기 · {MAIL}
            <span aria-hidden="true">→</span>
          </p>
        </div>
      </div>
    </a>
  )
}
