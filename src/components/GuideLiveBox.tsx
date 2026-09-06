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
          {suspended ? "제공된 정보에서 비운항으로 분류됐습니다. " : "제공된 정보에서 결항으로 분류됐습니다. "}
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

  // 남은 시각이 없다는 사실을 실제 전편 운항 완료로 표현하지 않는다.
  if (live.nextTimes.length === 0) {
    return (
      <Link href={guide.liveHref} className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-700 shadow-sm hover:border-blue-200">
        <p className="text-sm font-bold">현재 시간표에 남은 출발편이 없습니다</p>
        <p className="mt-1 text-xs leading-relaxed">실제 출항 완료를 의미하지 않습니다. 편별 상태와 다음 일정을 확인하세요. →</p>
      </Link>
    )
  }

  // 항로 운항과 전편 정상은 다르다. 부분 결항은 별도로 안내한다.
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
      <p className="flex items-center gap-2 text-base font-bold text-emerald-800">
        <span aria-hidden="true">🟢</span>
        운항으로 표시된 편 있음 — {guide.destination}
      </p>
      {!!live.cancelledCount && (
        <p className="mt-2 text-sm font-semibold text-rose-700">일부 결항·비운항 {live.cancelledCount}편 · 내 시각의 상태를 확인하세요.</p>
      )}
        <div className="mt-2">
          <p className="text-xs font-semibold text-emerald-700">지금 이후 예정 시각 · 출항 확정은 선사 확인</p>
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
      <Link
        href={guide.liveHref}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700"
      >
        시간표·날씨·상세 보기 →
      </Link>
    </div>
  )
}
