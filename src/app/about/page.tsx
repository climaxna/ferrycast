import Link from "next/link"

export const metadata = {
  title: "FerryCast 소개 — 제공 정보와 데이터 출처",
  alternates: { canonical: "/about" },
  description:
    "FerryCast는 전국 여객선 실시간 운항·결항 정보 서비스입니다. 제공 정보와 공공데이터 출처, 정확도 원칙을 안내합니다.",
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
            시간표와 여행 준비 정보를 모아 보여주는 서비스입니다. 조회가 지연되거나 실패할 수 있으며,
            날씨·조석 화면은 현재 인천 지역에서만 제공하고 있습니다.
          </p>
        </div>

        <Section title="무엇을 제공하나">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>오늘 각 항로의 운항·결항·비운항 실시간 현황</li>
            <li>출항 시각, 소요시간, 도착 예정시각</li>
            <li>제공된 운항 구분과 사유에 따른 결항·비운항 표시</li>
            <li>인천 지역 날씨·조석 정보(조회 결과에 따라 일부 항목 미제공)</li>
            <li>출발·도착 터미널 위치(지도 연결)</li>
          </ul>
        </Section>

        <Section title="왜 FerryCast가 필요한가">
          <p>
            여객선 이용자는 시간표뿐 아니라 내가 타려는 편이 오늘 실제로 운항하는지 확인해야 합니다.
            같은 항로에서도 일부 편만 통제되거나 비운항일 수 있고, 출발 터미널·경유지·귀항편 정보는
            여러 안내 채널에 나뉘어 있습니다. FerryCast는 지역, 출발 방향, 출발 시각을 한 화면에서
            비교할 수 있게 정리해 이동 전에 확인할 대상을 좁히는 데 도움을 줍니다.
          </p>
          <p className="mt-2">
            특히 해무나 풍랑처럼 운항 계획이 바뀌는 날에는 항로 전체의 상태만 보지 않고,
            예약한 시각의 편별 상태와 제공되는 선박명·사유를 함께 확인하는 것이 중요합니다.
          </p>
        </Section>

        <Section title="결항과 비운항은 어떻게 구분하나">
          <p>
            FerryCast는 공공데이터의 운항구분을 기준으로 표시합니다. 운항 통제로 등록된 편은
            <strong className="font-semibold text-slate-700"> 결항</strong>, 선박검사·정비·휴항 등으로
            운항하지 않는 편은 <strong className="font-semibold text-slate-700">비운항</strong>으로 구분합니다.
            운항·증선·증회·대기·지연으로 등록된 정보는 운항 중인 상태로 표시하되, 대기·지연은
            출항 확정과 같은 뜻으로 해석하지 않습니다.
          </p>
          <p className="mt-2">
            사유 문구만으로 운항 여부를 임의로 판단하지 않습니다. 예를 들어 선박 정비 관련 문구가
            있어도 해당 편의 운항구분이 운항일 수 있으므로, 편별 상태를 우선 기준으로 사용합니다.
          </p>
        </Section>

        <Section title="실시간 조회가 지연되거나 실패하면">
          <p>
            제공기관 데이터가 늦거나 조회되지 않을 때에는 최근에 보관한 참고 시간표가 표시될 수 있습니다.
            이는 시간 계획을 돕기 위한 자료이며, 오늘 실제 출항을 확인했다는 뜻이 아닙니다.
            참고 시간표, 운항예정, 시간표 정보 없음은 정상 운항 확정 표시와 구분해서 보아야 합니다.
          </p>
          <p className="mt-2">
            화면 정보와 예약 내역 또는 선사 공지가 다르면, 날짜·방향·출발시각·선박명이 같은 공식 안내를
            최종 기준으로 확인하세요. 전화가 연결되지 않는 경우에도 확인되지 않은 정보를 정상 또는
            결항으로 추정하지 않는 것이 안전합니다.
          </p>
        </Section>

        <Section title="데이터 출처">
          <p className="mb-2">
            운항·기상 화면은 아래 공공기관의 데이터를 정리합니다. 조회 실패 시에는
            보관한 참고 시간표가 표시될 수 있습니다. 참고 시간표와 계산한 도착 예정시각은
            실제 출항·도착을 확인한 정보가 아닙니다. 가이드의 자료 출처와 확인 범위는 각 글에 표시합니다.
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
            제공기관 데이터와 서비스의 조회·가공 과정에 지연·오류가 있을 수 있습니다.
            여행일의 실제 운항 여부는 예약한 선사와 현장 안내를 확인하세요.
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

        <Section title="이럴 때 활용하세요">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>터미널로 출발하기 전, 예약한 편의 결항·비운항·지연 여부를 다시 확인할 때</li>
            <li>같은 섬으로 가는 여러 편 중 경유 여부와 실제 출발 터미널을 비교할 때</li>
            <li>섬 숙소·렌터카·픽업 시간을 잡기 전에 도착 항구와 귀항편을 함께 확인할 때</li>
            <li>해무·풍랑 등으로 일부 편만 재개됐는지 시간별 상태를 비교할 때</li>
          </ul>
        </Section>

        <Section title="문의·오류 제보">
          <p>
            서비스 이용 문의와 오류 제보는 <a href="mailto:climaxna@naver.com" className="text-blue-600 underline underline-offset-2">climaxna@naver.com</a>으로 보내주세요.
            화면 주소, 확인한 날짜·시각, 항로와 출발 방향, 문제가 보이는 화면을 알려주시면 확인에 도움이 됩니다.
            예약번호·신분증·전화번호 등 개인정보는 가린 뒤 보내주세요.
          </p>
          <p className="mt-2">FerryCast는 승선권 판매처가 아닙니다. 예약 변경·환불과 당일 승선 가능 여부는 구매처 또는 선사에 문의하세요.</p>
        </Section>

        <Section title="광고와 운항 정보">
          <p>지역 업체 배너와 제휴 광고를 게재할 수 있습니다. 광고 게재는 운항 상태 판정과 무관하며, 광고 상품의 예약·결제는 연결된 업체에서 진행합니다. 광고 문의는 같은 이메일로 보내주세요.</p>
        </Section>

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
