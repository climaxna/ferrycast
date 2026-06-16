import { getWandoRoutes, getWandoArrivals } from "@/lib/ferry"
import RouteTabs from "./RouteTabs"

export default async function RouteSection() {
  const [departures, arrivals] = await Promise.all([
    getWandoRoutes(),
    getWandoArrivals(),
  ])

  return <RouteTabs departures={departures} arrivals={arrivals} />
}
