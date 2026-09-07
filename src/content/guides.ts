import { REGIONS, type RegionConfig, type RouteGroupConfig } from "@/config/regions"
import { enrichGuide, USAGE_GUIDES } from "./guideEditorial"

// ─────────────────────────────────────────────────────────────────────────
// 항로 가이드(검색 유입용 고정 콘텐츠).
//
// 이 파일은 "○○ 가는 법 / 시간표 / 요금 / 소요시간 / 터미널" 질의에 대응하는
// 정적 페이지(`/guide/[slug]`)의 원천이다. 각 가이드는 항상 실시간 화면(liveHref)으로
// 연결해, 검색 → 가이드 → 실시간 확인 → (지역광고 노출) 흐름을 만든다.
//
// ⚠️ 정확성 원칙: 시간표는 검증된 자료(docs/)가 있는 노선만 timetables에 싣는다.
//    검증 자료가 없는 노선은 시간표를 지어내지 않고, 대표 출발 시각(config fallback)을
//    "참고"로만 표기하고 실제 시각은 실시간 화면·공식 예매로 넘긴다.
// ─────────────────────────────────────────────────────────────────────────

export interface GuideFact {
  label: string
  value: string
}

export interface GuideTimetable {
  title: string        // 예: "하절기 (3.17~9.15)"
  note?: string
  columns: string[]    // 예: ["완도 출발", "청산도 도착"]
  rows: string[][]     // 각 행 = columns 길이의 문자열 배열
}

export interface GuideFaq {
  q: string
  a: string
}

export interface GuideLink {
  label: string
  href: string
}

export interface GuideSection {
  id: string
  title: string
  paragraphs: string[]
  checklist?: string[]
}

export interface Guide {
  slug: string          // 예: "wando-cheongsando"
  regionSlug: string    // "" = 완도(메인), 그 외 REGIONS 키
  regionName: string    // "완도"
  destination: string   // "청산도"
  // config에서 단어만 바꿔 찍어낸 자동 생성 가이드(regionGuidesFrom)인지 여부.
  // 도입문·FAQ 문장이 노선마다 거의 동일해 구글이 "scaled content"(양산형 콘텐츠)로
  // 볼 가능성을 고려한 내부 분류다. 개별 페이지가 애드센스 반려 원인으로 확인된 것은 아니다.
  // → sitemap에서 빼고 페이지에 noindex를 건다. 수기로 보강되면 이 플래그를 지운다.
  thin?: boolean
  kind?: "route" | "usage"
  sections?: GuideSection[]
  sources?: (GuideLink & { note: string })[]
  sourceNote?: string
  title: string         // H1 & <title>
  description: string    // meta description (검색 스니펫)
  keywords: string[]     // 검색 의도 키워드(문장에 자연스럽게 반영)
  liveHref: string       // 실시간 화면 경로 ("/" 또는 "/incheon")
  // 실시간 위젯 매칭용 MTIS 그룹키. 실시간 route.id = `dep-${liveGroupKey}`.
  // 없으면(예: 약산 섬↔섬 집계, 허브 총정리) 인라인 위젯 대신 실시간 화면 링크만 노출.
  liveGroupKey?: string
  updated: string        // 콘텐츠 최신화 시점 "2026-08"
  intro: string[]        // 도입 문단(검색 스니펫·본문)
  facts: GuideFact[]     // 소요시간·선사·터미널·요금 등 요약
  timetables?: GuideTimetable[]
  contacts?: GuideFact[]
  tips?: string[]
  faqs: GuideFaq[]
  bookingUrl?: string
  bookingNote?: string
  relatedGuides?: GuideLink[]  // 허브 총정리 페이지 → 출발지별 상세 가이드 내부 링크
}

const UPDATED = "2026-08"

// ── 완도 — 검증된 상세 가이드 (docs/청산도.md · 소안도.md · 약산.md 기반) ──────────

const WANDO_GUIDES: Guide[] = [
  {
    slug: "wando-cheongsando",
    regionSlug: "",
    regionName: "완도",
    destination: "청산도",
    liveGroupKey: "cheongsando",
    title: "완도 청산도 배편 — 참고 시간표·승선 준비·요금 확인 방법",
    description:
      "완도항에서 청산도 도청항으로 가는 배편의 참고 시간표, 승선 준비, 요금 문의 방법과 매표소 연락처를 안내합니다. 최신 운임표를 제공하는 페이지는 아닙니다.",
    keywords: ["청산도 배편", "완도 청산도 배편", "완도 청산도 배", "청산도 배 시간표", "청산도 여객선", "청산도 가는 법"],
    liveHref: "/",
    updated: UPDATED,
    intro: [
      "청산도행은 완도항 연안여객선터미널에서 출발해 청산도 도청항으로 갑니다. 군청 기본표상 항해시간은 약 50분이며, 실제 편수와 시각은 여행 날짜의 공지와 운항 상태를 확인해야 합니다.",
      "청산도행 배는 여객·차량 증감과 계절에 따라 시간표가 바뀌고, 기상 악화 시 결항될 수 있습니다. 아래 시간표는 연중 기준 참고용이며, 오늘 실제 운항·결항 여부는 FerryCast 실시간 화면에서 확인하세요.",
    ],
    facts: [
      { label: "출발 터미널", value: "완도항 연안여객선터미널" },
      { label: "소요시간", value: "약 50분" },
      { label: "운항 선박", value: "슬로시티청산도호 · 청산아일랜드호 · 퀸청산호(증선)" },
      { label: "기본표 편수", value: "방향별 6편 · 임시표와 당일 운항은 별도 확인" },
      { label: "운영", value: "청산농협선박" },
    ],
    timetables: [
      {
        title: "군청 게시 기본표 — 하절기 (3.17~9.15)",
        note: "2026-09-06 공식 게시 내용과 대조한 참고표입니다. 같은 행은 양방향 출발시각이며 도착시각이 아닙니다. 해당 날짜의 임시 공지를 먼저 확인하세요.",
        columns: ["완도 출발", "청산도 출발"],
        rows: [
          ["07:00", "06:50"],
          ["08:30", "09:00"],
          ["11:00", "11:30"],
          ["13:00", "13:00"],
          ["14:30", "15:00"],
          ["18:00", "18:00"],
        ],
      },
      {
        title: "막배 계절 변동",
        note: "군청 기본표의 완도 출발 마지막 편 비교입니다. 증편·기상·선박 사정에 따른 당일 변경은 포함하지 않습니다.",
        columns: ["기간", "완도발 막배"],
        rows: [
          ["3.17 ~ 9.15 (하절기)", "18:00"],
          ["9.16 ~ 10.15", "17:30"],
          ["10.16 ~ 익년 3.16 (동절기)", "17:00"],
        ],
      },
    ],
    contacts: [
      { label: "완도항", value: "061-552-9385" },
      { label: "청산농협선박", value: "061-552-9388" },
      { label: "네이버밴드", value: "청산도 선박운항시간표" },
    ],
    tips: [
      "차량을 싣는 경우 여객 발권과 차량 접수 절차를 각각 확인하세요. 선적 마감·대기 방법은 해당 날짜의 선사 안내를 따르세요.",
      "도보 여행은 도청항에서 관광지까지의 이동과 귀항 때 항구로 돌아올 방법을 함께 정하세요.",
    ],
    faqs: [
      {
        q: "오늘 청산도 배 뜨나요?",
        a: "완도 화면에서 청산도 편별 상태를 확인하세요. 참고 시간표가 표시되거나 조회가 되지 않으면 현재 운항을 확인하지 못한 상태이므로 선사 공지와 매표소 안내를 확인해야 합니다.",
      },
      {
        q: "완도에서 청산도까지 얼마나 걸리나요?",
        a: "여객선으로 약 50분 걸립니다.",
      },
      {
        q: "청산도 배 요금은 얼마인가요?",
        a: "최신 운임은 이번 확인에서 확보하지 못했습니다. 청산농협(061-552-9388)에 날짜·여객 인원·차종·왕복 여부를 알려 금액을 확인하세요. 여객 운임과 차량 금액, 할증 포함 여부를 구분해서 문의하면 됩니다.",
      },
      { q: "청산도행은 화흥포항에서 타나요?", a: "청산도행은 완도항 연안여객선터미널을 이용합니다. 화흥포항을 이용하는 노화·소안 방면과 구분하고 승선권의 출발 장소를 확인하세요." },
      { q: "기본 시간표와 앱 시각이 다르면 무엇을 확인하나요?", a: "여행 날짜에 적용되는 임시 공지가 있는지 먼저 확인하세요. 기본표는 당일 운항 확정 자료가 아닙니다. 날짜·방향·선박을 맞춰 예약처와 매표소에 확인하세요." },
    ],
    bookingNote: "청산농협선박 061-552-9388 · 완도항 매표소 발권",
  },

  {
    slug: "wando-soan-bogil-nohwa",
    regionSlug: "",
    regionName: "완도",
    destination: "소안도·보길도·노화도",
    liveGroupKey: "hwaheungpo-route",
    title: "완도 소안도·보길도·노화도 배편 — 시간표·요금",
    description:
      "완도 화흥포항에서 노화도(동천)·소안도 가는 배편(여객선) 시간표, 요금, 매표소 연락처. 보길도는 노화도에서 연도교로 연결됩니다. 오늘 운항 여부는 실시간으로 확인하세요.",
    keywords: ["소안도 배편", "보길도 배편", "노화도 배편", "완도 소안도 배", "화흥포 소안도", "보길도 가는 법", "노화도 배 시간표"],
    liveHref: "/",
    updated: UPDATED,
    intro: [
      "소안도·노화도행 여객선은 완도 본항이 아니라 화흥포항에서 출발합니다. 대한호·민국호가 화흥포 → 노화(동천) → 소안도를 잇는 노선으로 하루 12~13항차 운항합니다.",
      "보길도는 노화도와 다리(보길대교)로 연결되어 있어, 배로 노화도에 내린 뒤 차·버스로 이동합니다. 아래는 하절기 대표 시간표이며, 오늘 실제 운항·결항은 FerryCast 실시간 화면에서 확인하세요.",
    ],
    facts: [
      { label: "출발 터미널", value: "화흥포항 (완도 본항 아님)" },
      { label: "경유", value: "화흥포 → 노화(동천) → 소안도" },
      { label: "운항 선박", value: "대한호 · 민국호" },
      { label: "하루 운항", value: "하절기 13항차 / 동절기 12항차" },
      { label: "보길도", value: "노화도에서 보길대교로 연결(차·버스)" },
      { label: "운영", value: "소안농협" },
    ],
    timetables: [
      {
        title: "하절기 (3.1~9.30) 화흥포 출발",
        note: "노화(동천)·소안도 방면 출발 시각입니다.",
        columns: ["화흥포 출발", "소안도 출발"],
        rows: [
          ["06:40", "06:40"],
          ["07:50", "08:00"],
          ["08:50", "09:00"],
          ["09:50", "10:00"],
          ["10:50", "11:00"],
          ["11:50", "12:00"],
          ["12:50", "13:00"],
          ["13:50", "14:00"],
          ["14:50", "15:00"],
          ["15:50", "16:00"],
          ["16:50", "17:00"],
          ["18:20", "18:20"],
          ["21:00", "19:50"],
        ],
      },
    ],
    contacts: [
      { label: "선사 소안농협", value: "061-550-1604" },
      { label: "화흥포 매표소", value: "061-555-1010" },
      { label: "동천 매표소", value: "061-553-5635" },
      { label: "소안 매표소", value: "061-553-8177" },
      { label: "네이버밴드", value: "소안농협 선박시간정보" },
    ],
    tips: [
      "동절기(10.1~2.28)에는 항차·시각이 달라집니다. 출발 전 실시간 화면이나 매표소로 확인하세요.",
      "보길도 윤선도원림·예송리 해변까지 가려면 노화도 하선 후 차량 이동이 필요합니다.",
    ],
    faqs: [
      {
        q: "보길도는 배로 바로 가나요?",
        a: "이 가이드의 화흥포 출발 노선은 노화도 동천항에 내린 뒤 보길대교를 건너 보길도로 이동하는 경로입니다. 도보 승객은 하선 후 이동편도 미리 확인하세요.",
      },
      {
        q: "소안도행 배는 어디서 타나요?",
        a: "완도 본항이 아니라 화흥포항에서 출발합니다. 완도 시내에서 화흥포까지 이동이 필요합니다.",
      },
      {
        q: "오늘 소안도·노화도 배 운항하나요?",
        a: "FerryCast 완도 실시간 화면에서 소안도·보길도·노화 항로의 오늘 운항·결항 상태를 확인할 수 있습니다.",
      },
    ],
    bookingUrl: "https://island.theksa.co.kr",
    bookingNote: "소안농협 061-550-1604 · 화흥포 매표소 061-555-1010",
  },

  {
    slug: "wando-yaksan-islands",
    regionSlug: "",
    regionName: "완도",
    destination: "금일도·생일도 (약산 당목항)",
    title: "약산 당목항 금일도·생일도 배편 — 섬↔섬 시간표",
    description:
      "완도군 약산도 당목항에서 금일도(일정항)·생일도(서성항) 가는 배편(차도선) 시간표와 연락처. 완도 본항을 거치지 않는 섬↔섬 노선입니다.",
    keywords: ["금일도 배편", "생일도 배편", "약산 금일도 배", "당목항 시간표", "생일도 가는 법", "금일도 배 시간표", "약산 당목항 차도선"],
    liveHref: "/",
    updated: UPDATED,
    intro: [
      "약산도(완도군 약산면)는 고금도와 다리로 연결되어 차량으로 들어갈 수 있고, 당목항이 인근 섬으로 가는 환승 거점입니다. 당목항에서 금일도(일정항)·생일도(서성항)로 차도선이 오갑니다.",
      "이 노선은 완도 본항 터미널을 경유하지 않는 섬↔섬 노선이라, FerryCast에서도 완도 출발/도착 탭과 구분해 별도로 표시합니다. 아래는 하절기 대표 시간표입니다.",
    ],
    facts: [
      { label: "출발 터미널", value: "약산도 당목항" },
      { label: "금일도", value: "당목 ↔ 일정항" },
      { label: "생일도", value: "당목 ↔ 서성항" },
      { label: "운항 선박", value: "완농페리 선단 · 풍진메이슨 · 평화페리9호" },
      { label: "운영", value: "완도농협 약산지점" },
    ],
    timetables: [
      {
        title: "약산(당목) → 금일(일정) — 하절기",
        columns: ["당목 출발"],
        rows: [
          ["06:30"], ["07:00"], ["07:40"], ["08:10"], ["08:40"], ["09:10"], ["09:35"],
          ["10:00"], ["10:30"], ["11:00"], ["11:30"], ["12:00"], ["12:30"], ["13:00"],
          ["13:30"], ["14:00"], ["14:30"], ["15:00"], ["15:30"], ["16:00"], ["16:30"],
          ["17:00"], ["17:30"], ["18:00"], ["18:30"], ["19:30"], ["21:00"],
        ],
      },
      {
        title: "약산(당목) → 생일(서성) — 하절기",
        note: "막배는 동절기 17:30 / 하절기 18:00로 계절에 따라 달라집니다.",
        columns: ["당목 출발"],
        rows: [["06:30"], ["08:00"], ["09:40"], ["11:40"], ["13:40"], ["15:40"], ["18:00"]],
      },
    ],
    contacts: [
      { label: "약산농협(당목)", value: "061-553-9088" },
      { label: "당목매표소", value: "061-553-9085" },
      { label: "일정항매표소(금일)", value: "061-555-9595" },
      { label: "네이버밴드", value: "완도농협 약산지점" },
    ],
    tips: [
      "여객·차량 증감에 따라 시간표가 수시로 바뀝니다. 당일 실시간 화면으로 확인하세요.",
      "당목↔녹동(고흥 방면) 배편은 별도 노선입니다.",
    ],
    faqs: [
      {
        q: "금일도·생일도 배는 완도항에서 타나요?",
        a: "아닙니다. 약산도 당목항에서 출발합니다. 약산도는 다리로 연결되어 차량으로 진입할 수 있습니다.",
      },
      {
        q: "오늘 금일도·생일도 배 운항하나요?",
        a: "FerryCast 완도 화면 하단의 약산 섬↔섬 섹션에서 오늘 운항·결항을 실시간으로 확인할 수 있습니다.",
      },
    ],
    bookingNote: "현장 매표소 발권 · 약산농협 061-553-9088",
  },
]

// ── 수기 보강 항로 가이드 ────────────────────────────────────────────────
// config에서 자동 생성한 요약 가이드는 noindex(thin)로 두고, 실제 이용 흐름과 공식
// 출처를 확인해 충분히 작성한 항로만 이 목록에 넣는다. 같은 slug의 자동 생성본은 아래에서 제외한다.
const CURATED_ROUTE_GUIDES: Guide[] = [
  {
    slug: "mokpo-jeju",
    regionSlug: "mokpo",
    regionName: "목포",
    destination: "제주",
    liveGroupKey: "jeju",
    title: "목포 제주 배편 — 출발 터미널·차량 선적·승선 전 확인",
    description: "목포에서 제주로 가는 여객선 이용 전 확인할 출발 장소, 차량 동반 예약, 신분증과 당일 운항 상태를 안내합니다. 고정 시간표 대신 출발일의 공식 운항 안내를 확인하세요.",
    keywords: ["목포 제주 배편", "목포 제주 여객선", "목포 제주 차량선적", "목포항 제주 배", "목포 제주 배편 예약"],
    liveHref: "/mokpo",
    updated: "2026-09",
    intro: [
      "목포 제주 항로는 목포항에서 제주항으로 가는 장거리 카페리 항로입니다. 목포의 도서 항로 터미널이 여러 곳이므로, ‘목포항’이라는 이름만 보고 이동하기보다 예약 확인서에 적힌 승선 장소와 집결 시각을 기준으로 준비해야 합니다.",
      "이 페이지는 고정 시간표나 요금을 대신하지 않습니다. 선박 교체·정비·기상에 따라 운항 계획이 달라질 수 있으므로, 출발일에는 FerryCast의 편별 상태와 예약한 선사의 공지를 함께 확인하세요.",
    ],
    facts: [
      { label: "출발 지역", value: "목포" },
      { label: "출발 장소", value: "목포항국제여객터미널 기준 · 예약 확인서의 부두·집결 안내 우선" },
      { label: "도착 장소", value: "제주항 연안여객터미널 권역 · 선편별 안내 확인" },
      { label: "예약·운항 안내", value: "씨월드고속훼리 공식 채널" },
      { label: "차량 동반", value: "여객 승선과 차량 선적 조건을 각각 확인" },
      { label: "당일 확인", value: "신분증·승선권·운항 상태" },
    ],
    sections: [
      {
        id: "terminal",
        title: "목포에서 어디로 가야 하나요?",
        paragraphs: [
          "목포에는 연안여객선터미널, 북항여객선터미널, 국제여객터미널 등 목적지가 다른 승선 장소가 있습니다. 제주행은 예약한 선편의 안내를 기준으로 목포항국제여객터미널 권역에서 절차가 진행될 수 있으므로, 출발 전에 승선권·문자 안내의 터미널 또는 부두 표기를 다시 확인하세요.",
          "주차·택시·픽업 위치도 승선 장소에 따라 달라집니다. 특히 늦은 시간 또는 이른 시간 출항편은 이동수단의 운행 여부까지 따로 확인하는 편이 안전합니다.",
        ],
        checklist: [
          "예약 확인서의 출발 터미널·부두·집결 시각 확인",
          "승선권과 실물 신분증 준비",
          "터미널 주차 또는 하차 위치를 출발 전 확인",
        ],
      },
      {
        id: "vehicle",
        title: "차를 싣는다면 여객 예약만으로 끝나지 않습니다",
        paragraphs: [
          "차량을 함께 가져가는 경우에는 승객 좌석과 차량 선적이 모두 가능한지 확인해야 합니다. 차량 종류·크기·적재물·운전자 정보에 따라 접수 조건이 달라질 수 있으며, 선적 마감 시각도 여객 승선 절차와 같지 않을 수 있습니다.",
          "차량 예약이 완료됐더라도 출발일에는 선사의 차량 접수 안내와 현장 직원의 유도에 따라야 합니다. 차량 안에 남겨둘 물품과 승선 후 필요한 짐을 미리 나눠 두면 승선 과정이 수월합니다.",
        ],
      },
      {
        id: "sailing-day",
        title: "출발일에는 무엇을 최종 확인하나요?",
        paragraphs: [
          "장거리 항로는 해상 기상과 선박 운항 계획의 영향을 받습니다. FerryCast에서는 목포→제주 편의 운항·결항 상태를 확인할 수 있지만, 최종 승선 가능 여부와 출항 장소·시각은 예약한 선사의 공지가 우선합니다.",
          "출항 시간이 자정을 넘는 편은 달력상 출발일과 터미널에서 수속하는 날짜가 다르게 느껴질 수 있습니다. 예약 화면의 날짜와 집결 시간을 함께 읽고, 혼동되면 선사에 확인하세요.",
        ],
      },
      {
        id: "arrival",
        title: "제주항 도착 뒤 이동도 따로 준비하세요",
        paragraphs: [
          "제주항에 도착한 뒤 숙소·렌터카·시외 이동은 여객선 도착 시각과 분리해서 계획하는 편이 좋습니다. 하선과 차량 하역에 시간이 걸릴 수 있고, 기상이나 항만 사정으로 실제 도착 시각이 달라질 수 있습니다.",
          "제주 도착 뒤의 관광지·항만 주변 이동 정보는 별도입니다. 제주 여행 일정을 확정하기 전에는 귀항편도 함께 확인해 두세요.",
        ],
      },
    ],
    sourceNote: "2026년 9월 기준으로 씨월드고속훼리의 승선 안내와 FerryCast에 수록된 항로 정보를 바탕으로 정리했습니다. 선박·시각·터미널·차량 선적 조건은 수시로 바뀔 수 있으므로 예약한 선사의 최신 안내가 우선합니다.",
    sources: [
      { label: "씨월드고속훼리 여객 이용 안내", href: "https://www.seaferry.kr/bbs/content.php?co_id=p401", note: "승선권·신분증 등 승선 절차 확인" },
      { label: "씨월드고속훼리 공식 홈페이지", href: "https://www.seaferry.co.kr", note: "출발일 운항·예약·차량 선적 조건 확인" },
    ],
    tips: [
      "예매 화면의 선박명·출발 장소·날짜를 캡처해 두면 터미널에서 다시 확인할 때 편합니다.",
      "차량 동반 여행은 차량 선적 가능 여부와 여객 승선권을 한 번에 확인하세요.",
      "결항·지연 가능성을 고려해 제주 도착 직후의 예약은 여유 있게 잡는 편이 좋습니다.",
    ],
    faqs: [
      {
        q: "목포 제주 배는 어디서 타나요?",
        a: "목포항국제여객터미널 권역을 기준으로 안내되지만, 실제 승선 장소·부두는 예약한 선편의 확인서와 선사 공지를 우선해 확인하세요.",
      },
      {
        q: "목포 제주 배편에 차를 싣고 갈 수 있나요?",
        a: "차량 동반 가능 여부와 접수 조건은 선박·날짜·차종에 따라 다릅니다. 여객 예약과 차량 선적 가능 여부를 각각 선사 공식 채널에서 확인하세요.",
      },
      {
        q: "오늘 목포 제주 배가 뜨나요?",
        a: "이 페이지의 실시간 운항 현황과 목포 화면의 제주 항로를 확인하세요. 최종 승선 가능 여부는 예약한 선사의 당일 공지가 우선입니다.",
      },
      {
        q: "목포 제주 배편 출발 시간이 자정을 넘으면 언제 터미널에 가야 하나요?",
        a: "출항 시각만 보지 말고 예약 확인서의 집결·수속 시각을 기준으로 준비하세요. 날짜 혼동이 있으면 선사에 출발일과 집결일을 직접 확인하는 것이 가장 안전합니다.",
      },
    ],
    bookingUrl: "https://www.seaferry.co.kr",
    bookingNote: "선박·객실·차량 선적 가능 여부와 출발일 운항 계획은 씨월드고속훼리 공식 채널에서 최종 확인",
    relatedGuides: [
      { label: "제주도 배편 출발지별 비교 보기", href: "/guide/jeju" },
      { label: "제주항 도착 뒤 관광지 안내 보기", href: "/tour/jeju-port" },
    ],
  },
]

const CURATED_ROUTE_SLUGS = new Set(CURATED_ROUTE_GUIDES.map((guide) => guide.slug))

// ── 타 지역 — config에서 파생한 요약 가이드 (시간표는 지어내지 않음) ────────────────

// 일부 실제 항로는 REGIONS에 두 번 등록된다 — 예: 목포↔제주는 mokpo.routeGroups(제주
// 도착 관점, 목포 탭에서 안 뺀다)와 jeju.routeGroups(제주 허브, 목포 출발 관점) 양쪽에
// 다 있다. 의도적 중복(CLAUDE.md: "완도·목포 탭의 제주는 빼지 않는다")이지만, 가이드까지
// 두 번 만들면 같은 항로가 제목·내용이 겹치는 두 페이지로 색인돼 검색엔진에 중복 콘텐츠로
// 잡힌다. 나중에 생성되는 쪽(허브의 routeGroup)을 건너뛰고, 이미 존재하는 슬러그로 연결한다.
// key: `${허브 config.slug}-${routeGroup.key}` → value: 그 항로의 실제(살아남는) 가이드 슬러그.
const DUPLICATE_ROUTE_SLUGS: Record<string, string> = {
  "jeju-from-mokpo": "mokpo-jeju",
}

function regionGuidesFrom(config: RegionConfig): Guide[] {
  return config.routeGroups
    .filter((g) => {
      const slug = `${config.slug}-${g.key}`
      return !(slug in DUPLICATE_ROUTE_SLUGS) && !CURATED_ROUTE_SLUGS.has(slug)
    })
    .map((g: RouteGroupConfig) => {
    // ⚠️ 방향 주의 — config.inbound(제주·울릉도 허브)는 출발항 여러 곳 → 목적지 1곳이라
    // routeGroup.label이 목적지가 아니라 **출발지**를 뜻한다(config/regions.ts 상단 주석 참고).
    // 이걸 안 뒤집으면 "제주에서 목포 가는 법"처럼 방향이 거꾸로 나온다.
    const origin = config.inbound ? g.label : config.name
    const destination = config.inbound ? config.name : g.label
    const terminal = g.depTerminal ?? config.mainTerminal

    const facts: GuideFact[] = [
      { label: "출발 지역", value: origin },
      { label: "출발 터미널", value: terminal },
    ]
    if (g.islandTerminal) facts.push({ label: "도착 터미널", value: g.islandTerminal })
    if (g.durationMin) {
      const h = Math.floor(g.durationMin / 60)
      const m = g.durationMin % 60
      facts.push({ label: "소요시간", value: h ? (m ? `약 ${h}시간 ${m}분` : `약 ${h}시간`) : `약 ${m}분` })
    }
    const repDep = g.fallbackDep?.length ? g.fallbackDep.join(" · ") : null
    if (repDep) facts.push({ label: "대표 출발시각(참고)", value: repDep })

    return {
      slug: `${config.slug}-${g.key}`,
      regionSlug: config.slug,
      regionName: config.name,
      destination,
      liveGroupKey: g.key,
      title: `${origin} ${destination} 배편 — 시간표·운항 현황`,
      description: `${origin}에서 ${destination} 가는 배편(여객선) 출발 터미널·대표 시간·예매 안내. 오늘 실제 운항·결항 여부는 FerryCast 실시간 화면에서 확인하세요.`,
      keywords: [
        `${origin} ${destination} 배편`,
        `${destination} 배편`,
        `${origin} ${destination} 배`,
        `${destination} 배 시간표`,
        `${destination} 가는 배`,
      ],
      liveHref: `/${config.slug}`,
      updated: UPDATED,
      intro: [
        `${destination}행 여객선은 ${terminal}(${origin})에서 출발합니다. 시간표는 계절·요일·기상에 따라 달라지므로, 아래 대표 정보를 참고하되 오늘 실제 출발 시각과 운항·결항 여부는 FerryCast ${config.name} 실시간 화면에서 확인하세요.`,
        "참고 시간표는 당일 출항을 확정하는 자료가 아닙니다. 조회 지연이나 실패가 있으면 예약한 선사의 공지와 현장 안내를 확인하세요.",
      ],
      facts,
      faqs: [
        {
          q: `오늘 ${origin}-${destination} 배편 뜨나요?`,
          a: `FerryCast ${config.name} 화면에서 ${origin}-${destination} 편별 상태를 확인하세요. 참고 시간표나 조회 실패 상태라면 현재 운항 여부는 선사에 별도로 확인해야 합니다.`,
        },
        {
          q: `${destination} 가는 배는 어디서 타나요?`,
          a: `${origin} ${terminal}에서 출발합니다.`,
        },
        {
          q: `${destination} 배편 예매는 어떻게 하나요?`,
          a: g.fareUrl
            ? "연결된 선사 페이지에서 예약 안내를 확인하세요. 운임 안내만 제공하는 페이지일 수도 있으며, 현장 발권 여부와 실제 판매 가능 편은 해당 선사에 확인해야 합니다."
            : "한국해운조합 승선예약 또는 현장 매표소에서 발권합니다.",
        },
      ],
      bookingUrl: g.fareUrl ?? "https://island.theksa.co.kr/page/booking",
      thin: true,
    } satisfies Guide
  })
}

// ── 목적지 허브(제주·울릉도) 총정리 — "제주도 배편"·"울릉도 배편"처럼 출발지를 특정하지
// 않는 헤드 키워드 전용 페이지. 개별 노선 가이드(jeju-from-mokpo 등)는 "목포 제주 배편"
// 같은 롱테일을 잡고, 이 페이지는 넓은 검색어와 내부 링크(→ 출발지별 상세)를 담당한다.
function hubOverviewGuide(config: RegionConfig, hubKeyword: string, blurb: string): Guide {
  const originLabels = config.routeGroups.map((g) => g.label)
  const durationOf = (min?: number) => {
    if (!min) return null
    const h = Math.floor(min / 60)
    const m = min % 60
    return h ? (m ? `${h}시간 ${m}분` : `${h}시간`) : `${m}분`
  }

  return {
    slug: config.slug,
    regionSlug: config.slug,
    regionName: config.name,
    destination: config.name,
    title: `${hubKeyword} 총정리 — 출발지별 시간표·소요시간 비교`,
    description: `${hubKeyword} 총정리. ${originLabels.join("·")} 출발 ${config.name}행 여객선 시간표·소요시간·운항 현황을 한 화면에서 비교하세요.`,
    keywords: [
      hubKeyword,
      `${config.name} 여객선`,
      `${config.name} 가는 배`,
      ...originLabels.map((o) => `${o} ${config.name} 배편`),
    ],
    liveHref: `/${config.slug}`,
    updated: UPDATED,
    intro: [
      blurb,
      `출발지마다 터미널·소요시간이 달라 아래 표에서 먼저 비교하고, 항로별 상세 시간표는 아래 링크에서 확인하세요. 오늘 실제 운항·결항 여부는 FerryCast ${config.name} 실시간 화면에서 출발지별로 한 번에 볼 수 있습니다.`,
    ],
    facts: [
      { label: "서비스 수록 출발지", value: `${originLabels.length}곳 (${originLabels.join("·")})` },
      { label: "도착 터미널", value: config.mainTerminal },
    ],
    timetables: [
      {
        title: "출발지별 비교",
        note: "서비스에 보관한 항로 정보의 비교표입니다. 상세 가이드도 참고 자료이며, 여행 날짜의 출항·접안 장소와 시각은 예약한 선사의 안내를 확인하세요.",
        columns: ["출발지", "출발 터미널", "소요시간"],
        rows: config.routeGroups.map((g) => [
          g.label,
          g.depTerminal ?? config.mainTerminal,
          durationOf(g.durationMin) ?? "선사 확인 필요",
        ]),
      },
    ],
    faqs: [
      {
        q: `${config.name} 배편은 어디서 탈 수 있나요?`,
        a: `FerryCast는 ${originLabels.join("·")} 출발 정보를 모아 제공합니다. 국내 모든 항로의 목록이나 각 항로의 상시 운항을 뜻하지는 않습니다.`,
      },
      {
        q: `${config.name} 가는 배 중 어느 노선이 제일 빠른가요?`,
        a: "출발지별 소요시간이 크게 다릅니다. 위 비교표에서 소요시간이 짧은 출발지를 확인하세요.",
      },
      {
        q: `오늘 ${config.name} 배 뜨나요?`,
        a: `FerryCast ${config.name} 화면에서 출발지별 편 상태를 확인하세요. 데이터가 없거나 참고 시간표가 표시되는 경우에는 선사 공지로 운항 여부를 확인해야 합니다.`,
      },
    ],
    relatedGuides: config.routeGroups.map((g) => {
      const rawSlug = `${config.slug}-${g.key}`
      const slug = DUPLICATE_ROUTE_SLUGS[rawSlug] ?? rawSlug
      return { label: `${g.label} → ${config.name} 상세 시간표`, href: `/guide/${slug}` }
    }),
  }
}

const HUB_GUIDES: Guide[] = [
  REGIONS.jeju &&
    hubOverviewGuide(
      REGIONS.jeju,
      "제주도 배편",
      "이 가이드는 FerryCast에 수록된 목포·완도·진도·녹동·삼천포 출발 제주행 항로를 비교합니다. 제주 도착 터미널과 부두는 예약한 선편의 안내를 확인하세요.",
    ),
  REGIONS.ulleung &&
    hubOverviewGuide(
      REGIONS.ulleung,
      "울릉도 배편",
      "울릉도行 여객선은 묵호(동해)·강릉·포항·영일만신항에서 출발합니다. 출발항마다 도착하는 울릉도 내 항구(도동·저동·사동)도 달라, 숙소·일정에 맞는 출발지 선택이 중요합니다.",
    ),
].filter((g): g is Guide => Boolean(g))

const REGION_GUIDES: Guide[] = Object.values(REGIONS).flatMap(regionGuidesFrom)

// 허브 총정리(제주도 배편·울릉도 배편)를 해당 지역 목록 맨 앞에 오도록 개별 노선 가이드보다 먼저 둔다.
export const GUIDES: Guide[] = [...USAGE_GUIDES, ...WANDO_GUIDES, ...CURATED_ROUTE_GUIDES, ...HUB_GUIDES, ...REGION_GUIDES].map(enrichGuide)

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

// 지역별 그룹 (가이드 목록 페이지·내부 링크용). 완도 먼저, 그다음 config 순서.
export function guidesByRegion(): Array<{ regionSlug: string; regionName: string; liveHref: string; guides: Guide[] }> {
  const order = ["common", "", ...Object.keys(REGIONS)]
  return order
    .map((rs) => {
      const guides = GUIDES.filter((g) => g.regionSlug === rs && !g.thin)
      if (!guides.length) return null
      return {
        regionSlug: rs,
        regionName: guides[0].regionName,
        liveHref: guides[0].liveHref,
        guides,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
}
