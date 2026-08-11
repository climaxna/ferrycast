"use client"

import { useState, useEffect } from "react"
import WeatherCardShell from "@/components/WeatherCardShell"
import RouteTabs from "@/components/RouteTabs"
import LocalAdCard from "@/components/LocalAdCard"
import LocalAdSlot from "@/components/LocalAdSlot"
import Logo from "@/components/Logo"
import type { WeatherData } from "@/lib/weather"
import type { WandoRoute } from "@/lib/types"
import type { DirSummary } from "@/lib/mtis"
import { PREVIEW_AD } from "@/config/localAds"

// 광고주에게 "배너가 실제로 이렇게 들어갑니다"를 보여주는 미리보기.
//
// 설계 원칙: **메인 페이지(src/app/page.tsx)는 건드리지 않는다.**
// 대신 메인이 쓰는 것과 **같은 컴포넌트**(WeatherCardShell·RouteTabs·LocalAdCard)에
// 고정 목업 데이터를 넣어 화면을 재현한다. 스크린샷이 아니라 실제 렌더라
//  - 모바일에서 열어도 그대로 반응형이고
//  - 메인 디자인이 바뀌면 미리보기도 자동으로 따라간다(스샷처럼 낡지 않음).
//
// 데이터는 전부 가짜다. 실시간 API를 호출하지 않으므로 쿼터에도 영향이 없다.

const MOCK_DEP: WandoRoute[] = [
  {
    id: "dep-jeju",
    to: "제주",
    operator: "한일골드스텔라 · 실버클라우드",
    times: ["02:30", "09:20", "15:00"],
    status: "operating",
    isLive: true,
    terminal: "완도여객선터미널",
    tomorrow: { tripCount: 3, times: ["02:30", "09:20", "15:00"] },
  },
  {
    id: "dep-cheongsando",
    to: "청산도",
    operator: "슬로시티청산도호 · 청산아일랜드호",
    times: ["07:00", "08:30", "11:00", "13:00", "14:30", "18:00"],
    status: "operating",
    isLive: true,
    terminal: "완도여객선터미널",
    durationMin: 50,
    tomorrow: { tripCount: 6, times: ["07:00", "08:30", "11:00", "13:00", "14:30", "18:00"] },
  },
  {
    id: "dep-hwaheungpo-route",
    to: "소안도·보길도·노화",
    operator: "대한호 · 민국호",
    times: ["06:45", "08:55", "10:55", "12:55", "14:55", "16:55", "18:25"],
    status: "operating",
    isLive: true,
    terminal: "화흥포항",
    tomorrow: { tripCount: 13, times: ["06:45", "08:55", "10:55"] },
  },
]

const MOCK_ARR: WandoRoute[] = [
  {
    id: "arr-jeju",
    to: "완도",
    from: "제주",
    operator: "한일골드스텔라",
    times: ["08:40", "19:30"],
    status: "operating",
    isLive: true,
    terminal: "완도여객선터미널",
    islandTerminal: "제주항 연안여객터미널",
  },
  {
    id: "arr-cheongsando",
    to: "완도",
    from: "청산도",
    operator: "청산아일랜드호 · 퀸청산호",
    times: ["06:50", "09:00", "11:30", "13:00", "15:00", "18:00"],
    status: "operating",
    isLive: true,
    terminal: "완도여객선터미널",
    islandTerminal: "도청항",
    durationMin: 50,
  },
]

const MOCK_SUMMARIES: DirSummary = {
  dep: { normal: 16, cancelled: 0, done: 0, alerts: [] },
  arr: { normal: 8, cancelled: 0, done: 0, alerts: [] },
}

export default function PreviewClient() {
  const [showAd, setShowAd] = useState(true)

  // 관측시각은 "오늘"로 보여야 미리보기가 낡아 보이지 않는다.
  // SSR/CSR 불일치를 피하려고 초기값은 고정하고 마운트 후 실제 KST로 교체한다.
  const [stamp, setStamp] = useState({ baseDate: "20260101", baseTime: "1000" })
  useEffect(() => {
    const k = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString()
    setStamp({ baseDate: k.slice(0, 10).replace(/-/g, ""), baseTime: `${k.slice(11, 13)}00` })
  }, [])

  const weather: WeatherData = {
    temp: 24,
    humidity: 62,
    windSpeed: 3.1,
    windDir: 225,
    pty: 0,
    sky: 1,
    rain1h: 0,
    waveHeight: 0.4,
    ...stamp,
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 미리보기 안내 바 — 실제 서비스와 혼동하지 않도록 상단 고정 */}
      <div className="sticky top-0 z-20 border-b border-amber-200 bg-amber-50/95 backdrop-blur-md">
        <div className="mx-auto max-w-lg px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-amber-800">
              광고 게재 미리보기
              <span className="ml-1.5 font-medium text-amber-700">· 실제 화면과 동일한 구성입니다</span>
            </p>
            <button
              type="button"
              onClick={() => setShowAd((v) => !v)}
              className="shrink-0 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-bold text-amber-800 transition-colors hover:bg-amber-100"
            >
              {showAd ? "광고 없는 화면 보기" : "광고 넣어서 보기"}
            </button>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
            아래 시간표·날씨는 배치를 보여주기 위한 예시 데이터입니다.
          </p>
        </div>
      </div>

      {/* ─── 아래는 메인 화면과 동일한 구성 ─── */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Logo />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-none tracking-tight text-slate-900">
              Ferry<span className="text-blue-600">Cast</span>
            </p>
            <p className="mt-1 truncate text-xs font-medium tracking-wide text-slate-400">
              완도 날씨 · 여객선 현황
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-3 px-4 pb-8 pt-2">
        <WeatherCardShell w={weather} onOpen={() => {}} />

        <RouteTabs
          departures={{ routes: MOCK_DEP, isLive: true }}
          arrivals={{ routes: MOCK_ARR, isLive: true }}
          summaries={MOCK_SUMMARIES}
          adSlot={
            showAd ? (
              <div className="relative">
                {/* 광고 위치 강조 — 미리보기에서만 보이는 안내 */}
                <p className="mb-1.5 text-[11px] font-bold text-amber-700">
                  ↓ 광고가 들어가는 자리 (배편 시간표 바로 아래)
                </p>
                <LocalAdCard ad={PREVIEW_AD} />
              </div>
            ) : (
              <LocalAdSlot regionName="완도" adsPath="/ads" />
            )
          }
        />

        <p className="pt-2 text-center text-xs leading-relaxed text-slate-400">
          이 화면은 광고 배치를 보여주기 위한 미리보기입니다.
          <br />
          실제 서비스는{" "}
          <a href="/" className="font-semibold text-blue-500 underline">
            ferrycast.kr
          </a>
          에서 확인하실 수 있습니다.
        </p>
      </div>
    </main>
  )
}
