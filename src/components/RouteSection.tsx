import { getWandoRoutes, getWandoArrivals } from "@/lib/ferry"
import RouteTabs from "./RouteTabs"
import LocalAdSlot from "./LocalAdSlot"

export default async function RouteSection() {
  const [departures, arrivals] = await Promise.all([
    getWandoRoutes(),
    getWandoArrivals(),
  ])

  return (
    <RouteTabs
      departures={departures}
      arrivals={arrivals}
      adSlot={<LocalAdSlot regionName="완도" adsPath="/ads" />}
    />
  )
}
