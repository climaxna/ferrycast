import Link from "next/link"

export const metadata = {
  title: "개인정보처리방침 — FerryCast",
  description: "FerryCast 개인정보처리방침",
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
            FerryCast(이하 "서비스")는 완도 여객선 정보·날씨·조석 정보를 제공하는 웹 서비스입니다.
            서비스는 회원가입·로그인·결제 기능이 없으며, 이용자의 개인정보를 직접 수집·저장하지 않습니다.
          </p>
          <p className="mt-2 text-xs text-slate-400">시행일: 2026년 1월 1일</p>
        </div>

        <Section title="1. 수집하는 개인정보">
          <p>서비스는 이용자의 이름·이메일·전화번호·위치 정보 등 개인정보를 직접 수집하지 않습니다.</p>
          <p className="mt-2">다만 아래 제3자 서비스가 서비스 이용 과정에서 쿠키 및 익명 통계 데이터를 수집할 수 있습니다.</p>
        </Section>

        <Section title="2. 제3자 광고 서비스">
          <SubItem title="카카오 AdFit">
            광고 노출 최적화를 위해 카카오가 쿠키·브라우저 정보를 수집할 수 있습니다.
            자세한 내용은 <ExternalLink href="https://www.kakao.com/policy/privacy">카카오 개인정보처리방침</ExternalLink>을 참고하세요.
          </SubItem>
          <SubItem title="쿠팡 파트너스">
            제휴 광고 클릭 추적을 위해 쿠팡이 쿠키를 사용할 수 있습니다.
            자세한 내용은 <ExternalLink href="https://www.coupang.com/np/covs/privacy">쿠팡 개인정보처리방침</ExternalLink>을 참고하세요.
          </SubItem>
        </Section>

        <Section title="3. 방문 통계">
          <p>
            서비스 개선을 위해 Vercel Analytics를 사용하여 익명의 페이지뷰·방문자 통계를 수집합니다.
            특정 개인을 식별할 수 없는 집계 데이터만 사용됩니다.
          </p>
        </Section>

        <Section title="4. 브라우저 알림">
          <p>
            출발 알람 기능 이용 시 브라우저 알림 권한을 요청합니다.
            알림 권한은 언제든지 브라우저 설정에서 철회할 수 있으며, 권한 거부 시 서비스의 나머지 기능은 정상 이용 가능합니다.
          </p>
        </Section>

        <Section title="5. 쿠키">
          <p>
            서비스 자체는 쿠키를 직접 설정하지 않습니다.
            브라우저 설정에서 쿠키를 비활성화할 수 있으나, 일부 광고 기능이 제한될 수 있습니다.
          </p>
        </Section>

        <Section title="6. 문의">
          <p>
            개인정보 관련 문의는 아래로 연락하세요.
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
