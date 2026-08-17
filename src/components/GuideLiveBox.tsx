import Link from "next/link"
import { getGuideLiveStatus } from "@/lib/guideLive"
import type { Guide } from "@/content/guides"

// 가이드 상단 실시간 박스 — 검색으로 착지한 사용자가 클릭 없이 "오늘 뜨나요?"를 바로 본다.
// 실시간 데이터가 없거나(API 장애) 매칭 키가 없으면 상태를 단정하지 않고 링크만 노출한다.
export default async function GuideLiveBox({ guide }: { guide: Guide }) {
  const live = await getGuideLiveStatus(guide)

  // ── 실시간 확정 불가 → 중립 CTA(파랑). 상태를 단정하지 않는다(원칙 #3·#4) ──
  if (!live || !live.isLive || live.status === "unknown") {
    return (
      <Link
        href={guide.liveHref}
        className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 px-5 py-4 text-white shadow-lg shadow-blue-900/10 transition-transform active:scale-[0.99]"
      >
        <div>
          <p className="text-sm font-bold">오늘 {guide.destination} 배 뜨나요?</p>
          <p className="mt-0.5 text-xs text-blue-100">실시간 운항·결항·날씨 바로 확인 →</p>
        </div>
        <span className="text-2xl" aria-hidden="true">
          ⛴️
        </span>
      </Link>
    )
  }

  // ── 결항/비운항 ──
  if (live.status === "cancelled") {
    const suspended = live.cancelKind === "suspended"
    const c = suspended
      ? { ring: "border-amber-200", bg: "bg-amber-50", dot: "🟠", head: "text-amber-800", label: "오늘 비운항", sub: "text-amber-700" }
      : { ring: "border-rose-200", bg: "bg-rose-50", dot: "🔴", head: "text-rose-800", label: "오늘 결항", sub: "text-rose-700" }
    return (
      <div className={`rounded-2xl border ${c.ring} ${c.bg} px-5 py-4 shadow-sm`}>
        <p className={`flex items-center gap-2 text-base font-bold ${c.head}`}>
          <span aria-hidden="true">{c.dot}</span>
          {c.label} — {guide.destination}
        </p>
        {live.cancelReason && <p className={`mt-1 text-sm ${c.sub}`}>사유: {live.cancelReason}</p>}
        <p className={`mt-1 text-xs ${c.sub}`}>
          {suspended ? "선박검사·정비 등 계획된 비운항입니다. " : "기상 등으로 오늘 운항이 중단됐습니다. "}
          출발 전 공식 채널에서 최종 확인하세요.
        </p>
        <Link
          href={guide.liveHref}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700"
        >
          {guide.regionName} 전체 실시간 현황 →
        </Link>
      </div>
    )
  }

  // ── 정상 운항 ──
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
      <p className="flex items-center gap-2 text-base font-bold text-emerald-800">
        <span aria-hidden="true">🟢</span>
        오늘 정상 운항 — {guide.destination}
      </p>
      {live.nextTimes.length > 0 ? (
        <div className="mt-2">
          <p className="text-xs font-semibold text-emerald-700">지금 이후 출발</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {live.nextTimes.map((t) => (
              <span
                key={t}
                className="rounded-md bg-white px-2 py-1 text-sm font-bold tabular-nums text-emerald-700 ring-1 ring-emerald-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-emerald-700">오늘 남은 출발편은 없습니다. 내일 시간표를 확인하세요.</p>
      )}
      <Link
        href={guide.liveHref}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700"
      >
        시간표·날씨·상세 보기 →
      </Link>
    </div>
  )
}
