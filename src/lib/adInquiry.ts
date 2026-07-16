// 지역 광고 문의 메일 정보 — LocalAdSlot·AdsPageContent가 공유
// 문의는 메일로만 받는다 (전화번호 비공개). 지역명·미리보기 경로만 지역별로 다름.
export const AD_MAIL = "climaxna@naver.com"

// 지역별 광고 문의 mailto 생성 (제목·본문에 지역명, 미리보기 링크에 지역 경로)
export function buildAdMailto({
  regionName,
  adsPath,
}: {
  regionName: string
  adsPath: string
}): string {
  const subject = encodeURIComponent(`[FerryCast] ${regionName} 지역 광고 문의`)
  const body = encodeURIComponent(
    [
      "아래 내용을 적어 보내주시면 확인 후 게재 방법과 조건을 회신드립니다.",
      "",
      "업체명 : ",
      "연락처 : ",
      "홍보하실 내용(가게 소개 등) : ",
      "",
      "────────────────────",
      `[FerryCast ${regionName} 광고 자리 안내]`,
      "",
      `· ${regionName} 배편·날씨·물때를 확인하는 첫 화면 하단에 노출됩니다.`,
      "· 방문자 상당수가 여행·이동을 준비하는 사람들입니다.",
      "  펜션·식당·카페·특산물·렌터카의 실제 잠재 손님입니다.",
      "· 배 시간을 확인하려고 하루에도 여러 번 다시 열어보는 화면이라,",
      "  같은 방문자에게 반복 노출되는 자리입니다.",
      "",
      "· 배너(광고 이미지)는 저희가 무료로 만들어드립니다.",
      "  가게 사진 2~3장과 소개 한 줄이면 충분합니다.",
      `· 실제 게재 모습 미리보기: https://ferrycast.kr${adsPath}`,
      "",
      "문의만 남기셔도 부담 없이 조건을 안내드립니다. 감사합니다.",
    ].join("\n"),
  )
  return `mailto:${AD_MAIL}?subject=${subject}&body=${body}`
}
