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
      className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
    >
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        다른 지역 날씨 · 항로 보기
      </p>
      <div className="flex flex-wrap gap-2">
        {ITEMS.map((it) => {
          const href = it.slug ? `/${it.slug}` : "/"
          const active = it.slug === current
          return (
            <Link
              key={it.slug || "wando"}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-sky-600 text-white shadow-sm"
                  : "border border-slate-700 bg-slate-800 text-slate-400 hover:border-sky-700 hover:text-sky-300"
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
