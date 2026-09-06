export type TourPlace = {
  name: string
  category: string
  description: string
  mapQuery: string
  officialHref: string
}

export type TourGuide = {
  slug: string
  region: string
  title: string
  description: string
  arrivalPort: string
  intro: string
  sourceNote: string
  updated: string
  sourceLabel: string
  officialHref: string
  ferryGuideHref: string
  ferryGuideLabel: string
  places: TourPlace[]
}

// 관광지 설명은 완도문화관광이 안내한 명칭과 범위만 정리한다.
// 운영시간·요금·교통편처럼 수시로 달라지는 정보는 이 목록에 고정하지 않는다.
export const TOUR_GUIDES: TourGuide[] = [
  {
    slug: "cheongsando",
    region: "청산도",
    title: "청산도 주요 관광지 — 도청항에서 확인하는 5곳",
    description: "청산도 도청항에 도착한 뒤 찾아볼 수 있는 서편제 촬영지, 봄의 왈츠 촬영지, 범바위, 상서마을 옛담장, 신흥리해수욕장을 공식 관광 안내 기준으로 정리했습니다.",
    arrivalPort: "도청항",
    intro: "청산도행 여객선은 도청항을 기준으로 도착합니다. 아래 장소는 완도문화관광이 청산권 주요 관광지로 소개한 곳입니다. 섬 안 이동 시간, 운영 여부, 주차·입장 조건은 방문일에 공식 안내 또는 현지 운영처에 확인하세요.",
    sourceNote: "2026-09-07 작성. 관광지 명칭과 소개 범위는 완도문화관광의 청산도·청산권 안내를 바탕으로 정리했습니다. 지도 링크는 장소를 찾기 위한 검색 링크이며, 정확한 위치·운영 정보는 연결된 공식 안내를 확인하세요.",
    updated: "2026-09-07",
    sourceLabel: "완도문화관광",
    officialHref: "https://www.wando.go.kr/tour/sub.cs?m=106",
    ferryGuideHref: "/guide/wando-cheongsando",
    ferryGuideLabel: "청산도 배편·승선 안내 보기",
    places: [
      {
        name: "서편제 촬영지",
        category: "촬영지 · 슬로길 풍경",
        description: "영화 ‘서편제’의 장면이 촬영된 곳으로, 황토길과 주변 풍경을 함께 볼 수 있는 청산도의 대표 촬영지입니다.",
        mapQuery: "청산도 서편제 촬영지",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=106",
      },
      {
        name: "봄의 왈츠 촬영지",
        category: "촬영지 · 들판 풍경",
        description: "드라마 ‘봄의 왈츠’ 촬영지로 소개된 장소입니다. 바닷가 언덕의 오픈세트장과 주변 돌담길 풍경을 함께 볼 수 있습니다.",
        mapQuery: "청산도 봄의 왈츠 촬영지",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=106",
      },
      {
        name: "범바위",
        category: "자연 경관",
        description: "완도문화관광이 청산권 주요 관광지로 안내하는 바위 경관입니다. 이동·탐방 여건은 날씨와 현장 안내를 먼저 확인하세요.",
        mapQuery: "청산도 범바위",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=17&startPage=1&tCimThemeAreaCode=Z004",
      },
      {
        name: "상서마을 옛담장",
        category: "마을 · 돌담길",
        description: "상서리와 동촌리를 지나는 돌담 풍경으로 소개되는 마을 길입니다. 생활 공간이므로 주민과 차량 통행에 유의해 둘러보세요.",
        mapQuery: "청산도 상서마을 옛담장",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=106",
      },
      {
        name: "신흥리해수욕장",
        category: "해변",
        description: "완도문화관광이 청산권 주요 관광지로 안내하는 해변입니다. 개장·안전요원·편의시설 운영 여부는 계절과 방문일에 따라 확인하세요.",
        mapQuery: "청산도 신흥리해수욕장",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=17&startPage=1&tCimThemeAreaCode=Z004",
      },
    ],
  },
  {
    slug: "bogildo",
    region: "보길도",
    title: "보길도 주요 관광지 — 동천항에서 이어지는 4곳",
    description: "동천항에 도착한 뒤 보길대교를 건너 찾아볼 수 있는 보길도 윤선도 원림, 예송리해수욕장, 통리해수욕장, 망끝전망대를 완도문화관광 안내 기준으로 정리했습니다.",
    arrivalPort: "동천항",
    intro: "화흥포항 출발편은 노화도 동천항에 도착합니다. 보길도는 동천항에서 보길대교를 건너 이동합니다. 아래 장소는 완도문화관광의 보길도 당일코스에 소개된 곳이며, 섬 안 이동 시간과 운영 여부는 방문일에 확인하세요.",
    sourceNote: "2026-09-07 작성. 관광지 명칭과 소개 범위는 완도문화관광의 보길도 당일코스와 보길도 윤선도 원림 안내를 바탕으로 정리했습니다. 지도 링크는 장소를 찾기 위한 검색 링크이며, 정확한 위치·운영 정보는 연결된 공식 안내를 확인하세요.",
    updated: "2026-09-07",
    sourceLabel: "완도문화관광",
    officialHref: "https://www.wando.go.kr/tour/sub.cs?m=105",
    ferryGuideHref: "/guide/wando-soan-bogil-nohwa",
    ferryGuideLabel: "화흥포·보길도 배편·승선 안내 보기",
    places: [
      {
        name: "보길도 윤선도 원림",
        category: "역사 · 정원",
        description: "고산 윤선도의 생활·창작 공간으로 소개되는 부용동 정원입니다. 낙서재, 세연정, 동천석실 등으로 이어지는 조선시대 별서정원의 구성을 볼 수 있습니다.",
        mapQuery: "보길도 윤선도 원림",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=30",
      },
      {
        name: "예송리해수욕장",
        category: "해변 · 상록수림",
        description: "완도문화관광 보길도 코스에 소개된 해변입니다. 해변 뒤편의 상록수림과 주변 섬 풍경을 함께 볼 수 있는 곳으로 안내됩니다.",
        mapQuery: "보길도 예송리해수욕장",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=105",
      },
      {
        name: "통리해수욕장",
        category: "해변 · 바다 풍경",
        description: "보길도 당일코스에 포함된 해변입니다. 앞바다의 여러 섬과 해변 풍경을 볼 수 있는 장소로 소개됩니다.",
        mapQuery: "보길도 통리해수욕장",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=105",
      },
      {
        name: "망끝전망대",
        category: "전망 · 해안 경관",
        description: "보길도 서쪽 망월봉 끝자락에 자리한 전망대입니다. 다도해 섬과 바다를 조망하는 장소로 완도문화관광이 안내합니다.",
        mapQuery: "보길도 망끝전망대",
        officialHref: "https://www.wando.go.kr/tour/sub.cs?m=105",
      },
    ],
  },
  {
    slug: "hongdo",
    region: "홍도",
    title: "홍도 주요 관광지 — 홍도항 도착 뒤 확인하는 3곳",
    description: "홍도항에 도착한 뒤 찾아볼 수 있는 홍도 해상관광, 깃대봉, 홍도 전망대를 한국관광공사 안내 기준으로 정리했습니다.",
    arrivalPort: "홍도항",
    intro: "목포 출발편은 홍도항에 도착합니다. 홍도는 섬 전체가 천연보호구역으로 지정된 지역입니다. 아래 장소는 한국관광공사 안내에 소개된 곳이며, 탐방·유람선 운영 여부와 현장 규정은 방문일에 확인하세요.",
    sourceNote: "2026-09-07 작성. 관광지 명칭과 소개 범위는 한국관광공사 대한민국 구석구석의 홍도 안내를 바탕으로 정리했습니다. 지도 링크는 장소를 찾기 위한 검색 링크이며, 정확한 위치·운영 정보는 연결된 안내와 현지 운영처를 확인하세요.",
    updated: "2026-09-07",
    sourceLabel: "한국관광공사 홍도 공식 안내",
    officialHref: "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=857fd91d-1c56-4581-8631-edd47e6bd318",
    ferryGuideHref: "/guide/mokpo-hongdo",
    ferryGuideLabel: "목포·홍도 배편·승선 안내 보기",
    places: [
      {
        name: "홍도 해상관광",
        category: "유람선 · 해안 경관",
        description: "홍도의 해안 절벽과 주변 섬 풍경을 배 위에서 보는 관광 방식입니다. 운항 여부와 승선 조건은 해상 상황 및 현지 유람선 안내를 확인하세요.",
        mapQuery: "홍도 유람선 관광",
        officialHref: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=f6f1db28-c2a3-42b5-bca7-95e393130ef2",
      },
      {
        name: "깃대봉",
        category: "탐방 · 정상 경관",
        description: "홍도의 주봉으로 소개되는 곳입니다. 정상에서는 주변 능선과 섬 풍경을 볼 수 있으며, 탐방 전 날씨와 현장 통제 여부를 확인하는 것이 좋습니다.",
        mapQuery: "홍도 깃대봉",
        officialHref: "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=857fd91d-1c56-4581-8631-edd47e6bd318",
      },
      {
        name: "홍도 전망대",
        category: "전망 · 섬 풍경",
        description: "한국관광공사 홍도 안내에서 깃대봉 탐방로와 함께 소개된 전망 장소입니다. 이동 여건과 이용 가능 구간은 현지 안내를 확인하세요.",
        mapQuery: "홍도 전망대",
        officialHref: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=f6f1db28-c2a3-42b5-bca7-95e393130ef2",
      },
    ],
  },
  {
    slug: "heuksando",
    region: "흑산도",
    title: "흑산도 주요 관광지 — 흑산도항 도착 뒤 확인하는 4곳",
    description: "흑산도항에 도착한 뒤 찾아볼 수 있는 흑산도 일주도로, 상라봉 전망대, 자산문화원, 배낭기미해수욕장을 한국관광공사 안내 기준으로 정리했습니다.",
    arrivalPort: "흑산도항",
    intro: "목포 출발편은 흑산도항에 도착합니다. 흑산도 안 관광지는 항구에서 떨어진 곳도 있어 섬 안 이동을 따로 계획하는 편이 좋습니다. 아래 장소는 한국관광공사 안내에 소개된 곳이며, 도로·탐방 여건과 운영 여부는 방문일에 확인하세요.",
    sourceNote: "2026-09-07 작성. 관광지 명칭과 소개 범위는 한국관광공사 대한민국 구석구석의 흑산도 안내를 바탕으로 정리했습니다. 지도 링크는 장소를 찾기 위한 검색 링크이며, 정확한 위치·운영 정보는 연결된 안내와 현지 운영처를 확인하세요.",
    updated: "2026-09-07",
    sourceLabel: "한국관광공사 흑산도 공식 안내",
    officialHref: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=7acc69af-7a3b-47d9-9ddc-1c22a358ae28",
    ferryGuideHref: "/guide/mokpo-heuksando",
    ferryGuideLabel: "목포·흑산도 배편·승선 안내 보기",
    places: [
      {
        name: "흑산도 일주도로",
        category: "드라이브 · 해안 경관",
        description: "해안을 따라 섬을 둘러볼 수 있는 도로입니다. 전망 장소와 굽이진 구간이 이어져 있어 이동 수단과 당일 도로 여건을 먼저 확인하는 것이 좋습니다.",
        mapQuery: "흑산도 일주도로",
        officialHref: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=7acc69af-7a3b-47d9-9ddc-1c22a358ae28",
      },
      {
        name: "상라봉 전망대",
        category: "전망 · 섬 풍경",
        description: "상라산 일대의 전망 장소로 소개됩니다. 흑산도항과 주변 섬 풍경을 볼 수 있으며, 탐방 전 날씨와 현장 통제 여부를 확인하세요.",
        mapQuery: "흑산도 상라봉 전망대",
        officialHref: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=7acc69af-7a3b-47d9-9ddc-1c22a358ae28",
      },
      {
        name: "자산문화원",
        category: "문화 · 자산어보",
        description: "정약전의 흑산도 유배 생활과 『자산어보』 관련 자료를 소개하는 곳으로 안내됩니다. 전시 운영 여부는 방문 전에 확인하세요.",
        mapQuery: "흑산도 자산문화원",
        officialHref: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=7acc69af-7a3b-47d9-9ddc-1c22a358ae28",
      },
      {
        name: "배낭기미해수욕장",
        category: "해변 · 휴식",
        description: "한국관광공사 흑산도 안내에서 대표 해수욕장으로 소개된 곳입니다. 계절별 개장·안전·편의시설 운영 여부는 현지 안내를 확인하세요.",
        mapQuery: "흑산도 배낭기미해수욕장",
        officialHref: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=7acc69af-7a3b-47d9-9ddc-1c22a358ae28",
      },
    ],
  },
  {
    slug: "gageodo",
    region: "가거도",
    title: "가거도 주요 관광지 — 가거도항 도착 뒤 확인하는 4곳",
    description: "가거도항에 도착한 뒤 찾아볼 수 있는 독실산, 섬등반도, 가거도 등대, 회룡산을 한국관광공사 안내 기준으로 정리했습니다.",
    arrivalPort: "가거도항",
    intro: "목포 출발편은 가거도항에 도착합니다. 가거도는 산지와 해안 절벽 지형이 이어져 섬 안 이동을 별도로 계획해야 합니다. 아래 장소는 한국관광공사 안내에 소개된 곳이며, 탐방로·도로·운영 여건은 방문일에 확인하세요.",
    sourceNote: "2026-09-07 작성. 관광지 명칭과 소개 범위는 한국관광공사 대한민국 구석구석의 가거도 안내를 바탕으로 정리했습니다. 지도 링크는 장소를 찾기 위한 검색 링크이며, 정확한 위치·운영 정보는 연결된 안내와 현지 운영처를 확인하세요.",
    updated: "2026-09-07",
    sourceLabel: "한국관광공사 가거도 공식 안내",
    officialHref: "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=47836660-7194-498c-90a6-f8bfa9662b3c",
    ferryGuideHref: "/guide/mokpo-gageodo",
    ferryGuideLabel: "목포·가거도 배편·승선 안내 보기",
    places: [
      {
        name: "독실산",
        category: "탐방 · 산악 경관",
        description: "가거도 중앙에 솟은 산으로 소개됩니다. 날씨 변화와 안개 영향을 받을 수 있어 탐방 전 현지 여건과 안내를 확인하는 것이 좋습니다.",
        mapQuery: "가거도 독실산",
        officialHref: "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=47836660-7194-498c-90a6-f8bfa9662b3c",
      },
      {
        name: "섬등반도",
        category: "해안 절벽 · 자연 경관",
        description: "독실산에서 서쪽으로 이어지는 반도형 지형입니다. 주상절리와 해식애가 펼쳐진 해안 경관으로 한국관광공사가 안내합니다.",
        mapQuery: "가거도 섬등반도",
        officialHref: "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=47836660-7194-498c-90a6-f8bfa9662b3c",
      },
      {
        name: "가거도 등대",
        category: "등대 · 해안 풍경",
        description: "섬등반도와 함께 가거도 여행 명소로 소개되는 등대입니다. 방문 가능 구간과 이동 여건은 현지 안내를 확인하세요.",
        mapQuery: "가거도 등대",
        officialHref: "https://korean.visitkorea.or.kr/detail/cs_detail_cos.do?cotid=8ba547ce-fc32-45a7-bf9f-203ee1b4a203",
      },
      {
        name: "회룡산",
        category: "전망 · 마을 풍경",
        description: "가거도항과 대리마을 풍경을 볼 수 있는 곳으로 한국관광공사 여행코스에 소개됩니다. 탐방로 상태는 출발 전에 확인하세요.",
        mapQuery: "가거도 회룡산",
        officialHref: "https://korean.visitkorea.or.kr/detail/cs_detail_cos.do?cotid=8ba547ce-fc32-45a7-bf9f-203ee1b4a203",
      },
    ],
  },
  {
    slug: "baengnyeongdo",
    region: "백령도",
    title: "백령도 주요 관광지 — 용기포항 도착 뒤 확인하는 4곳",
    description: "용기포항에 도착한 뒤 찾아볼 수 있는 두무진, 사곶해변, 콩돌해안, 용기원산 전망대를 인천관광·인천시 안내 기준으로 정리했습니다.",
    arrivalPort: "용기포항",
    intro: "인천 출발편은 백령도 용기포항에 도착합니다. 주요 관광지가 섬 안에 흩어져 있어 섬 내 이동을 따로 계획하는 편이 좋습니다. 아래 장소는 인천관광과 인천시 안내에 소개된 곳이며, 기상·통제·운영 여건은 방문일에 확인하세요.",
    sourceNote: "2026-09-07 작성. 관광지 명칭과 소개 범위는 인천관광과 인천광역시 백령·대청 국가지질공원 안내를 바탕으로 정리했습니다. 지도 링크는 장소를 찾기 위한 검색 링크이며, 정확한 위치·운영 정보는 연결된 안내와 현지 운영처를 확인하세요.",
    updated: "2026-09-07",
    sourceLabel: "인천관광 백령도 공식 안내",
    officialHref: "https://itour.incheon.go.kr/ssst/ssst/detail.do?cotId=ITD21121610281282088&pgListMode=S",
    ferryGuideHref: "/guide/incheon-baengnyeongdo",
    ferryGuideLabel: "인천·백령도 배편·승선 안내 보기",
    places: [
      {
        name: "두무진",
        category: "해안 절벽 · 지질 경관",
        description: "백령도 서북쪽 해안의 기암 절벽 경관입니다. 포구에서 해상관람 또는 육상 탐방으로 볼 수 있으며, 해상관람은 기상에 따라 달라질 수 있습니다.",
        mapQuery: "백령도 두무진",
        officialHref: "https://itour.incheon.go.kr/thmtour/rcmdtour/detail.do?cotId=ITA21121017382163662",
      },
      {
        name: "사곶해변",
        category: "해변 · 지질 명소",
        description: "백령·대청 국가지질공원이 백령도 지질명소로 안내하는 해변입니다. 해변 이용 여건과 안전 안내는 계절·방문일에 따라 확인하세요.",
        mapQuery: "백령도 사곶해변",
        officialHref: "https://www.incheon.go.kr/env/ENV040102",
      },
      {
        name: "콩돌해안",
        category: "해안 · 지질 명소",
        description: "둥글고 작은 자갈이 이어지는 해안으로, 백령·대청 국가지질공원이 안내하는 백령도 지질명소 중 하나입니다.",
        mapQuery: "백령도 콩돌해안",
        officialHref: "https://www.incheon.go.kr/env/ENV040102",
      },
      {
        name: "용기원산 전망대",
        category: "전망 · 섬 전경",
        description: "국토끝섬전망대로도 소개되는 전망 장소입니다. 백령도 전경을 조망할 수 있으며, 이동 전 날씨와 현장 안내를 확인하세요.",
        mapQuery: "백령도 용기원산 전망대",
        officialHref: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=db13fe4f-fcf3-45a8-a5c9-146ffe9cec37",
      },
    ],
  },
]

export function getTourGuide(slug: string): TourGuide | undefined {
  return TOUR_GUIDES.find((guide) => guide.slug === slug)
}
