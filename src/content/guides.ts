import { REGIONS, type RegionConfig, type RouteGroupConfig } from "@/config/regions"

// ─────────────────────────────────────────────────────────────────────────
// 항로 가이드(검색 유입용 고정 콘텐츠).
//
// FerryCast 본 화면은 100% 실시간 앱이라 검색엔진이 색인해 순위를 매길 "고정 텍스트"가
// 거의 없다. 이 파일은 "○○ 가는 법 / 시간표 / 요금 / 소요시간 / 터미널" 질의에 대응하는
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

export interface Guide {
  slug: string          // 예: "wando-cheongsando"
  regionSlug: string    // "" = 완도(메인), 그 외 REGIONS 키
  regionName: string    // "완도"
  destination: string   // "청산도"
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
    title: "완도 청산도 배편 — 시간표·요금·소요시간",
    description:
      "완도항에서 청산도(슬로시티) 가는 배편(여객선) 시간표, 요금, 소요시간(약 50분), 매표소 연락처 안내. 오늘 운항·결항 여부는 실시간으로 확인하세요.",
    keywords: ["청산도 배편", "완도 청산도 배편", "완도 청산도 배", "청산도 배 시간표", "청산도 여객선", "청산도 가는 법"],
    liveHref: "/",
    updated: UPDATED,
    intro: [
      "청산도는 완도항에서 여객선으로 약 50분 거리에 있는 슬로시티입니다. 슬로시티청산도호·청산아일랜드호·퀸청산호가 하루 6항차(성수기 증편) 운항하며, 완도항 연안여객선터미널에서 출발합니다.",
      "청산도행 배는 여객·차량 증감과 계절에 따라 시간표가 바뀌고, 기상 악화 시 결항될 수 있습니다. 아래 시간표는 연중 기준 참고용이며, 오늘 실제 운항·결항 여부는 FerryCast 실시간 화면에서 확인하세요.",
    ],
    facts: [
      { label: "출발 터미널", value: "완도항 연안여객선터미널" },
      { label: "소요시간", value: "약 50분" },
      { label: "운항 선박", value: "슬로시티청산도호 · 청산아일랜드호 · 퀸청산호(증선)" },
      { label: "하루 운항", value: "6항차 기준 (성수기 증편)" },
      { label: "운영", value: "청산농협선박" },
    ],
    timetables: [
      {
        title: "하절기 (3.17~9.15)",
        note: "연중 기준 대표 시간표입니다. 성수기·주말에는 항차가 늘어날 수 있습니다.",
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
        note: "막배 시각만 계절에 따라 달라집니다.",
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
      "차량을 싣는 경우 예약·발권 마감이 이르니 출발 30분 전에는 터미널에 도착하세요.",
      "슬로시티 특성상 섬 내 이동은 도보·자전거·마을버스 위주입니다.",
    ],
    faqs: [
      {
        q: "오늘 청산도 배 뜨나요?",
        a: "기상에 따라 당일 결항될 수 있습니다. FerryCast 완도 실시간 화면에서 오늘 청산도 항로의 운항·결항 상태를 바로 확인할 수 있습니다.",
      },
      {
        q: "완도에서 청산도까지 얼마나 걸리나요?",
        a: "여객선으로 약 50분 걸립니다.",
      },
      {
        q: "청산도 배 요금은 얼마인가요?",
        a: "요금은 선사·차량 여부에 따라 다릅니다. 청산농협(061-552-9388) 또는 공식 요금 페이지에서 확인하세요.",
      },
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
        a: "보길도 직항은 없습니다. 화흥포에서 노화도로 배를 타고 간 뒤, 노화도와 보길도를 잇는 보길대교를 차·버스로 건너갑니다.",
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
      "약산도(완도군 약산면)는 본섬과 약산연도교로 연결되어 차량으로 들어갈 수 있고, 당목항이 인근 섬으로 가는 환승 거점입니다. 당목항에서 금일도(일정항)·생일도(서성항)로 차도선이 오갑니다.",
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
    .filter((g) => !(`${config.slug}-${g.key}` in DUPLICATE_ROUTE_SLUGS))
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
        "기상 악화·조류 등으로 예고 없이 결항될 수 있으니, 출발 전 공식 예매처나 실시간 화면에서 반드시 최종 확인하시기 바랍니다.",
      ],
      facts,
      faqs: [
        {
          q: `오늘 ${origin}-${destination} 배편 뜨나요?`,
          a: `FerryCast ${config.name} 실시간 화면에서 ${origin}-${destination} 항로의 오늘 운항·결항 상태를 바로 확인할 수 있습니다.`,
        },
        {
          q: `${destination} 가는 배는 어디서 타나요?`,
          a: `${origin} ${terminal}에서 출발합니다.`,
        },
        {
          q: `${destination} 배편 예매는 어떻게 하나요?`,
          a: g.fareUrl
            ? "공식 예매 페이지에서 좌석·요금을 확인하고 예약할 수 있습니다. 일부 노선은 현장 매표소 발권만 가능합니다."
            : "한국해운조합 승선예약 또는 현장 매표소에서 발권합니다.",
        },
      ],
      bookingUrl: g.fareUrl ?? "https://island.theksa.co.kr/page/booking",
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
      { label: "출발지 수", value: `${originLabels.length}곳 (${originLabels.join("·")})` },
      { label: "도착 터미널", value: config.mainTerminal },
    ],
    timetables: [
      {
        title: "출발지별 비교",
        note: "실제 출발 시각·오늘 운항 여부는 각 출발지 상세 가이드 또는 실시간 화면에서 확인하세요.",
        columns: ["출발지", "출발 터미널", "소요시간"],
        rows: config.routeGroups.map((g) => [
          g.label,
          g.depTerminal ?? config.mainTerminal,
          durationOf(g.durationMin) ?? "실시간 확인",
        ]),
      },
    ],
    faqs: [
      {
        q: `${config.name} 배편은 어디서 탈 수 있나요?`,
        a: `${originLabels.join("·")} 등 ${originLabels.length}곳에서 출발합니다. 출발지별 터미널·소요시간은 위 표를 참고하세요.`,
      },
      {
        q: `${config.name} 가는 배 중 어느 노선이 제일 빠른가요?`,
        a: "출발지별 소요시간이 크게 다릅니다. 위 비교표에서 소요시간이 짧은 출발지를 확인하세요.",
      },
      {
        q: `오늘 ${config.name} 배 뜨나요?`,
        a: `FerryCast ${config.name} 실시간 화면에서 출발지별 오늘 운항·결항 상태를 한 번에 확인할 수 있습니다.`,
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
      "제주도行 여객선은 목포·완도·진도·녹동·삼천포 등 전국 여러 항구에서 출발합니다. 어느 항구에서 타든 도착은 제주항이지만, 출발지에 따라 소요시간과 운임이 크게 다릅니다.",
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
export const GUIDES: Guide[] = [...WANDO_GUIDES, ...HUB_GUIDES, ...REGION_GUIDES]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

// 지역별 그룹 (가이드 목록 페이지·내부 링크용). 완도 먼저, 그다음 config 순서.
export function guidesByRegion(): Array<{ regionSlug: string; regionName: string; liveHref: string; guides: Guide[] }> {
  const order = ["", ...Object.keys(REGIONS)]
  return order
    .map((rs) => {
      const guides = GUIDES.filter((g) => g.regionSlug === rs)
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
