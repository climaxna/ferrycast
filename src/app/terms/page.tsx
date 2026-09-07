import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "이용약관 — FerryCast",
  description: "FerryCast 서비스 이용약관입니다. 여객선 운항 정보와 외부 예약 링크 이용 전 확인할 내용을 안내합니다.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Link href="/" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" aria-label="홈으로">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900">이용약관</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-400">FerryCast 서비스 이용 기준</p>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-lg space-y-5 px-4 py-6">
        <header className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
          <h2 className="text-lg font-bold text-slate-900 text-balance">여객선 정보는 여행 준비를 돕기 위한 참고 정보입니다</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">FerryCast를 이용하면 아래 약관에 동의한 것으로 봅니다. 실제 승선·예약·변경·환불은 예약한 선사 또는 예매처의 안내가 기준입니다.</p>
          <p className="mt-3 text-xs text-slate-500">시행일: 2026년 9월 7일</p>
        </header>

        <Section title="1. 서비스의 성격">
          <p>FerryCast는 여객선 시간표, 편별 운항 상태, 결항·비운항 표시, 터미널 정보와 여행 이용 안내를 정리해 제공하는 정보 서비스입니다. FerryCast는 승선권을 직접 판매하거나 예약 변경·환불을 처리하지 않습니다.</p>
        </Section>

        <Section title="2. 운항 정보의 이용">
          <p>운항 정보는 공공기관 데이터와 운영상 정리한 참고 시간표를 바탕으로 표시됩니다. 기상, 선박 점검, 터미널 사정, 데이터 갱신 지연 등으로 실제 운항 상태와 다를 수 있습니다.</p>
          <p className="mt-2">출발 전에는 예약한 선사, 터미널 또는 한국해운조합 승선예약 등 공식 채널에서 출발항·시각·결항·승선 조건을 최종 확인해야 합니다.</p>
        </Section>

        <Section title="3. 외부 사이트와 예약">
          <p>서비스 안의 예매, 지도, 관광지, 광고 링크는 외부 사이트로 연결될 수 있습니다. 외부 사이트의 상품, 예약, 결제, 개인정보 처리, 콘텐츠와 발생한 문제는 해당 사이트의 정책과 운영자 책임에 따릅니다.</p>
        </Section>

        <Section title="4. 광고와 제휴 콘텐츠">
          <p>FerryCast는 지역 업체, 여행 상품 또는 제휴 콘텐츠를 광고로 표시할 수 있습니다. 광고 표시는 운항 상태의 판단 기준과 무관하며, 광고 상품의 구매·예약 여부는 이용자가 직접 판단합니다.</p>
        </Section>

        <Section title="5. 이용자의 준수 사항">
          <p>이용자는 서비스의 정상 운영을 방해하거나, 자동화된 과도한 요청으로 서비스·데이터 제공처에 부담을 주거나, 콘텐츠를 무단 복제·재배포하는 행위를 해서는 안 됩니다.</p>
        </Section>

        <Section title="6. 서비스 변경과 문의">
          <p>운영자는 데이터 제공 여건, 기능 개선 또는 보안상 필요에 따라 서비스 일부를 변경·중단할 수 있습니다. 오류 제보와 서비스 문의는 아래 이메일로 보내주세요. 문의에는 화면 주소, 날짜·시각, 항로와 출발 방향을 함께 적어주시면 확인에 도움이 됩니다.</p>
          <a href="mailto:climaxna@naver.com" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">climaxna@naver.com</a>
        </Section>

        <Link href="/privacy" className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          개인정보처리방침 보기 <span aria-hidden="true">→</span>
        </Link>
      </article>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  )
}
