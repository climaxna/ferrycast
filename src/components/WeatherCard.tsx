import { getWandoWeather } from "@/lib/weather"
import { getTidalForecast } from "@/lib/tide"
import WeatherCardClient from "./WeatherCardClient"

export default async function WeatherCard() {
  const [weather, tidal] = await Promise.all([
    getWandoWeather(),
    getTidalForecast(),
  ])

  return <WeatherCardClient weather={weather} tidal={tidal} />
}
