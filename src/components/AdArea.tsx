import LocalAdCard from "./LocalAdCard"
import LocalAdSlot from "./LocalAdSlot"
import { getActiveAds } from "@/config/localAds"

// 메인 화면(완도 `/`, 지역 `/[region]`)의 광고 영역 — 시간표 바로 아래 한 자리.
//
// 게재 중인 광고가 있으면 배너를, 없으면 모집 슬롯을 보여준다. 호출부는 어느 쪽인지 몰라도 된다.
// 계약이 끝난 광고는 getActiveAds가 걸러내므로 자동으로 모집 슬롯으로 되돌아간다.
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
  if (!ads.length) return <LocalAdSlot regionName={regionName} adsPath={adsPath} />

  return (
    <div className="space-y-2">
      {ads.map((ad) => (
        <LocalAdCard key={ad.id} ad={ad} />
      ))}
    </div>
  )
}
