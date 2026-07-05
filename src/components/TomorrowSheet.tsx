"use client"

interface Props {
  routeLabel: string
  times: string[]
  isArrival?: boolean
  onClose: () => void
}

export default function TomorrowSheet({ routeLabel, times, isArrival = false, onClose }: Props) {
  // 방향색 — 출발=파랑 / 도착=틸 (앱 전역 규칙과 통일)
  const accent = isArrival
    ? { fill: "bg-teal-500", label: "text-teal-100", tint: "bg-teal-50 text-teal-700" }
    : { fill: "bg-blue-500", label: "text-blue-100", tint: "bg-blue-50 text-blue-700" }

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg rounded-t-3xl bg-white px-5 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          내일 시간표{times.length > 0 ? ` · ${times.length}편` : ""}
        </p>
        <p className="mt-0.5 text-lg font-bold text-slate-900">{routeLabel}</p>

        {times.length > 0 ? (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {times.map((t, i) =>
              i === 0 ? (
                /* 첫 배 — 방향색 채움으로 강조 (내일의 앵커) */
                <div
                  key={t}
                  className={`flex flex-col items-center justify-center rounded-xl ${accent.fill} py-3 shadow-sm`}
                >
                  <span className="text-base font-bold tabular-nums leading-none text-white">{t}</span>
                  <span className={`mt-0.5 text-[11px] font-semibold leading-none ${accent.label}`}>첫 배</span>
                </div>
              ) : (
                <div
                  key={t}
                  className={`flex items-center justify-center rounded-xl ${accent.tint} py-3 text-base font-bold tabular-nums shadow-sm`}
                >
                  {t}
                </div>
              )
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">내일 시간표 정보가 없습니다.</p>
        )}

        <p className="mt-4 text-xs text-slate-400">
          내일 운항 예정 · 기상 상황에 따라 변동될 수 있습니다
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-slate-100 py-3.5 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-200"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
