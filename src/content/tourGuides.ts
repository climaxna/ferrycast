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
]

export function getTourGuide(slug: string): TourGuide | undefined {
  return TOUR_GUIDES.find((guide) => guide.slug === slug)
}
