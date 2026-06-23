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
// ✅ KMA 격자: 공식 LCC 좌표변환으로 검증 (포항 102,94 / 목포 50,67 / 인천 55,124)
// ✅ KHOA obsCode: obsvtrNm 응답으로 검증 (목포 DT_0007 / 인천 DT_0001, 포항은 전용 관측소 없어 null)
// ✅ seaGrids: getVilageFcst WAV 수신 셀로 검증
// ✅ MTIS depPortKeywords: 3개 지역 모두 실시간(LIVE) 매칭 확인
// ──────────────────────────────────────────────────────────────
export const REGIONS: Record<string, RegionConfig> = {
  pohang: {
    slug: "pohang",
    name: "포항",
    weatherGrid: { nx: 102, ny: 94 },  // 포항시 KMA 격자 (LCC 변환 검증)
    seaGrids: [{ nx: 103, ny: 95 }, { nx: 104, ny: 94 }, { nx: 104, ny: 95 }],  // 동해 WAV 수신 셀(검증)
    tidalObsCode: null,  // 포항 전용 KHOA 관측소 없음 + 동해안 조차 미미 → 조석 비표시
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
    weatherGrid: { nx: 50, ny: 67 },  // 목포시 KMA 격자 (LCC 변환 검증)
    seaGrids: [{ nx: 49, ny: 66 }, { nx: 48, ny: 66 }, { nx: 49, ny: 65 }],  // 다도해 WAV 수신 셀(검증)
    tidalObsCode: "DT_0007",  // 목포 KHOA 관측소 (obsvtrNm="목포" 검증)
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
    weatherGrid: { nx: 55, ny: 124 },  // 인천시 KMA 격자 (검증)
    seaGrids: [{ nx: 54, ny: 123 }, { nx: 52, ny: 123 }, { nx: 51, ny: 123 }],  // 서해 WAV 수신 셀(검증)
    tidalObsCode: "DT_0001",  // 인천 KHOA 관측소 (obsvtrNm="인천" 검증)
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
