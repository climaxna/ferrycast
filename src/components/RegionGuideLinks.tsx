import Link from "next/link"
import { getGuide } from "@/content/guides"

const RECOMMENDED: Record<string, string[]> = {
  "": ["wando-cheongsando", "wando-soan-bogil-nohwa", "ferry-status"],
  mokpo: ["jeju", "ferry-status", "boarding-checklist"],
  incheon: ["ferry-status", "fog-cancellation", "boarding-checklist"],
  jeju: ["jeju", "ferry-status", "boarding-checklist"],
  ulleung: ["ulleung", "fog-cancellation", "ferry-status"],
}

// 서버에서 고정 링크만 렌더링한다. 시간표·광고 순서와 API 호출에는 영향을 주지 않는다.
export default function RegionGuideLinks({ region }: { region: string }) {
  const guides = (RECOMMENDED[region] ?? RECOMMENDED.incheon)
    .map(getGuide).filter((guide) => guide !== undefined)

  return (
    <section aria-labelledby="region-guide-heading" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 id="region-guide-heading" className="text-sm font-bold text-slate-800">배 타기 전 확인하세요</h2>
        <Link href="/guide" className="inline-flex min-h-11 items-center text-xs font-semibold text-blue-700 hover:underline focus-visible:outline-blue-600">전체 가이드 →</Link>
      </div>
      <ul className="divide-y divide-slate-100">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guide/${guide.slug}`} className="flex min-h-11 items-center justify-between gap-3 rounded-lg py-3 text-sm text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-blue-600">
              <span>{guide.title}</span>
              <span aria-hidden="true" className="shrink-0 text-slate-500">→</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/tour" className="flex min-h-11 items-center justify-between gap-3 rounded-lg py-3 text-sm font-semibold text-blue-700 transition-colors hover:text-blue-800 focus-visible:outline-blue-600">
            <span>도착지 관광지 안내 모아보기</span>
            <span aria-hidden="true" className="shrink-0">→</span>
          </Link>
        </li>
      </ul>
    </section>
  )
}
