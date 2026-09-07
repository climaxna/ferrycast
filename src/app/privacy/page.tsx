import Link from "next/link"

export const metadata = {
  title: "개인정보처리방침 — FerryCast",
  description: "FerryCast 개인정보처리방침",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
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
          <h1 className="text-base font-bold text-slate-900">개인정보처리방침</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm leading-relaxed text-slate-600">
            FerryCast(이하 "서비스")는 여객선 운항 정보와 여행 이용 안내를 제공하는 웹 서비스입니다.
            회원가입·로그인·사이트 내 결제 기능은 없지만, 방문 분석·광고 도구가 정보를 처리할 수 있으며
            이메일 문의 시 발신 주소와 문의 내용이 운영자에게 전달됩니다.
          </p>
          <p className="mt-2 text-xs text-slate-400">최근 수정일: 2026년 9월 8일</p>
        </div>

        <Section title="1. 수집하는 개인정보">
          <p>배편 조회를 위해 이름·전화번호·정밀 위치를 입력할 필요는 없습니다. 문의 메일에 포함된 발신 주소·본문·첨부파일은 문의 대응 과정에서 확인합니다. 불필요한 개인정보는 보내지 마세요.</p>
          <p className="mt-2">접속 과정에서 분석·광고·호스팅 제공자가 페이지 주소, 접속 시각, 브라우저·기기 정보, IP 주소 등 기술 정보를 처리할 수 있습니다. 이를 모두 익명 정보라고 단정하지 않습니다.</p>
        </Section>

        <Section title="2. 제3자 광고 서비스">
          <SubItem title="Google AdSense">
            Google 광고 스크립트가 설치되어 있으며, 실제 광고 게재 여부는 승인·설정에 따라 달라집니다.
            Google을 포함한 제3자 광고 제공업체는 이용자의 이 사이트 및 다른 사이트 방문 기록을 바탕으로
            광고를 제공하기 위해 쿠키를 사용할 수 있습니다. Google의 광고 쿠키를 통해 Google과 광고 파트너가
            이 사이트 및 다른 사이트 방문 기록에 따른 광고를 제공할 수 있으며, 쿠키 등은 광고 측정에도 사용될 수 있습니다.
            <ExternalLink href="https://policies.google.com/technologies/partner-sites?hl=ko">Google의 파트너 사이트 정보 이용 안내</ExternalLink>와{" "}
            <ExternalLink href="https://myadcenter.google.com/">광고 개인 최적화 설정</ExternalLink>을 확인할 수 있습니다.
            Google 외 제3자 광고업체의 쿠키가 사용될 수도 있으며, 해당 업체의 개인정보 안내와 수신 거부 설정을 확인하거나{" "}
            <ExternalLink href="https://optout.aboutads.info/">참여 광고업체의 맞춤 광고 수신 거부 도구</ExternalLink>를 이용할 수 있습니다.
            수신 거부는 해당 도구에 참여하는 업체와 이용 중인 브라우저 등에 따라 적용 범위가 다르며, 모든 광고가 사라지는 것은 아닙니다.
          </SubItem>
          <SubItem title="카카오 AdFit">
            광고 단위가 설정된 경우 카카오 광고가 로드되며, 광고 제공을 위해 쿠키·브라우저 정보를 처리할 수 있습니다.
            자세한 내용은 <ExternalLink href="https://www.kakao.com/policy/privacy">카카오 개인정보처리방침</ExternalLink>을 참고하세요.
          </SubItem>
          <SubItem title="쿠팡 파트너스">
            제휴 광고 클릭 추적을 위해 쿠팡이 쿠키를 사용할 수 있습니다.
            자세한 내용은 <ExternalLink href="https://www.coupang.com/np/covs/privacy">쿠팡 개인정보처리방침</ExternalLink>을 참고하세요.
          </SubItem>
        </Section>

        <Section title="3. 방문 통계">
          <SubItem title="Google Analytics 4">
            방문 페이지와 이용 흐름, 일부 지역 광고 배너 클릭, 앱 설치·실행 이벤트를 분석합니다.
            광고 클릭 이벤트에는 광고 식별자·광고 지역·연결 유형이 포함됩니다.
            Google Analytics는 쿠키 등을 이용할 수 있습니다. 자세한 정보는{" "}
            <ExternalLink href="https://policies.google.com/privacy?hl=ko">Google 개인정보처리방침</ExternalLink>과{" "}
            <ExternalLink href="https://tools.google.com/dlpage/gaoptout?hl=ko">Analytics 수집 거부 도구</ExternalLink>를 참고하세요.
          </SubItem>
          <p>
            Vercel Web Analytics로 페이지뷰·방문 통계를 확인합니다. 이 분석 도구는 쿠키를 사용하지 않는 방식이며,
            사이트 호스팅 과정의 기술 로그 처리와는 구분됩니다. 자세한 내용은{" "}
            <ExternalLink href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics 개인정보 안내</ExternalLink>와{" "}
            <ExternalLink href="https://vercel.com/legal/privacy-notice">Vercel 개인정보처리방침</ExternalLink>을 참고하세요.
          </p>
        </Section>

        <Section title="4. 브라우저 알림">
          <p>
            출발 알람 기능 이용 시 브라우저 알림 권한을 요청합니다.
            알림 권한은 언제든지 브라우저 설정에서 철회할 수 있으며, 권한 거부 시 서비스의 나머지 기능은 정상 이용 가능합니다.
          </p>
        </Section>

        <Section title="5. 쿠키·기기 저장소와 이용자 설정">
          <p>
            앱 설치 안내를 닫은 선택은 기기의 로컬 저장소에 기록합니다. 브라우저에서 사이트 데이터를 삭제하면
            이 선택도 초기화될 수 있습니다. 광고·분석 쿠키는 브라우저 설정에서 삭제하거나 차단할 수 있으며,
            일부 광고·통계 기능이 제한될 수 있습니다. 광고 개인 최적화를 끄는 것과 모든 정보 수집을 중단하는 것은 다릅니다.
          </p>
        </Section>

        <Section title="6. 문의">
          <p>
            문의로 제공한 정보의 열람·정정·삭제 등 개인정보 관련 요청은 아래 이메일로 보내주세요.
            요청 대상과 회신 주소만 알려주시고 신분증 사본 등은 보내지 마세요.
          </p>
          <p className="mt-2">
            이메일:{" "}
            <a href="mailto:climaxna@naver.com" className="text-blue-600 underline underline-offset-2">
              climaxna@naver.com
            </a>
          </p>
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

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-2">
      {children}
    </a>
  )
}
