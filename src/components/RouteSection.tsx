import { getWandoRoutes, getWandoArrivals, getWandoStatusSummaries } from "@/lib/ferry"
import RouteTabs from "./RouteTabs"
import LocalAdSlot from "./LocalAdSlot"

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
      adSlot={<LocalAdSlot regionName="완도" adsPath="/ads" />}
    />
  )
}
