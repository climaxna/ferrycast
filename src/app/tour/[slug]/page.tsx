import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTourGuide, TOUR_GUIDES } from "@/content/tourGuides"

export function generateStaticParams() {
  return TOUR_GUIDES.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = getTourGuide(slug)
  if (!guide) return {}
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/tour/${guide.slug}` },
    openGraph: {
      type: "article",
      siteName: "FerryCast",
      title: guide.title,
      description: guide.description,
      url: `https://ferrycast.kr/tour/${guide.slug}`,
      locale: "ko_KR",
      images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: "FerryCast — 실시간 운항·결항 정보" }],
    },
  }
}

export default async function TourGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getTourGuide(slug)
  if (!guide) notFound()

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Link href="/" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" aria-label="실시간 배편 화면으로">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </Link>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-900">{guide.region} 관광지</p>
            <p className="mt-0.5 text-xs font-medium text-slate-400">FerryCast 지역 관광 안내</p>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <header className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
          <p className="text-sm font-semibold text-blue-700">여객선 도착항 · {guide.arrivalPort}</p>
          <h1 className="mt-1.5 text-xl font-bold leading-snug text-slate-900 text-balance">{guide.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">{guide.intro}</p>
        </header>

        <section aria-labelledby="places-heading">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="places-heading" className="text-base font-bold text-slate-900">주요 관광지</h2>
              <p className="mt-1 text-xs text-slate-500">장소별 위치와 공식 안내를 함께 확인하세요.</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-blue-700">{guide.places.length}곳</span>
          </div>
          <ol className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {guide.places.map((place, index) => (
              <li key={place.name} className="p-4">
                <div className="flex gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold tabular-nums text-blue-700">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-slate-900">{place.name}</p>
                    <p className="mt-0.5 text-xs font-semibold text-blue-700">{place.category}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{place.description}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      <a href={`https://map.kakao.com/?q=${encodeURIComponent(place.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">지도 보기 ↗</a>
                      <a href={place.officialHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">공식 안내 ↗</a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-800">방문 전 확인</h2>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
            <li>관광지 운영시간·입장료·주차·안전 정보는 장소별 공식 안내를 확인하세요.</li>
            <li>섬 안 이동과 귀항편은 별도입니다. 배편 시간표에서 {guide.arrivalPort} 출발 귀항편을 확인하세요.</li>
          </ul>
        </aside>

        <section className="border-t border-slate-200 pt-4">
          <h2 className="text-sm font-bold text-slate-800">출처와 확인 범위</h2>
          <p className="mt-2 text-xs leading-5 text-slate-600">{guide.sourceNote}</p>
          <a href={guide.officialHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">완도문화관광 {guide.region} 공식 안내 ↗</a>
        </section>

        <Link href={guide.ferryGuideHref} className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          {guide.ferryGuideLabel} <span aria-hidden="true">→</span>
        </Link>
      </article>
    </main>
  )
}
