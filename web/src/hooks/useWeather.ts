import { useQuery } from '@tanstack/react-query'
import { fetchWeather, type WeatherSummary } from '../lib/weather'

export function useWeather(location: string | null | undefined) {
  const trimmed = location?.trim() || ''

  return useQuery<WeatherSummary, Error>({
    queryKey: ['weather', trimmed],
    enabled: trimmed.length > 0,
    queryFn: () => fetchWeather(trimmed),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

