"use client"

interface Props {
  routeLabel: string
  times: string[]
  onClose: () => void
}

export default function TomorrowSheet({ routeLabel, times, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg rounded-t-3xl bg-white px-5 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">내일 시간표</p>
        <p className="mt-0.5 text-lg font-bold text-slate-900">{routeLabel}</p>

        {times.length > 0 ? (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {times.map((t) => (
              <div
                key={t}
                className="flex items-center justify-center rounded-xl bg-slate-50 py-3 text-base font-bold tabular-nums text-slate-600 shadow-sm"
              >
                {t}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">내일 시간표 정보가 없습니다.</p>
        )}

        <p className="mt-4 text-xs text-slate-400">
          내일 운항 예정 · 기상 상황에 따라 변동될 수 있습니다
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-slate-100 py-3.5 text-base font-semibold text-slate-600"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
