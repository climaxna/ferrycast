export interface RouteGroupConfig {
  key: string
  label: string
  depPortKeywords: string[]   // MTIS oport_nm 포함 키워드 (출발편 필터)
  destKeywords: string[]      // MTIS dest_nm 포함 키워드 (출발편 필터)
  islandTerminal?: string     // 도착 탭 — 섬에서 타는 터미널
  fareAdult?: number
  fareUrl?: string
  fallbackDep?: string[]      // API 장애 시 정적 출발 시각
  fallbackArr?: string[]      // API 장애 시 정적 도착 시각
}

export interface RegionConfig {
  slug: string
  name: string
  weatherGrid: { nx: number; ny: number }
  seaGrids: Array<{ nx: number; ny: number }>
  tidalObsCode: string | null   // null이면 조석 섹션 비표시
  mainTerminal: string
  routeGroups: RouteGroupConfig[]
  metaDescription: string
}

// ──────────────────────────────────────────────────────────────
// 지역 설정
// ⚠️ KMA 격자·KHOA obsCode 는 로컬 API 응답 확인 후 보정 필요
// ⚠️ MTIS depPortKeywords 도 실데이터 oport_nm 확인 후 보정 필요
// ──────────────────────────────────────────────────────────────
export const REGIONS: Record<string, RegionConfig> = {
  pohang: {
    slug: "pohang",
    name: "포항",
    weatherGrid: { nx: 102, ny: 81 },
    seaGrids: [{ nx: 102, ny: 80 }, { nx: 103, ny: 80 }, { nx: 101, ny: 80 }],
    tidalObsCode: "DT_0012",  // 포항 KHOA 관측소 — 확인 필요
    mainTerminal: "포항여객터미널",
    routeGroups: [
      {
        key: "ulleungdo",
        label: "울릉도",
        depPortKeywords: ["포항"],
        destKeywords: ["울릉"],
        islandTerminal: "저동항여객터미널",
        fallbackDep: ["10:00"],
        fallbackArr: ["16:00"],
      },
    ],
    metaDescription: "포항 울릉도 여객선 시간표·운항 현황·날씨·조석 예보",
  },

  mokpo: {
    slug: "mokpo",
    name: "목포",
    weatherGrid: { nx: 51, ny: 67 },
    seaGrids: [{ nx: 51, ny: 66 }, { nx: 50, ny: 66 }, { nx: 52, ny: 66 }],
    tidalObsCode: "DT_0025",  // 목포 KHOA 관측소 — 확인 필요
    mainTerminal: "목포여객선터미널",
    routeGroups: [
      {
        key: "heuksando",
        label: "흑산도",
        depPortKeywords: ["목포"],
        destKeywords: ["흑산"],
        islandTerminal: "흑산항여객터미널",
        fallbackDep: ["07:50"],
        fallbackArr: ["13:00"],
      },
      {
        key: "bigeumdo",
        label: "비금·도초도",
        depPortKeywords: ["목포"],
        destKeywords: ["비금", "도초"],
        islandTerminal: "가산항",
        fallbackDep: ["08:00"],
        fallbackArr: ["14:00"],
      },
    ],
    metaDescription: "목포 신안·흑산도 여객선 시간표·운항 현황·날씨·조석 예보",
  },

  incheon: {
    slug: "incheon",
    name: "인천",
    weatherGrid: { nx: 55, ny: 124 },
    seaGrids: [{ nx: 54, ny: 124 }, { nx: 55, ny: 123 }, { nx: 56, ny: 124 }],
    tidalObsCode: "DT_0001",  // 인천 KHOA 관측소 — 확인 필요
    mainTerminal: "인천연안여객터미널",
    routeGroups: [
      {
        key: "baengnyeongdo",
        label: "백령도",
        depPortKeywords: ["인천"],
        destKeywords: ["백령"],
        islandTerminal: "용기포항여객터미널",
        fallbackDep: ["08:00"],
        fallbackArr: ["19:00"],
      },
      {
        key: "yeonpyeongdo",
        label: "연평도",
        depPortKeywords: ["인천"],
        destKeywords: ["연평"],
        islandTerminal: "연평항",
        fallbackDep: ["08:30"],
        fallbackArr: ["14:00"],
      },
    ],
    metaDescription: "인천 백령도·연평도 여객선 시간표·운항 현황·날씨·조석 예보",
  },
}
