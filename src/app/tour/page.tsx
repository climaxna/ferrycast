import type { Metadata } from "next"
import Link from "next/link"
import { TOUR_GUIDES, type TourGuide } from "@/content/tourGuides"

export const metadata: Metadata = {
  title: "섬 관광지 안내 모아보기",
  description: "여객선 도착지별 주요 관광지와 공식 안내를 한곳에서 확인하세요. 완도·목포·인천·울릉도·제주 섬 여행 전 배편과 귀항편 확인 방법도 함께 안내합니다.",
  alternates: { canonical: "/tour" },
  openGraph: {
    type: "website",
    siteName: "FerryCast",
    title: "섬 관광지 안내 모아보기 | FerryCast",
    description: "배편 도착지별 관광지와 공식 안내를 한곳에서 확인하세요.",
    url: "https://ferrycast.kr/tour",
    locale: "ko_KR",
    images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: "FerryCast — 실시간 운항·결항 정보" }],
  },
}

const GROUPS: Array<{ name: string; description: string; slugs: string[] }> = [
  {
    name: "완도 출발 섬 여행",
    description: "완도항에서 배로 들어가는 청산도와 보길도 안내입니다.",
    slugs: ["cheongsando", "bogildo"],
  },
  {
    name: "목포·신안 다도해",
    description: "홍도·흑산도부터 신안과 조도면 경유 섬까지, 실제 하선 섬을 확인하세요.",
    slugs: ["hongdo", "heuksando", "gageodo", "bigeum-docho", "oedaldo", "jangsan-haui-sinui", "seogeocha-gwanmaedo"],
  },
  {
    name: "인천 서해 섬",
    description: "인천과 삼목항에서 연결되는 서해 섬 여행 안내입니다.",
    slugs: ["baengnyeongdo", "deokjeokdo", "daeijakdo", "gulupdo", "yeonpyeongdo", "jangbongdo", "pungdo", "uldo"],
  },
  {
    name: "울릉도·제주",
    description: "장거리 여객선 여행 전 도착항과 섬 안 이동을 먼저 확인하세요.",
    slugs: ["ulleungdo", "jeju-port"],
  },
]

function guidesFor(slugs: string[]): TourGuide[] {
  return slugs.flatMap((slug) => {
    const guide = TOUR_GUIDES.find((item) => item.slug === slug)
    return guide ? [guide] : []
  })
}

export default function TourIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Link href="/" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" aria-label="실시간 배편 화면으로">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </Link>
          <div>
            <p className="text-base font-bold text-slate-900">섬 관광지 안내</p>
            <p className="mt-0.5 text-xs font-medium text-slate-400">FerryCast 지역 관광 모아보기</p>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-lg space-y-8 px-4 py-6">
        <header className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-5">
          <p className="text-sm font-semibold text-blue-700">배편 다음에 확인할 정보</p>
          <h1 className="mt-1.5 text-xl font-bold leading-snug text-slate-900 text-balance">도착지별 관광지와 귀항편 확인</h1>
          <p className="mt-3 max-w-prose text-sm leading-6 text-slate-700">섬마다 선착장과 이동 여건이 다릅니다. 관광지로 이동하기 전, 실제 하선 섬과 돌아오는 배편을 먼저 확인하세요. 각 안내에는 지도 검색과 공식 관광 정보를 함께 담았습니다.</p>
        </header>

        <nav aria-label="지역별 관광지 안내" className="space-y-7">
          {GROUPS.map((group) => {
            const guides = guidesFor(group.slugs)
            if (guides.length === 0) return null

            return (
              <section key={group.name} aria-labelledby={`group-${group.name}`}>
                <div className="mb-3">
                  <h2 id={`group-${group.name}`} className="text-base font-bold text-slate-900 text-balance">{group.name}</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{group.description}</p>
                </div>
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {guides.map((guide) => (
                    <li key={guide.slug}>
                      <Link href={`/tour/${guide.slug}`} className="group flex min-h-24 items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700" aria-hidden="true">{guide.places.length}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-bold text-slate-900">{guide.region}</span>
                          <span className="mt-0.5 block truncate text-sm text-slate-600">{guide.places.slice(0, 2).map((place) => place.name).join(" · ")}</span>
                        </span>
                        <span className="text-lg font-medium text-slate-300 transition-colors group-hover:text-blue-700" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </nav>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-800">섬 여행 전 공통 확인</h2>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
            <li>관광지 운영시간·입장료·주차·안전 정보는 장소별 공식 안내를 확인하세요.</li>
            <li>기상과 운항 계획에 따라 배편이 바뀔 수 있으므로, 출발 직전 실시간 운항 상태를 다시 확인하세요.</li>
          </ul>
        </aside>

        <Link href="/guide" className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          배편 이용 가이드 전체 보기 <span aria-hidden="true">→</span>
        </Link>
      </article>
    </main>
  )
}
