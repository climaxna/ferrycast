import { getWandoRoutes, getWandoArrivals, getWandoStatusSummaries } from "@/lib/ferry"
import RouteTabs from "./RouteTabs"
import AdArea from "./AdArea"

export default async function RouteSection() {
  const [departures, arrivals, summaries] = await Promise.all([
    getWandoRoutes(),
    getWandoArrivals(),
    getWandoStatusSummaries(),
  ])

  return (
    <RouteTabs
      departures={departures}
      arrivals={arrivals}
      summaries={summaries}
      adSlot={<AdArea region="wando" regionName="완도" adsPath="/ads" />}
      // 소안도·보길도·노화 아래 = 관광 3종(제주·청산도·보길도)이 끝나는 단락 구분점.
      // 그 아래는 여서도·모도·덕우도 생활 항로라 성격도 나뉜다.
      adAfterKey="hwaheungpo-route"
    />
  )
}
