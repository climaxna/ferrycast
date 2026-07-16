import type { Metadata } from "next"
import Link from "next/link"
import { AD_MAIL, AD_PHONE, AD_MAILTO } from "@/lib/adInquiry"

const TITLE = "FerryCast — 완도 지역 광고 안내"
const DESC = "완도 배편·날씨를 보러 오는 방문자에게 사장님 가게를 소개하세요. 배너 제작 무료."

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/ads" },
  openGraph: {
    type: "website",
    siteName: "FerryCast",
    title: TITLE,
    description: DESC,
    url: "https://ferrycast.kr/ads",
    locale: "ko_KR",
  },
}

// 배너 시안에 공통으로 붙는 "광고" 라벨
function AdLabel() {
  return (
    <span className="absolute right-3 top-2.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
      광고
    </span>
  )
}

export default function AdsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Link href="/" className="text-slate-400 transition-colors hover:text-blue-600" aria-label="메인으로">
            ←
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">
              완도 지역 광고 안내
            </h1>
            <p className="mt-1 text-xs font-medium tracking-wide text-slate-400">
              Ferry<span className="text-blue-600">Cast</span> · ferrycast.kr
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* 소개 */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 px-5 py-6 text-white shadow-lg shadow-blue-900/10">
          <h2 className="text-xl font-bold leading-snug">
            완도를 찾는 손님에게
            <br />
            사장님 가게를 보여주세요
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-blue-50">
            <li>· 하루 <strong className="font-bold text-white">100여 명</strong>이 완도 배편·날씨를 확인하러 방문합니다</li>
            <li>· 방문자 상당수가 <strong className="font-bold text-white">완도 여행을 준비하는 관광객</strong>입니다</li>
            <li>· 배 시간을 보러 하루에도 여러 번 다시 여는 화면 — <strong className="font-bold text-white">반복 노출</strong></li>
            <li>· 한 번에 <strong className="font-bold text-white">한 업체만 단독</strong>으로 게재됩니다</li>
          </ul>
        </section>

        {/* 게재 위치 */}
        <section>
          <h3 className="mb-2 text-sm font-bold text-slate-700">게재 위치</h3>
          <p className="rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-500 shadow-sm">
            완도 메인 화면 하단, 배편 시간표를 모두 확인한 뒤 자연스럽게 눈이
            닿는 자리입니다. 아래 예시와 같은 형태로 게재됩니다.
          </p>
        </section>

        {/* 시안 */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700">게재 예시 (시안)</h3>

          {/* 시안 A — 텍스트형 */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-blue-600">A. 기본형 — 모든 업종</p>
            <div className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
              <AdLabel />
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-2xl" aria-hidden="true">🏠</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">청산도 앞 ○○펜션</p>
                  <p className="mt-0.5 text-xs text-slate-500">선착장에서 5분 · 전 객실 오션뷰</p>
                  <p className="mt-1.5 text-xs font-semibold text-blue-600">
                    예약 061-000-0000 · 자세히 보기 →
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 시안 B — 사진 카드형 */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-blue-600">B. 사진형 — 펜션·식당·카페</p>
            <div className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
              <AdLabel />
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl" aria-hidden="true">
                  🐚
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">○○횟집 — 완도 활전복 전문</p>
                  <p className="mt-0.5 text-xs text-slate-500">터미널 도보 3분 · 포장 가능</p>
                  <p className="mt-1.5 text-xs font-semibold text-blue-600">
                    ☎ 061-000-0000 · 메뉴 보기 →
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              * 사진 자리에는 사장님이 보내주신 가게·음식 사진이 들어갑니다.
            </p>
          </div>

          {/* 시안 C — 혜택 강조형 */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-blue-600">C. 혜택형 — 할인·이벤트 업체 (추천)</p>
            <div className="relative rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3.5 shadow-sm">
              <AdLabel />
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-2xl" aria-hidden="true">🎁</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    &ldquo;페리캐스트 보고 왔어요&rdquo; 하면
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-amber-700">
                    ○○카페 아메리카노 500원 할인
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    완도터미널 맞은편 · 07:00 첫 배부터 영업
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              * 손님이 직접 말하고 오는 방식이라 광고 효과를 가게에서 바로 확인할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 진행 절차 */}
        <section>
          <h3 className="mb-2 text-sm font-bold text-slate-700">진행 절차</h3>
          <ol className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-600 shadow-sm">
            <li><strong className="font-semibold text-slate-800">1. 메일 문의</strong> — 아래 버튼을 누르면 문의 양식이 자동으로 채워집니다</li>
            <li><strong className="font-semibold text-slate-800">2. 사진·소개 전달</strong> — 가게 사진 2~3장과 소개 한 줄이면 충분합니다</li>
            <li><strong className="font-semibold text-slate-800">3. 시안 확인</strong> — <strong className="text-blue-600">배너 제작은 무료</strong>입니다. 마음에 들 때까지 수정해드립니다</li>
            <li><strong className="font-semibold text-slate-800">4. 게재 시작</strong> — 게재 후 매월 노출·클릭 현황을 보내드립니다</li>
          </ol>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            비용은 부담 없는 월 단위이며, 문의 주시면 바로 안내드립니다.
            원하실 때 언제든 중단할 수 있습니다.
          </p>
        </section>

        {/* CTA */}
        <section className="space-y-2">
          <a
            href={AD_MAILTO}
            className="block rounded-2xl bg-blue-600 px-4 py-3.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            메일로 광고 문의하기 · {AD_MAIL}
          </a>
          <a
            href={`tel:${AD_PHONE}`}
            className="block rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
          >
            전화 문의 · {AD_PHONE}
          </a>
        </section>

        <p className="pb-4 text-center text-xs text-slate-400">
          FerryCast(페리캐스트) · 완도 배편·날씨·물때 서비스 ·{" "}
          <Link href="/" className="text-blue-500 underline">
            메인으로
          </Link>
        </p>
      </div>
    </main>
  )
}
