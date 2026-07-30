import type { WeatherIconKind } from "@/lib/weather"

// 날씨 아이콘 — 앱 전체가 쓰는 stroke SVG 언어(fill:none + currentColor + strokeWidth 2)로 통일.
// 예전엔 컬러 이모지(☀️🌧️)를 썼는데 파란 히어로 카드 위에서 톤이 튀고,
// OS·폰트마다 모양·크기가 달라 정렬이 흔들렸다. SVG는 currentColor를 따르므로
// 카드(흰색)·상세화면(회색) 어디에 놓아도 주변 텍스트와 같은 색으로 읽힌다.
//
// 종류 판정은 lib/weather.ts의 weatherIconKind()가 단일 소스 — 여기서는 그리기만 한다.
export default function WeatherIcon({
  kind,
  size = 20,
  className = "",
}: {
  kind: WeatherIconKind
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {PATHS[kind]}
    </svg>
  )
}

// 흰 배경(5일 예보 목록)에서 쓸 종류별 색. 파란 히어로 카드 위에서는 text-white를 직접 주므로 불필요.
// 날짜별로 "맑은 날 / 비 오는 날"을 한눈에 훑도록 색을 더한다(모양만으로도 구분되지만 색이 스캔을 돕는다).
export function weatherIconTone(kind: WeatherIconKind): string {
  if (kind === "sun" || kind === "partly") return "text-amber-500"
  if (kind === "cloud" || kind === "fog") return "text-slate-400"
  return "text-blue-500"  // 비·빗방울·비눈·눈
}

// 구름 본체 — 비/눈/안개가 공유 (아래쪽에 강수 표현을 넣을 여유를 둔 형태)
const CLOUD_BODY = <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />

const PATHS: Record<WeatherIconKind, React.ReactNode> = {
  // 맑음 — 원 + 8방향 광선
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </>
  ),
  // 구름많음 — 해가 구름 뒤로 걸친 형태
  partly: (
    <>
      <path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4" />
      <path d="M15.9 12.7a4 4 0 0 0-5.9-4.2" />
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
    </>
  ),
  // 흐림 — 구름만
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z" />,
  // 비 — 긴 빗줄기
  rain: (
    <>
      {CLOUD_BODY}
      <path d="M8 14v6M12 16v6M16 14v6" />
    </>
  ),
  // 빗방울 — 끊긴 짧은 선(약한 비)
  drizzle: (
    <>
      {CLOUD_BODY}
      <path d="M8 14v1M8 19v1M12 16v1M12 21v1M16 14v1M16 19v1" />
    </>
  ),
  // 비/눈 — 빗줄기 + 눈 점 혼합
  sleet: (
    <>
      {CLOUD_BODY}
      <path d="M8 15v3M16 15v3" />
      <path d="M12 17h.01M12 21h.01" />
    </>
  ),
  // 눈 — 점(눈송이)
  snow: (
    <>
      {CLOUD_BODY}
      <path d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01" />
    </>
  ),
  // 안개·기타 — 구름 아래 가로선
  fog: (
    <>
      {CLOUD_BODY}
      <path d="M16 18H7M17 21H9" />
    </>
  ),
}
