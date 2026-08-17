import type { Metadata } from "next"
import Link from "next/link"
import { guidesByRegion } from "@/content/guides"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "항로 가이드 — 배 시간표·요금·가는 법 | FerryCast",
  description:
    "완도·포항·목포·인천 주요 섬 여객선 가는 법, 시간표, 요금, 소요시간 안내. 청산도·소안도·울릉도·홍도·백령도 등. 오늘 운항·결항은 실시간으로 확인하세요.",
  alternates: { canonical: "/guide" },
  openGraph: {
    type: "website",
    siteName: "FerryCast",
    title: "항로 가이드 — 배 시간표·요금·가는 법 | FerryCast",
    description: "완도·포항·목포·인천 주요 섬 여객선 가는 법·시간표·요금 안내",
    url: "https://ferrycast.kr/guide",
    locale: "ko_KR",
    images: [{ url: "/og-v2.jpg", width: 1200, height: 630, alt: "FerryCast — 실시간 운항·결항 정보" }],
  },
}

export default function GuideIndexPage() {
  const groups = guidesByRegion()

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Link href="/" className="text-slate-400 transition-colors hover:text-blue-600" aria-label="메인으로">
            ←
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">항로 가이드</h1>
            <p className="mt-1 text-xs font-medium tracking-wide text-slate-400">
              Ferry<span className="text-blue-600">Cast</span> · 배 시간표·요금·가는 법
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-5">
        <p className="text-sm leading-relaxed text-slate-500">
          완도·포항·목포·인천 주요 섬으로 가는 여객선의 시간표, 요금, 소요시간, 터미널 정보를 정리했습니다.
          오늘 실제 운항·결항 여부는 각 지역 실시간 화면에서 확인하세요.
        </p>

        {groups.map((grp) => (
          <section key={grp.regionSlug || "wando"}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">{grp.regionName}</h2>
              <Link href={grp.liveHref} className="text-xs font-semibold text-blue-600 hover:underline">
                실시간 현황 →
              </Link>
            </div>
            <ul className="space-y-2">
              {grp.guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guide/${g.slug}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-blue-200"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{g.destination} 가는 법</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {g.facts.find((f) => f.label === "출발 터미널")?.value ?? "배 시간표·요금"}
                      </p>
                    </div>
                    <span className="shrink-0 text-slate-300" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="pb-4 text-center text-xs text-slate-400">
          FerryCast · 배편·날씨·물때 서비스 ·{" "}
          <Link href="/" className="text-blue-500 underline">
            메인으로
          </Link>
        </p>
      </div>
    </main>
  )
}
