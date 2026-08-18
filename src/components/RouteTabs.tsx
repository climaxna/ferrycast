"use client"

import { useState, useEffect, Fragment, type ReactNode } from "react"
import RouteItem from "./RouteItem"
import RouteDetail from "./RouteDetail"
import StatusBar from "./StatusBar"
import type { WandoRoute } from "@/lib/types"
import type { DirSummary } from "@/lib/mtis"

interface Props {
  departures: { routes: WandoRoute[]; isLive: boolean }
  arrivals: { routes: WandoRoute[]; isLive: boolean }
  summaries: DirSummary   // 출발/도착 운항 요약 — 탭에 따라 전환
  // 시간표 목록 직후(약산 섹션 앞) 단락 구분점에 노출할 지역 광고 슬롯 — 서버에서 렌더해 주입.
  adSlot?: ReactNode
  // 광고를 이 그룹키 카드 **바로 아래**에 끼워 넣는다(예: "hwaheungpo-route").
  // 목록 맨 끝은 스크롤이 끝난 자리라 눈에 잘 안 닿고, 노선이 늘어날수록 광고가 계속 아래로 밀린다.
  // dep-/arr- 접두사는 떼고 비교하므로 출발·도착 두 탭 모두에서 같은 자리에 붙는다.
  // 키를 못 찾으면 기존처럼 목록 맨 뒤에 붙는다(안전한 기본값).
  adAfterKey?: string
}

export default function RouteTabs({ departures, arrivals, summaries, adSlot, adAfterKey }: Props) {
  const [tab, setTab] = useState<"dep" | "arr">("dep")
  const [selected, setSelected] = useState<WandoRoute | null>(null)
  const [nowMinutes, setNowMinutes] = useState(0)

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setNowMinutes(d.getHours() * 60 + d.getMinutes())
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  const isDeparture = tab === "dep"
  const { routes, isLive } = isDeparture ? departures : arrivals
  const adIdx = adAfterKey
    ? routes.findIndex((r) => r.id.replace(/^(dep|arr)-/, "") === adAfterKey)
    : -1

  return (
    <section>
      {/* 운항 요약 바 — 출발/도착 탭에 따라 전환 */}
      <div className="mb-3">
        <StatusBar summary={isDeparture ? summaries.dep : summaries.arr} />
      </div>

      {/* 탭 헤더 — 출발(파랑) / 도착(초록) 색 분리 */}
      <div className={`mb-3 flex items-center gap-1 rounded-xl p-1 transition-colors ${
        isDeparture ? "bg-blue-50" : "bg-teal-50"
      }`}>
        <TabButton active={tab === "dep"} variant="dep" onClick={() => setTab("dep")}>
          완도 출발
        </TabButton>
        <TabButton active={tab === "arr"} variant="arr" onClick={() => setTab("arr")}>
          완도 도착
        </TabButton>
        {!isLive && (
          <span className="mr-1.5 shrink-0 text-[11px] font-medium text-amber-500">
            참고 시간표
          </span>
        )}
      </div>

      {/* 항로 목록 */}
      {routes.length > 0 ? (
        <div className="space-y-2.5">
          {routes.map((route, i) => (
            <Fragment key={route.id}>
              <RouteItem
                route={route}
                nowMinutes={nowMinutes}
                isArrival={!isDeparture}
                onClick={() => setSelected(route)}
              />
              {i === adIdx && adSlot}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          항로 정보를 불러올 수 없습니다.
        </div>
      )}

      {/* 지역 광고 — adAfterKey를 못 찾았을 때의 대체 위치(목록 맨 뒤) */}
      {routes.length > 0 && adSlot && adIdx < 0 && <div className="mt-3">{adSlot}</div>}

      {/* 상세 바텀 시트 */}
      {selected && (
        <RouteDetail
          route={selected}
          isDeparture={isDeparture}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  )
}

function TabButton({
  active,
  variant,
  onClick,
  children,
}: {
  active: boolean
  variant: "dep" | "arr"
  onClick: () => void
  children: React.ReactNode
}) {
  const activeClass = variant === "arr"
    ? "bg-white text-teal-700 shadow-sm"
    : "bg-white text-blue-700 shadow-sm"

  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all ${
        active ? activeClass : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {variant === "dep" ? <FerryIcon /> : <AnchorIcon />}
      {children}
    </button>
  )
}

function FerryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 14h18l-1.4 4.8a2 2 0 0 1-1.9 1.4H6.3a2 2 0 0 1-1.9-1.4L3 14Z" />
      <path d="M5.5 14V8.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2V14" />
      <path d="M12 3v3.5" />
    </svg>
  )
}

function AnchorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="2.4" />
      <path d="M12 7.4V21" />
      <path d="M5 13H3a9 9 0 0 0 18 0h-2" />
    </svg>
  )
}
