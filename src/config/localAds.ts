// 지역 광고주 데이터 — 실제 게재분과 미리보기(/ads/preview)가 공유한다.
//
// 시안 3종(docs/banner-samples)에 대응:
//   text    A. 기본형  — 이모지 + 제목 + 한 줄 + CTA        (모든 업종)
//   photo   B. 사진형  — 썸네일 + 제목 + 한 줄 + CTA        (펜션·식당·카페)
//   benefit C. 혜택형  — amber 강조 + "보고 왔어요" 훅       (할인·이벤트)
//
// ⚠️ 계약 관리 원칙
//   - `until`(게재 만료일)은 **필수**. 가장 위험한 사고는 "돈 안 받는데 계속 걸려 있는 것"이라
//     타입으로 강제한다. 만료 판정은 문자열 비교(kstDateStr)라 타임존 버그가 없다.
//   - `id`는 리포트 연속성을 위해 한 번 정하면 바꾸지 않는다.

export type LocalAdVariant = "text" | "photo" | "benefit"

export interface LocalAd {
  id: string              // 리포트용 고유 키 (변경 금지)
  variant: LocalAdVariant
  region: string          // "wando" | RegionConfig.slug
  until: string           // "YYYYMMDD" 게재 만료일 (필수)
  title: string           // 상호 + 한 줄 (예: "○○펜션 · 오션뷰 객실")
  desc: string            // 첫 줄에 위치 정보 권장 (예: "선착장에서 5분 · 전 객실 바다 전망")
  emoji?: string          // text·benefit 시안용
  imageSrc?: string       // photo 시안용 (public/ 기준 경로)
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
  id: "preview-sample",
  variant: "text",
  region: "wando",
  until: "20991231",
  emoji: "🏠",
  title: "○○펜션 · 오션뷰 객실",
  desc: "선착장에서 5분 · 전 객실 바다 전망",
  tel: "000-0000-0000",
  ctaLabel: "자세히 보기",
}
