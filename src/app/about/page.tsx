import Link from "next/link"

export const metadata = {
  title: "FerryCast 소개 — 만든 이유와 데이터 출처",
  description:
    "FerryCast는 완도 출신 개발자가 만든 전국 여객선 실시간 운항·결항 정보 서비스입니다. 서비스 소개, 데이터 출처, 운영자 정보를 안내합니다.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="홈으로"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-slate-900">FerryCast 소개</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-600">
            FerryCast는 완도·울릉도·목포·인천·제주를 오가는 여객선의 오늘 운항 여부, 결항 상태,
            시간표, 날씨·조석 정보를 한 화면에서 실시간으로 보여주는 서비스입니다.
          </p>
        </div>

        <Section title="왜 만들었나">
          <p>
            완도가 고향입니다. 배편은 하루에도 몇 번씩 바뀌는데, 정작 오늘 배가 뜨는지
            확인하려면 여러 사이트를 돌아다니거나 전화를 걸어야 했습니다. 특히 기상이
            나쁜 날은 전화 연결조차 안 돼 결항 여부를 알 수 없는 경우가 많았습니다.
          </p>
          <p className="mt-2">
            운항 정보를 공공데이터로 받아 한 화면에 정리하면 이 문제를 해결할 수 있겠다고
            생각해 2026년에 직접 만들었습니다. 처음엔 완도 한 곳만 다뤘지만, 같은 문제가
            울릉도·목포·인천·제주로 다니는 분들에게도 있다는 걸 알게 되어 지역을 넓혔습니다.
          </p>
        </Section>

        <Section title="무엇을 제공하나">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>오늘 각 항로의 운항·결항·비운항 실시간 현황</li>
            <li>출항 시각, 소요시간, 도착 예정시각</li>
            <li>결항 사유(기상 통제 / 선박검사·정비 등 계획된 휴항) 구분 표시</li>
            <li>현재 날씨·파고, 5일 날씨·조석(만조·간조) 예보</li>
            <li>출발·도착 터미널 위치(지도 연결)</li>
          </ul>
        </Section>

        <Section title="데이터 출처">
          <p className="mb-2">
            서비스에 표시되는 모든 운항·기상 정보는 아래 공공기관이 제공하는 공식
            오픈API를 그대로 가져와 정리합니다. FerryCast가 자체적으로 만들어내는
            운항 정보는 없습니다.
          </p>
          <SubItem title="한국해양교통안전공단(KOMSA)">
            여객선 운항 스케줄 및 운항·결항 현황(MTIS) — 전국 여객선 시간표의 기준 데이터입니다.
          </SubItem>
          <SubItem title="기상청">
            초단기실황·단기예보(날씨, 풍속, 파고) — 항로별 인근 해역 기상 정보입니다.
          </SubItem>
          <SubItem title="국립해양조사원(KHOA)">
            조석예보 — 만조·간조 시각과 높이의 5일 예보입니다.
          </SubItem>
          <p className="mt-2 text-xs text-slate-400">
            모든 데이터는 공공데이터포털(data.go.kr)을 통해 제공받으며, 원 데이터 자체의
            지연·오류가 있을 수 있어 최종 운항 여부는 반드시 공식 채널로 재확인해야 합니다.
          </p>
        </Section>

        <Section title="정확도에 대한 원칙">
          <p>
            결항 여부는 공공데이터의 운항구분 값을 그대로 반영합니다. 다만 기상 악화나
            현장 사정으로 예고 없이 바뀔 수 있으므로, 화면에 표시되는 정보는 참고용이며
            실제 승선 전에는 반드시 해당 선사나 한국해운조합 승선예약 시스템 등 공식
            채널에서 최종 확인해야 합니다.
          </p>
        </Section>

        <Section title="운영자">
          <p>김신진 — 개인 개발자가 운영하는 비영리 성격의 정보 서비스입니다.</p>
          <p className="mt-2">
            문의·오류 제보:{" "}
            <a href="mailto:climaxna@naver.com" className="text-blue-600 underline underline-offset-2">
              climaxna@naver.com
            </a>
          </p>
        </Section>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/guide"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
          >
            항로 가이드
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700"
          >
            개인정보처리방침
          </Link>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-800">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  )
}

function SubItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="mt-0.5">{children}</p>
    </div>
  )
}
