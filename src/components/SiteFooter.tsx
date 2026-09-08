import Link from "next/link"

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-lg px-4 py-5">
        <p className="text-sm font-bold text-slate-800">FerryCast</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">실시간 여객선 운항·결항 정보와 섬 여행 이용 안내를 제공합니다.</p>
        <nav aria-label="서비스 정보" className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/about" className="inline-flex min-h-11 items-center text-xs font-semibold text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">서비스 소개</Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center text-xs font-semibold text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">이용약관</Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center text-xs font-semibold text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">개인정보처리방침</Link>
          <a href="mailto:climaxna@naver.com" className="inline-flex min-h-11 items-center text-xs font-semibold text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">문의</a>
        </nav>
        <div className="mt-2 border-t border-slate-100 pt-2">
          <a href="https://portal.ferrycast.kr/" className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            바로답 — FerryCast 포털 바로가기 →
          </a>
          <p className="text-xs leading-5 text-slate-500">FerryCast와 함께 운영하는 콘텐츠 포털입니다.</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">운항 정보는 참고용이며, 실제 승선 전에는 선사·예매처의 최종 안내를 확인하세요.</p>
      </div>
    </footer>
  )
}
