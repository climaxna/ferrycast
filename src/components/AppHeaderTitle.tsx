"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Logo from "./Logo"

// 헤더의 로고+제목 = 새로고침 버튼. 날씨 카드의 수동 새로고침 아이콘을 없앤 뒤의 갱신 수단으로,
// 화면에 아이콘을 하나 더 두지 않고 이미 있는 헤더에 기능을 얹었다(스크롤 위치와 무관하게 상단 고정).
//
// router.refresh()는 전체 리로드 없이 서버 컴포넌트만 다시 받아온다(입력·모달 상태 유지).
// 다만 페이지가 ISR(완도 60초)이고 데이터 fetch도 revalidate 캐시라, 캐시가 아직 신선하면
// 같은 값이 돌아올 수 있다 — "지금 즉시 원본 재조회"가 아니라 "갱신본이 있으면 받아오기"에 가깝다.
//
// 마크업 주의: h1 > button 순서여야 유효하다(button 안에는 h1 같은 블록 요소를 넣을 수 없음).
export default function AppHeaderTitle({ subtitle }: { subtitle: string }) {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    router.refresh()
    // 서버 렌더가 끝나는 시점을 알 수 없어 짧게 표시만 하고 되돌린다(광고성 스피너 방지)
    setTimeout(() => setRefreshing(false), 1200)
  }

  return (
    <h1 className="min-w-0 flex-1">
      <button
        type="button"
        onClick={handleRefresh}
        aria-label={`FerryCast ${subtitle} · 새로고침`}
        className="flex w-full items-center gap-2.5 rounded-lg text-left transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Logo className={refreshing ? "opacity-50" : ""} />
        <span className="min-w-0">
          <span className="block text-lg font-bold leading-none tracking-tight text-slate-900">
            Ferry<span className="text-blue-600">Cast</span>
          </span>
          {/* 새로고침 중에는 부제를 상태 문구로 교체 — 별도 스피너 없이 진행을 알린다 */}
          <span className="mt-1 block truncate text-xs font-medium tracking-wide text-slate-400">
            {refreshing ? "새로고침 중…" : subtitle}
          </span>
        </span>
      </button>
    </h1>
  )
}
