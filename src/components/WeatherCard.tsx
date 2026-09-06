import { getWandoWeather } from "@/lib/weather"
import WeatherCardClient from "./WeatherCardClient"

export default async function WeatherCard() {
  const weather = await getWandoWeather()
  return <WeatherCardClient weather={weather} />
}
