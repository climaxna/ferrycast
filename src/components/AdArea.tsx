import LocalAdCard from "./LocalAdCard"
import LocalAdSlot from "./LocalAdSlot"
import { getActiveAds } from "@/config/localAds"

// 메인 화면(완도 `/`, 지역 `/[region]`)의 광고 영역 — 시간표 바로 아래.
//
// 게재 중인 광고 배너를 먼저 쌓고, 그 아래에 항상 모집 슬롯을 둔다.
// → 이미 광고주가 있어도 "한 자리 더" 모집이 계속 노출된다(추가 광고주 유치).
// 계약이 끝난 광고는 getActiveAds가 걸러내므로 자동으로 모집 슬롯만 남는다.
//
// 광고가 여러 개면 세로로 쌓인다. 슬롯 높이가 비율로 고정돼 있어(AD_SLOT_RATIO)
// 몇 개가 붙어도 배편 시간표를 화면 밖으로 밀지 않는다.
export default function AdArea({
  region,
  regionName,
  adsPath,
}: {
  region: string
  regionName: string
  adsPath: string
}) {
  const ads = getActiveAds(region)

  return (
    <div className="space-y-2">
      {ads.map((ad) => (
        <LocalAdCard key={ad.id} ad={ad} />
      ))}
      {/* 광고가 있든 없든 모집 슬롯은 항상 노출 — 추가 광고주 모집 */}
      <LocalAdSlot regionName={regionName} adsPath={adsPath} hasAds={ads.length > 0} />
    </div>
  )
}
