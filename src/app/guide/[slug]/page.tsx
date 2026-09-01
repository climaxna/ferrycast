import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { GUIDES, getGuide, type Guide } from "@/content/guides"
import GuideLiveBox from "@/components/GuideLiveBox"

// 정적 콘텐츠 + 상단 실시간 박스(오늘 운항/결항)용 재생성 주기.
// ⚠️ Vercel Hobby ISR Writes 월 20만 회 한도 — 가이드 22개 × 홈·지역 5개가 전부 600초
// (10분) 주기였을 때 79.5%(159K)까지 찼다. 홈·지역은 결항 정보 신선도가 핵심 가치라
// 절대 늦추지 않고, 검색 유입용 보조 페이지인 가이드만 1800초(30분)로 늦춰 write량을
// 3분의 1로 줄인다. 데이터 장애 시 "정상"으로 오인시키지 않는 안전장치(GuideLiveBox)가
// 있어 신선도가 다소 떨어져도 잘못된 정보를 보여주진 않는다.
export const revalidate = 1800

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}
  const url = `https://ferrycast.kr/guide/${guide.slug}`
  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: `/guide/${guide.slug}` },
    openGraph: {
      type: "article",
      siteName: "FerryCast",
      title: guide.title,
      description: guide.description,
      url,
      locale: "ko_KR",
      images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: "FerryCast — 실시간 운항·결항 정보" }],
    },
  }
}

// 검색 리치결과용 JSON-LD (FAQ + 이동경로). 페이지 본문과 내용이 일치해야 한다.
function jsonLd(guide: Guide) {
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "FerryCast", item: "https://ferrycast.kr" },
      { "@type": "ListItem", position: 2, name: "항로 가이드", item: "https://ferrycast.kr/guide" },
      { "@type": "ListItem", position: 3, name: guide.title, item: `https://ferrycast.kr/guide/${guide.slug}` },
    ],
  }
  return JSON.stringify([faqPage, breadcrumb])
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  return (
    <main className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(guide) }} />

      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Link href="/guide" className="text-slate-400 transition-colors hover:text-blue-600" aria-label="가이드 목록">
            ←
          </Link>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight text-slate-900">{guide.title.split(" — ")[0]}</p>
            <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-400">
              Ferry<span className="text-blue-600">Cast</span> · {guide.regionName}
            </p>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-lg space-y-5 px-4 py-5">
        {/* 제목 + 도입 */}
        <div>
          <nav className="mb-2 text-xs text-slate-400" aria-label="이동경로">
            <Link href="/guide" className="hover:text-blue-600">
              항로 가이드
            </Link>{" "}
            · {guide.regionName}
          </nav>
          <h1 className="text-xl font-bold leading-snug tracking-tight text-slate-900">{guide.title}</h1>
          <div className="mt-3 space-y-2.5">
            {guide.intro.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-slate-600">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* 실시간 박스 — 검색으로 착지한 사용자가 클릭 없이 오늘 운항/결항을 바로 봄 */}
        <Suspense
          fallback={
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 px-5 py-4 text-white shadow-lg shadow-blue-900/10">
              <div>
                <p className="text-sm font-bold">오늘 {guide.destination} 배 뜨나요?</p>
                <p className="mt-0.5 text-xs text-blue-100">실시간 운항 현황 불러오는 중…</p>
              </div>
              <span className="text-2xl" aria-hidden="true">
                ⛴️
              </span>
            </div>
          }
        >
          <GuideLiveBox guide={guide} />
        </Suspense>

        {/* 요약 정보 */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-slate-700">한눈에 보기</h2>
          <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-4 shadow-sm">
            {guide.facts.map((f) => (
              <div key={f.label} className="flex items-start gap-3 py-2.5">
                <dt className="w-24 shrink-0 text-xs font-semibold text-slate-400">{f.label}</dt>
                <dd className="text-sm font-medium text-slate-700">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 시간표(검증 노선만) */}
        {guide.timetables?.map((tt) => (
          <section key={tt.title}>
            <h2 className="mb-2 text-sm font-bold text-slate-700">{tt.title}</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {tt.columns.map((c) => (
                      <th key={c} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tt.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-slate-50 last:border-0">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2 font-medium tabular-nums text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tt.note && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{tt.note}</p>}
          </section>
        ))}

        {/* 출발지별 상세 — 허브 총정리(제주도 배편 등) → 개별 노선 가이드로 연결 */}
        {guide.relatedGuides && guide.relatedGuides.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-slate-700">출발지별 상세 시간표</h2>
            <ul className="space-y-2">
              {guide.relatedGuides.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-colors hover:border-blue-200"
                  >
                    <span className="text-sm font-semibold text-slate-700">{r.label}</span>
                    <span className="text-slate-300" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 연락처 */}
        {guide.contacts && guide.contacts.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-slate-700">매표소·문의</h2>
            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-4 shadow-sm">
              {guide.contacts.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-xs font-semibold text-slate-400">{c.label}</dt>
                  <dd className="text-sm font-medium text-slate-700">
                    {/^[0-9][0-9-]+$/.test(c.value) ? (
                      <a href={`tel:${c.value.replace(/-/g, "")}`} className="text-blue-600 hover:underline">
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 팁 */}
        {guide.tips && guide.tips.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-slate-700">알아두면 좋아요</h2>
            <ul className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-600 shadow-sm">
              {guide.tips.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-400" aria-hidden="true">
                    ·
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-slate-700">자주 묻는 질문</h2>
          <div className="space-y-2">
            {guide.faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
                  <span className="text-blue-500">Q.</span> {f.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 예매 링크 */}
        {(guide.bookingUrl || guide.bookingNote) && (
          <section className="space-y-2">
            {guide.bookingUrl && (
              <a
                href={guide.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
              >
                공식 예매·요금 확인하기
              </a>
            )}
            {guide.bookingNote && <p className="text-center text-xs text-slate-400">{guide.bookingNote}</p>}
          </section>
        )}

        {/* 면책 + 실시간 재안내 */}
        <footer className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-500">
            이 가이드는 참고용입니다.{" "}
            <strong className="font-semibold text-slate-700">
              시간표는 계절·기상에 따라 바뀌며, 실제 운항 여부는 출발 전 공식 채널에서 반드시 최종 확인하세요.
            </strong>
          </p>
          <Link
            href={guide.liveHref}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            {guide.regionName} 실시간 운항 현황 보기 →
          </Link>
          <p className="mt-3 text-xs text-slate-400">최종 확인 {guide.updated}</p>
        </footer>
      </article>
    </main>
  )
}
