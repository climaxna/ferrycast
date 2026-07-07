// 항로 카드·상세의 방향/모드별 색 테마.
// 완도 본섬: 출발=blue / 도착=teal (기존 동작 유지).
// 약산권 섬↔섬: indigo — 완도 노선과 구분되는 "다른 노선망" 신호.
//   포항 KTX 블록이 indigo로 구분되는 것과 같은 시각 언어(사용자 요청). 단 KTX의 indigo→violet
//   크로스-휴 그라디언트는 쓰지 않고 동일 색상 톤(indigo-50→indigo-100)만 사용해 과한 보라 톤을 피한다.
// ⚠️ 클래스는 반드시 리터럴 전체 문자열이어야 Tailwind JIT가 인식한다(동적 조합 금지).
export interface AccentTheme {
  bar: string          // 카드 왼쪽 액센트 바 배경
  hero: string         // 다음 출발 강조 박스 그라디언트 (from-x to-y, 동일 색상 톤)
  label: string        // "출발" 라벨 텍스트색
  time: string         // 큰 시각 텍스트색
  rel: string          // 상대시간 텍스트색
  nextChip: string     // 다음 편 solid 칩 배경 (텍스트 흰색)
  future: string       // 목록 칩(이후 편) 배경+텍스트 (100 계열)
  badgeSoft: string    // 상세 헤더 '운항' 뱃지 (연한 배경+텍스트)
  nextSub: string      // 다음 편 칩 위 보조 텍스트(상대시간)색
  detailFuture: string // 상세 4열 그리드 이후 편 칩 (50 계열)
}

export const ROUTE_THEME: Record<"blue" | "teal" | "indigo", AccentTheme> = {
  blue: {
    bar: "bg-blue-500",
    hero: "from-blue-50 to-sky-50",
    label: "text-blue-500",
    time: "text-blue-800",
    rel: "text-blue-600",
    nextChip: "bg-blue-500",
    future: "bg-blue-100 text-blue-700",
    badgeSoft: "bg-blue-50 text-blue-700",
    nextSub: "text-blue-100",
    detailFuture: "bg-blue-50 text-blue-700",
  },
  teal: {
    bar: "bg-teal-500",
    hero: "from-teal-50 to-teal-100/60",
    label: "text-teal-600",
    time: "text-teal-800",
    rel: "text-teal-600",
    nextChip: "bg-teal-500",
    future: "bg-teal-100 text-teal-700",
    badgeSoft: "bg-teal-50 text-teal-700",
    nextSub: "text-teal-100",
    detailFuture: "bg-teal-50 text-teal-700",
  },
  indigo: {
    bar: "bg-indigo-500",
    hero: "from-indigo-50 to-indigo-100/60",
    label: "text-indigo-500",
    time: "text-indigo-800",
    rel: "text-indigo-600",
    nextChip: "bg-indigo-500",
    future: "bg-indigo-100 text-indigo-700",
    badgeSoft: "bg-indigo-50 text-indigo-700",
    nextSub: "text-indigo-100",
    detailFuture: "bg-indigo-50 text-indigo-700",
  },
}
