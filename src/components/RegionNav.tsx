import Link from "next/link"
import { REGIONS } from "@/config/regions"

// 완도(메인) + config의 모든 지역. current는 현재 페이지 slug("" = 완도)
const ITEMS: Array<{ slug: string; name: string }> = [
  { slug: "", name: "완도" },
  ...Object.values(REGIONS).map((r) => ({ slug: r.slug, name: r.name })),
]

export default function RegionNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="지역 이동"
      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
    >
      <p className="mb-2.5 text-xs font-semibold text-slate-400">
        다른 지역 날씨 · 항로 보기
      </p>
      {/* 지역 칩 — 카드 폭을 균등 분할한 세그먼트 정렬 (지역 ≤6개까지 안전, 더 늘면 재조정) */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${ITEMS.length}, minmax(0, 1fr))` }}
      >
        {ITEMS.map((it) => {
          const href = it.slug ? `/${it.slug}` : "/"
          const active = it.slug === current
          return (
            <Link
              key={it.slug || "wando"}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {it.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
