import { getWandoWeather } from "@/lib/weather"
import { getTidalForecast } from "@/lib/tide"
import { get5DayForecast } from "@/lib/forecast"
import { get5DayTidalForecast } from "@/lib/tide"
import WeatherCardClient from "./WeatherCardClient"

export default async function WeatherCard() {
  const [weather, tidal, forecast5, tidal5] = await Promise.all([
    getWandoWeather(),
    getTidalForecast(),
    get5DayForecast(),
    get5DayTidalForecast(),
  ])

  return <WeatherCardClient weather={weather} tidal={tidal} forecast5={forecast5} tidal5={tidal5} />
}
