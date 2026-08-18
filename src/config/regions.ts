export interface RouteGroupConfig {
  key: string
  label: string
  depPortKeywords: string[]   // MTIS oport_nm 포함 키워드 (출발편 필터)
  destKeywords: string[]      // MTIS dest_nm 포함 키워드 (출발편 필터)
  // 순환항로 대응 — oport_nm=dest_nm(=본항)이라 dest로는 목적지를 알 수 없는 노선용.
  // 목적지가 nvg_seawy_nm에만 있다(예: 목포->목포 "목포외달(장좌)" = 외달도행).
  // 지정하면 출발편 매칭이 `dest 일치 OR 항로명 일치`로 넓어져, 같은 섬의 일반편과 한 카드로 합쳐진다.
  // ⚠️ 도착편에는 적용하지 않는다 — 순환항로는 왕복이 한 편이라 도착 탭에 또 실으면 중복이 된다.
  // ⚠️ 다른 그룹의 섬 이름이 항로명에 섞여 있을 수 있으므로(예: "목포가거도(소흑산)"에 '흑산')
  //    꼭 필요한 그룹에만 지정하고, 지정한 그룹을 routeGroups 배열에서 더 앞에 둘 것.
  seawayKeywords?: string[]
  depTerminal?: string        // 이 항로의 본항측 출발 터미널 (없으면 region.mainTerminal). 한 도시 여러 항 대응
  islandTerminal?: string     // 도착 탭 — 섬에서 타는 터미널
  fareUrl?: string
  fallbackDep?: string[]      // API 장애 시 정적 출발 시각
  fallbackArr?: string[]      // API 장애 시 정적 도착 시각
  durationMin?: number        // 예상 소요시간(분) — 있을 때 상세화면에서 도착 예상시각 표시
}

// 섬↔섬/순환 보조 노선 (본항 미경유) — 섬에서 출발해 섬(독도 등)으로 다녀오는 항로.
// 이런 항로는 MTIS에 순환으로 등록돼 oport_nm=dest_nm(=출발섬)이고 목적지 섬은 nvg_seawy_nm
// 에만 있어(예: "울릉저동)-독도"), dest 키워드가 아니라 항로명(seawayKeyword)으로 매칭한다.
export interface IslandHopConfig {
  key: string             // 노선 키 (예: "dokdo")
  label: string           // 카드 도착지 표기 (예: "독도")
  originName: string      // 출발 섬 표기 (예: "울릉도")
  depKeyword: string      // oport_nm 포함 키워드 (예: "울릉")
  seawayKeyword: string   // nvg_seawy_nm 포함 키워드 (예: "독도")
  terminal: string        // 타는 곳 (지도 링크·표시용, 예: "울릉 저동항여객선터미널")
  bookingNote?: string    // 예약 안내 (현장 발권 등) — noBooking 카드로 표시
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
  // 선택: 섬↔섬 보조 노선 섹션 (KTX 아래에 노출, 예: 포항→울릉 페이지의 울릉→독도)
  islandHops?: IslandHopConfig[]
  islandHopTitle?: string   // 섹션 헤더 (예: "독도 여객선")
  islandHopNote?: string    // 섹션 부제
  // 선택: 기차편 섹션 (포항 등 철도 거점 지역). TAGO 열차정보 API 역 노드ID 사용
  train?: {
    stationName: string   // 표시명 (예: "포항역")
    localName: string     // 지역측 역명 (예: "포항")
    localId: string       // TAGO nodeid (예: "NAT8B0351")
    hubName: string       // 상대 역명 (예: "서울")
    hubId: string         // TAGO nodeid (예: "NAT010000")
    fareHint?: number     // 성인 편도 참고 운임
    bookingUrl?: string   // 예매 링크
  }
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
        depTerminal: "포항여객선터미널",        // 구항 (대저페리 엘도라도익스프레스)
        islandTerminal: "울릉도 도동여객선터미널",
        fareUrl: "https://island.theksa.co.kr/page/booking",  // 해운조합 통합 예매
        fallbackDep: ["09:50"],
        fallbackArr: ["14:20"],
        durationMin: 270,  // 09:50→14:20 기준 (4시간 30분)
      },
      {
        key: "ulleung-sadong",
        label: "울릉도(사동)",
        depPortKeywords: ["영일만"],   // MTIS oport_nm="영일만신항"
        destKeywords: ["사동"],        // dest="울릉(사동)"
        depTerminal: "포항항국제여객터미널",      // 영일만항/영일만신항 (울릉크루즈 뉴씨다오펄 카페리)
        islandTerminal: "울릉 사동항여객선터미널",  // 울릉신항
        fareUrl: "https://www.ulcruise.co.kr",   // 울릉크루즈 공식
        fallbackDep: ["23:00"],
        fallbackArr: ["12:20"],
        durationMin: 810,  // 23:00→12:20 야간 기준 (13시간 20분)
      },
    ],
    metaDescription: "포항·영일만항 울릉도(도동·사동) 여객선 시간표·운항 현황·날씨. 울릉도→독도 배편 포함",
    train: {
      stationName: "포항역",
      localName: "포항",
      localId: "NAT8B0351",   // TAGO 검증
      hubName: "서울",
      hubId: "NAT010000",
      fareHint: 53600,
      bookingUrl: "https://www.korail.com/ticket/search/general",  // 신버전 예매 검색 폼(letskorail 레거시 폐지)
    },
    // 울릉도 → 독도 (순환항로 — MTIS oport=dest="울릉(저동/사동)", 독도는 nvg_seawy_nm에만)
    islandHops: [
      {
        key: "dokdo",
        label: "독도",
        originName: "울릉도",
        depKeyword: "울릉",
        seawayKeyword: "독도",
        terminal: "울릉 저동항여객선터미널",
        bookingNote: "현장 매표소·선사 발권 · 기상 영향 커 당일 확인 필수",
      },
    ],
    islandHopTitle: "독도 여객선",
    islandHopNote: "울릉도(저동·사동) 출발 → 독도를 둘러보고 다시 울릉도로 돌아오는 왕복편입니다 (독도는 접안만 해 별도 '독도→울릉' 편은 없음) · 기상 영향이 큽니다",
  },

  mokpo: {
    slug: "mokpo",
    name: "목포",
    weatherGrid: { nx: 50, ny: 67 },  // 목포시 KMA 격자 (LCC 변환 검증)
    seaGrids: [{ nx: 49, ny: 66 }, { nx: 48, ny: 66 }, { nx: 49, ny: 65 }],  // 다도해 WAV 수신 셀(검증)
    tidalObsCode: "DT_0007",  // 목포 KHOA 관측소 (obsvtrNm="목포" 검증)
    mainTerminal: "목포연안여객선터미널",  // 흑산·홍도·가거 등 신안 다도해 출발
    // ⚠️ 목포는 출발 터미널이 3종 — 연안(다도해)/북항(비금·도초 차도선)/국제·삼학부두(제주 대형카페리)
    //    MTIS oport_nm은 대부분 "목포"(+북항)로만 구분되므로 항로별 depTerminal로 보정 (실데이터 검증)
    routeGroups: [
      {
        key: "jeju",
        label: "제주",
        depPortKeywords: ["목포"],
        destKeywords: ["제주"],
        depTerminal: "목포항국제여객터미널",   // 퀸제누비아·퀸메리 대형 카페리 (삼학부두 변동 있음)
        islandTerminal: "제주항 연안여객터미널",
        fareUrl: "https://www.seaferry.co.kr",  // 씨월드고속훼리 공식
        fallbackDep: ["01:00"],
        fallbackArr: ["13:40"],
      },
      {
        key: "hongdo",
        label: "홍도",
        depPortKeywords: ["목포"],
        destKeywords: ["홍도"],
        islandTerminal: "홍도항여객선터미널",
        fareUrl: "https://island.theksa.co.kr/page/booking",
        fallbackDep: ["07:50"],
        fallbackArr: ["13:00"],
      },
      {
        key: "heuksando",
        label: "흑산도",
        depPortKeywords: ["목포"],
        destKeywords: ["흑산"],
        islandTerminal: "흑산항여객선터미널",
        fareUrl: "https://island.theksa.co.kr/page/booking",
        fallbackDep: ["16:00"],
        fallbackArr: ["11:00"],
      },
      {
        key: "bigeum-docho",
        label: "비금·도초도",
        depPortKeywords: ["목포"],
        destKeywords: ["비금", "도초"],
        depTerminal: "목포북항여객선터미널",   // 도초카훼리 등 차도선 주력 (일부 섬사랑선은 연안)
        islandTerminal: "도초 가산항",
        fareUrl: "https://island.theksa.co.kr/page/booking",
        fallbackDep: ["08:35"],
        fallbackArr: ["14:00"],
      },
      {
        key: "gageodo",
        label: "가거도",
        depPortKeywords: ["목포"],
        destKeywords: ["가거"],
        // 뉴엔젤호는 목포->목포 순환으로 등록돼(항로명 "목포가거도(소흑산)") dest로는 안 걸렸다.
        // 그래서 하루 2편인 가거도가 1편만 표시되던 누락을 이 키워드로 해소한다.
        seawayKeywords: ["가거"],
        islandTerminal: "가거도항",
        fareUrl: "https://island.theksa.co.kr/page/booking",
        fallbackDep: ["14:00"],
        fallbackArr: ["07:00"],
      },
      {
        // 목포-달리도-율도-외달도 순회 (신진해운 슬로아일랜드호, 하루 4편, 약 50분).
        // 전 구간이 목포->목포 순환이라 dest로는 전혀 안 잡히던 노선 — 항로명 "목포외달(장좌)"로 매칭.
        // 해수욕장이 있어 목포 시민·관광객 수요가 큰데 그동안 통째로 빠져 있었다.
        key: "oedaldo",
        label: "외달도·달리도",
        depPortKeywords: ["목포"],
        destKeywords: ["외달"],
        seawayKeywords: ["외달"],
        islandTerminal: "외달도 선착장",
        fareUrl: "https://island.theksa.co.kr/page/booking",
        fallbackDep: ["07:00", "10:30", "13:30", "16:30"],
        durationMin: 50,
      },
    ],
    // 신안 생활 항로 — 관광 섬(위 목록)과 목적이 달라 광고 아래 별도 섹션으로 분리한다.
    // 대부분 순환이거나 경유가 많아 목적지를 항로명으로만 알 수 있다.
    islandHops: [
      {
        key: "jangsan-haui",
        label: "장산·하의·신의(웅곡)",
        originName: "목포",
        depKeyword: "목포",
        seawayKeyword: "웅곡",
        terminal: "목포연안여객선터미널",
      },
      {
        key: "sangtaedo",
        label: "상태도(동리)",
        originName: "목포",
        depKeyword: "목포",
        seawayKeyword: "동리",
        terminal: "목포연안여객선터미널",
      },
      {
        key: "seogeocha",
        label: "율목·서거차",
        originName: "목포",
        depKeyword: "목포",
        seawayKeyword: "서거차",
        terminal: "목포연안여객선터미널",
      },
    ],
    islandHopTitle: "신안·진도 생활 항로",
    islandHopNote: "섬 주민이 주로 이용하는 노선입니다. 경유지가 많고 편수가 적어 출발 전 확인을 권합니다.",
    metaDescription: "목포 제주·홍도·흑산도·비금도초·가거도·외달도 여객선 시간표·운항 현황·날씨·조석 예보",
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
      // 연평도는 순환항로(oport=dest="인천", 목적지가 nvg_seawy_nm에만 존재)라 destKeywords로는
      // 영영 안 잡힌다 → 정적 fallback만 노출돼 결항이 나도 "운항"으로 보이는 상태였다.
      // islandHops(항로명 매칭)로 옮겨 실시간화함. 여기에 되돌리지 말 것.
      {
        // 덕적도 — 인천연안여객터미널 출발. MTIS dest_nm="덕적" (직항 + 자월·승봉·이작 경유 혼재)
        key: "deokjeokdo",
        label: "덕적도",
        depPortKeywords: ["인천"],
        destKeywords: ["덕적"],
        islandTerminal: "덕적도여객선터미널",
        fallbackDep: ["08:00", "14:30"],
        fallbackArr: ["09:30", "16:00"],
      },
      {
        // 대이작도 — 항로 "인팔-자-승-이"(인천·팔미도·자월·승봉·이작). MTIS dest_nm="대이작"
        key: "daeijakdo",
        label: "대이작도",
        depPortKeywords: ["인천"],
        destKeywords: ["대이작"],
        islandTerminal: "대이작도 선착장",
        fallbackDep: ["07:50", "08:30"],
        fallbackArr: ["14:30", "15:10"],
      },
    ],
    // 본항(인천연안여객터미널) 직항 목록에 안 잡히는 항로들 — 광고 아래 별도 섹션.
    //  · 장봉도: 출발항이 삼목항(영종도)이라 depPortKeywords "인천"에 안 걸린다. 하루 14편으로 인천 최다
    //  · 연평·굴업·풍도: 순환항로(oport=dest="인천") — 목적지가 nvg_seawy_nm에만 있다
    //  · 울도: 덕적도 진리항 출발 섬↔섬 (덕적군도 내부 항로)
    // 항로명은 날짜에 따라 바뀌므로(예: "인천굴업(홀수일)"/"(짝수일)") 섬 이름만 키워드로 쓴다.
    islandHops: [
      {
        key: "jangbongdo",
        label: "장봉도",
        originName: "영종도 삼목항",
        depKeyword: "삼목",
        seawayKeyword: "장봉",
        terminal: "삼목여객터미널",
      },
      {
        // 돌아오는 편 — islandHops는 도착 탭에 안 실려서, 별도 카드로 넣어야 왕복이 보인다
        key: "jangbongdo-return",
        label: "삼목항(영종도)",
        originName: "장봉도",
        depKeyword: "장봉",
        seawayKeyword: "삼목",
        terminal: "장봉도 옹암선착장",
      },
      {
        key: "yeonpyeongdo",
        label: "연평도",
        originName: "인천",
        depKeyword: "인천",
        seawayKeyword: "연평",  // "인천연평(순환)" + "인천대연평-소연평(순환)" 모두 매칭
        terminal: "인천연안여객터미널",
      },
      {
        key: "gulupdo",
        label: "굴업도",
        originName: "인천",
        depKeyword: "인천",
        seawayKeyword: "굴업",
        terminal: "인천연안여객터미널",
      },
      {
        key: "pungdo",
        label: "풍도",
        originName: "인천",
        depKeyword: "인천",
        seawayKeyword: "풍도",  // 홀수일 "인천풍도-대부" / 짝수일 "인천대부-풍도"
        terminal: "인천연안여객터미널",
      },
      {
        key: "uldo",
        label: "울도",
        originName: "덕적도 진리항",
        depKeyword: "진리",
        seawayKeyword: "울도",
        terminal: "덕적도 진리항",
      },
    ],
    islandHopTitle: "그 밖의 인천 섬 배편",
    islandHopNote: "출발 항구가 다르거나 순환 항로로 운항하는 배편입니다. 격일 운항이 있어 출발 전 확인을 권합니다.",
    metaDescription: "인천 백령도·연평도·덕적도·대이작도·장봉도·굴업도·풍도 여객선 시간표·운항 현황·날씨·조석 예보",
  },
}
