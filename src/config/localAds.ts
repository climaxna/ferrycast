// 지역 광고주 데이터 — 실제 게재분과 미리보기(/ads/preview)가 공유한다.
//
// 시안 4종:
//   text    A. 기본형    — 이모지 + 제목 + 한 줄 + CTA      (모든 업종)
//   photo   B. 사진형    — 썸네일 + 제목 + 한 줄 + CTA      (펜션·식당·카페)
//   benefit C. 혜택형    — amber 강조 + "보고 왔어요" 훅     (할인·이벤트)
//   image   D. 전면이미지 — 완성된 배너 이미지 한 장         (업체가 디자인을 직접 제작한 경우)
//
// image 시안 주의: 문구·연락처가 전부 그림 안에 있어 화면 낭독기가 읽지 못한다.
// → `alt`에 배너의 핵심 정보(상호·연락처)를 반드시 텍스트로 적는다.
//
// ⚠️ 계약 관리 원칙
//   - `until`(게재 만료일)은 **필수**. 가장 위험한 사고는 "돈 안 받는데 계속 걸려 있는 것"이라
//     타입으로 강제한다. 만료 판정은 문자열 비교(kstDateStr)라 타임존 버그가 없다.
//   - `id`는 리포트 연속성을 위해 한 번 정하면 바꾸지 않는다.

// 전면 이미지 광고 슬롯의 가로/세로 비. 390px 화면(카드 폭 358px)에서 약 119px 높이.
// 배편 카드 한 장(약 200px)보다 낮아 정보를 압도하지 않으면서, 상호·전화번호·제품 사진이
// 함께 들어갈 최소 높이. 광고를 아래로 여러 개 쌓아도 시간표를 화면 밖으로 밀지 않는다.
// 배너 제작 규격(1200x400)도 이 값 기준으로 안내한다.
export const AD_SLOT_RATIO = 3

export type LocalAdVariant = "text" | "photo" | "benefit" | "image"

export interface LocalAd {
  id: string              // 리포트용 고유 키 (변경 금지)
  variant: LocalAdVariant
  region: string          // "wando" | RegionConfig.slug
  until: string           // "YYYYMMDD" 게재 만료일 (필수)
  title: string           // 상호 + 한 줄 (예: "○○펜션 · 오션뷰 객실")
  desc: string            // 첫 줄에 위치 정보 권장 (예: "선착장에서 5분 · 전 객실 바다 전망")
  emoji?: string          // text·benefit 시안용
  imageSrc?: string       // photo(썸네일) · image(전면 배너) 시안용 — public/ 기준 경로
  imageW?: number         // image 시안 — 원본 가로(px). 비율 고정으로 레이아웃 흔들림(CLS) 방지
  imageH?: number         // image 시안 — 원본 세로(px)
  displayRatio?: number   // image 시안 — 슬롯의 가로/세로 비(예: 3 = 3:1). 원본이 더 세로로 길면 잘린다.
                          // 광고가 여러 개 쌓여도 배편 정보를 밀어내지 않도록 높이를 코드로 못박는 장치.
  imagePos?: string       // image 시안 — 잘릴 때 살릴 초점(CSS object-position, 예: "50% 65%").
                          // 규격(3:1)에 맞는 배너면 불필요. 세로가 긴 배너를 받았을 때 상호·연락처를 지키는 용도.
  alt?: string            // image 시안 필수 — 그림 안 문구를 텍스트로 (낭독기·이미지 차단 환경 대비)
  tel?: string            // 표시용 전화번호 — tel: 링크로 연결
  href?: string           // 홈페이지·네이버플레이스
  ctaLabel?: string       // "자세히 보기" | "메뉴 보기" 등
  benefitLine?: string    // benefit 시안 전용 강조 줄 (예: "아메리카노 500원 할인")
}

// 실제 게재 중인 광고. 빈 배열이면 모집 슬롯(LocalAdSlot)이 그대로 노출된다.
export const LOCAL_ADS: LocalAd[] = []

// ── 미리보기 전용 ────────────────────────────────────────────
// /ads/preview 에서 광고주에게 "이렇게 들어갑니다"를 보여줄 때 쓰는 샘플.
// 광고주가 정해지면 이 객체만 실제 정보로 채우면 그대로 미리보기가 완성된다.
// (계약 확정 후에는 같은 내용을 LOCAL_ADS에 옮기면 실제 게재로 전환)
export const PREVIEW_AD: LocalAd = {
  id: "wando-abalone-coop",
  variant: "image",
  region: "wando",
  until: "20991231",           // 미리보기용 — 실제 게재 시 계약 만료일로 교체
  title: "완도전복 생산자협동조합",
  desc: "완도전복의 자존심 · 명품 활·참전복 선물세트",
  // 업체가 3:1 규격으로 다시 제작해 준 배너(시안2, 파란색). 슬롯 비율과 정확히 같아 잘리지 않는다.
  // 파일명에 -3x1: 이전 16:9 파일과 경로가 겹치면 CDN이 옛 이미지를 계속 내보낸다.
  imageSrc: "/ads/wando-abalone-coop-3x1.jpg",
  imageW: 1200,
  imageH: 400,
  alt: "완도전복 생산자협동조합 — 완도전복의 자존심, 명품 활·참전복 선물세트. 문의 061-555-6700",
  // href가 있으면 tel보다 우선. 배너를 누르면 새 탭으로 스마트스토어가 열린다.
  // tel은 남겨둔다 — 배너 문구에 전화번호가 있어 광고주 정보로서 의미가 있고, 링크가 죽으면 대체 수단이 된다.
  href: "https://smartstore.naver.com/abalonecoops",
  tel: "061-555-6700",
}
