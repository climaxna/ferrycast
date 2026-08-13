import Link from "next/link"
import Image from "next/image"
import { AD_MAIL, buildAdMailto } from "@/lib/adInquiry"
import { AD_SLOT_RATIO } from "@/config/localAds"
import AdLabel from "./AdLabel"

// 게재 예시 배너 — 전부 가상의 업체다(실제 광고주 아님).
// 실물과 같은 형태로 보여주려고 실제 게재 배너와 동일한 규격·비율로 만들었다.
// 업종은 영업 우선순위 순: 특산물 -> 펜션 -> 식당 -> 카페.
const SAMPLE_ADS = [
  { src: "/ads/samples/seafood.jpg", label: "특산물 · 건어물", alt: "예시 배너 — 섬마을 건어물, 완도 특산물 직송, 멸치·미역·오징어·다시마, 택배 가능" },
  { src: "/ads/samples/pension.jpg", label: "펜션 · 숙박", alt: "예시 배너 — 바다향기 펜션, 전 객실 오션뷰, 선착장 5분, 가족여행 추천" },
  { src: "/ads/samples/restaurant.jpg", label: "식당", alt: "예시 배너 — 청해식당, 완도 현지인이 찾는 맛집, 전복죽·생선구이·해산물 정식, 단체 식사 가능" },
  { src: "/ads/samples/cafe.jpg", label: "카페", alt: "예시 배너 — 카페 파도, 완도 바다 앞 감성카페, 커피·에이드·수제디저트, 포장 가능" },
]

// 지역 광고 안내 페이지 본문 (완도 /ads, 각 지역 /[region]/ads 공용).
// 소개·게재위치는 지역명을 넣고, 게재 예시(시안)는 지역 무관 공용 문구로 유지.
export default function AdsPageContent({
  regionName,
  adsPath,
  homePath,
}: {
  regionName: string
  adsPath: string
  homePath: string
}) {
  const mailto = buildAdMailto({ regionName, adsPath })

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Link href={homePath} className="text-slate-400 transition-colors hover:text-blue-600" aria-label="메인으로">
            ←
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">
              {regionName} 지역 광고 안내
            </h1>
            <p className="mt-1 text-xs font-medium tracking-wide text-slate-400">
              Ferry<span className="text-blue-600">Cast</span> · ferrycast.kr
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* 소개 — 지역명 포함 */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 px-5 py-6 text-white shadow-lg shadow-blue-900/10">
          <h2 className="text-xl font-bold leading-snug">
            {regionName} 배편·날씨를 보러 온
            <br />
            손님에게 가게를 알려보세요
          </h2>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/25">
            📢 월 5만원부터 · 배너 무료 제작
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-blue-50">
            <li>· {regionName} 배편·날씨·물때를 확인하러 <strong className="font-bold text-white">매일 방문</strong>합니다</li>
            <li>· 방문자 상당수가 <strong className="font-bold text-white">여행·이동을 준비하는 손님</strong>입니다</li>
            <li>· 배 시간을 보러 하루에도 여러 번 다시 여는 화면 — <strong className="font-bold text-white">반복 노출</strong></li>
          </ul>
        </section>

        {/* 게재 위치 — 지역명 포함 */}
        <section>
          <h3 className="mb-2 text-sm font-bold text-slate-700">게재 위치</h3>
          <p className="rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-500 shadow-sm">
            {regionName} 메인 화면의 <strong className="font-semibold text-slate-700">배편 시간표 바로 아래</strong>,
            출발 시각을 확인한 뒤 자연스럽게 눈이 닿는 자리입니다.
            아래 예시와 같은 형태로 게재됩니다.
          </p>
        </section>

        {/* 게재 예시 — 지역 무관 공용 (지역명 없음). 실제 게재와 같은 비율·같은 컴포넌트 모양 */}
        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-700">게재 예시</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              화면에 보이는 실제 크기 그대로입니다. 아래 업체는 모두 예시로 만든 가상의 가게입니다.
            </p>
          </div>

          {SAMPLE_ADS.map((s) => (
            <div key={s.src}>
              <p className="mb-1.5 text-xs font-semibold text-blue-600">{s.label}</p>
              {/* 실제 게재 배너(LocalAdCard)와 같은 껍데기 — 흰 카드 + 그림자 + 우상단 광고 라벨 */}
              <div
                className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                style={{ aspectRatio: String(AD_SLOT_RATIO) }}
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 512px) 100vw, 512px"
                />
                <AdLabel tone="onImage" />
              </div>
            </div>
          ))}

          <p className="text-[11px] leading-relaxed text-slate-400">
            * 배너는 사장님이 보내주신 사진과 소개 문구로{" "}
            <strong className="font-semibold text-slate-500">무료 제작</strong>해 드립니다.
            마음에 드실 때까지 수정해 드리며, 배너를 누르면 전화·홈페이지·스마트스토어로 바로 연결됩니다.
          </p>
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
            비용은 월 5만원부터이며, 월 단위라 원하실 때 언제든 중단할 수 있습니다.
            문의 주시면 업종·기간에 맞춰 안내드립니다.
          </p>
        </section>

        {/* CTA */}
        <section className="space-y-2">
          <a
            href={mailto}
            className="block rounded-2xl bg-blue-600 px-4 py-3.5 text-center text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            메일로 광고 문의하기 · {AD_MAIL}
          </a>
          <p className="text-center text-xs text-slate-400">
            문의는 메일로 받고 있습니다. 버튼을 누르면 문의 양식이 자동으로 채워집니다.
          </p>
        </section>

        <p className="pb-4 text-center text-xs text-slate-400">
          FerryCast(페리캐스트) · 배편·날씨·물때 서비스 ·{" "}
          <Link href={homePath} className="text-blue-500 underline">
            메인으로
          </Link>
        </p>
      </div>
    </main>
  )
}
