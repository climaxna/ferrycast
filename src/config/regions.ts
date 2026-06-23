export interface RouteGroupConfig {
  key: string
  label: string
  depPortKeywords: string[]   // MTIS oport_nm 포함 키워드 (출발편 필터)
  destKeywords: string[]      // MTIS dest_nm 포함 키워드 (출발편 필터)
  depTerminal?: string        // 이 항로의 본항측 출발 터미널 (없으면 region.mainTerminal). 한 도시 여러 항 대응
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
    mainTerminal: "포항여객선터미널",
    // ⚠️ 포항권은 출발항이 둘 — MTIS oport_nm: "포항"(주간 도동) / "영일만신항"(야간 사동)
    //    "영일만신항"은 "포항"을 include 하지 않으므로 반드시 별도 그룹으로 잡아야 야간편이 누락되지 않음 (실데이터 검증)
    routeGroups: [
      {
        key: "ulleung-dodong",
        label: "울릉도(도동)",
        depPortKeywords: ["포항"],
        destKeywords: ["울릉"],   // "포항"발은 dest="울릉" — 영일만발(dest="울릉(사동)")은 dep 불일치로 안 걸림
        depTerminal: "포항여객선터미널",
        islandTerminal: "울릉도 도동여객선터미널",
        fallbackDep: ["09:50"],
        fallbackArr: ["14:20"],
      },
      {
        key: "ulleung-sadong",
        label: "울릉도(사동)",
        depPortKeywords: ["영일만"],   // MTIS oport_nm="영일만신항"
        destKeywords: ["사동"],        // dest="울릉(사동)"
        depTerminal: "포항 영일만항여객터미널",
        islandTerminal: "울릉 사동항",
        fallbackDep: ["23:00"],
        fallbackArr: ["12:20"],
      },
    ],
    metaDescription: "포항·영일만항 울릉도(도동·사동) 여객선 시간표·운항 현황·날씨",
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
