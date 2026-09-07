import type { Metadata } from "next"
import Link from "next/link"
import { guidesByRegion } from "@/content/guides"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "항로 가이드 — 출발항·배편 선택·승선 준비 | FerryCast",
  description:
    "제주도·울릉도·청산도 등 섬 배편의 출발항, 도착항, 승선 준비와 귀항 계획을 안내합니다. 일부 항로의 참고 시간표와 소요시간을 제공하며 최신 운임은 공식 예약처에서 확인하세요.",
  alternates: { canonical: "/guide" },
  openGraph: {
    type: "website",
    siteName: "FerryCast",
    title: "항로 가이드 — 출발항·배편 선택·승선 준비 | FerryCast",
    description: "출발·도착항 선택, 항로별 승선 준비와 귀항 계획. 일부 참고 시간표를 제공하며 최신 운임은 공식 예약처에서 확인하세요.",
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
              Ferry<span className="text-blue-600">Cast</span> · 출발항·배편 선택·승선 준비
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-5">
        <p className="text-sm leading-relaxed text-slate-500">
          완도·울릉도·목포·인천·제주 배편의 출발·도착항과 항로별 이동 준비를 정리했습니다.
          일부 항로에는 참고 시간표와 소요시간이 있으며, 최신 운임은 공식 예약처에서 확인할 수 있습니다.
          결항 표시 읽는 법, 해무 때 확인 순서와 승선 준비도 함께 안내합니다.
          오늘 실제 운항·결항 여부는 각 지역 실시간 화면에서 확인하세요.
        </p>

        {groups.map((grp) => (
          <section key={grp.regionSlug || "wando"}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">{grp.regionName}</h2>
              {grp.regionSlug !== "common" && <Link href={grp.liveHref} className="text-xs font-semibold text-blue-600 hover:underline">
                실시간 현황 →
              </Link>}
            </div>
            <ul className="space-y-2">
              {grp.guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guide/${g.slug}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition-colors hover:border-blue-200"
                  >
                    <div className="min-w-0">
                      {/* 타이틀은 "짧은 제목 — 부제" 형식이라 em dash 앞부분만 목록에 노출 */}
                      <p className="text-sm font-bold text-slate-800">{g.title.split(" — ")[0]}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        {g.kind === "usage" ? g.title.split(" — ")[1] : g.facts.find((f) => f.label === "출발 터미널")?.value ?? "출발항 비교·승선 준비"}
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
