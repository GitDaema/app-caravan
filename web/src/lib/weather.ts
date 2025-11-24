export type WeatherDay = {
  date: string
  label: string
  minTemp: number
  maxTemp: number
  description: string
}

export type WeatherSummary = {
  locationLabel: string
  currentTemp: number
  currentDescription: string
  daily: WeatherDay[]
  updatedAt: Date
}

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

function describeWeatherCode(code: number | undefined): string {
  if (code == null) return '날씨 정보'
  if (code === 0) return '맑음'
  if (code >= 1 && code <= 3) return '구름 조금'
  if (code === 45 || code === 48) return '안개'
  if (code === 51 || code === 53 || code === 55) return '이슬비'
  if (code === 56 || code === 57) return '어는 비'
  if (code === 61 || code === 63 || code === 65) return '비'
  if (code === 66 || code === 67) return '어는 비'
  if (code === 71 || code === 73 || code === 75) return '눈'
  if (code === 77) return '눈송이'
  if (code === 80 || code === 81 || code === 82) return '소나기'
  if (code === 85 || code === 86) return '눈 소나기'
  if (code === 95) return '뇌우'
  if (code === 96 || code === 99) return '우박을 동반한 뇌우'
  return '날씨 정보'
}

async function handleResponse(res: Response, genericMessage: string) {
  if (!res.ok) {
    let detail = genericMessage
    try {
      const data = await res.json()
      if (typeof data === 'string') {
        detail = data
      } else if (data && typeof data === 'object') {
        detail =
          (data as any).detail ||
          (data as any).message ||
          (data as any).error_description ||
          (data as any).error ||
          genericMessage
      }
    } catch {
      // ignore JSON parse errors, keep generic message
    }
    throw new Error(detail)
  }
  return res.json()
}

function buildGeocodingQuery(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed

  // 1) 괄호 안에 영문 도시명이 있으면 그 부분만 사용 (예: "강원 동해 캠핑장 (Donghae)")
  const parenMatch = trimmed.match(/\(([^)]+)\)/)
  if (parenMatch && /[A-Za-z]/.test(parenMatch[1])) {
    return parenMatch[1].trim()
  }

  // 2) 쉼표가 있으면 첫 번째 조각만 사용 (예: "Donghae, KR")
  const commaIndex = trimmed.indexOf(',')
  if (commaIndex > 0) {
    return trimmed.slice(0, commaIndex).trim()
  }

  // 3) 문자열이 길면 첫 단어만 사용 (예: "Busan Haeundae Beach Camper")
  if (trimmed.length > 15) {
    const token = trimmed.split(/[ ,]/).filter(Boolean)[0]
    if (token) return token
  }

  // 4) 그 외에는 전체를 그대로 사용
  return trimmed
}

export async function fetchWeather(locationRaw: string): Promise<WeatherSummary> {
  const location = locationRaw.trim()
  if (!location) {
    throw new Error('위치 정보가 없습니다.')
  }

  const geocodeQuery = buildGeocodingQuery(location)

  // 1) 위치 문자열을 좌표로 변환 (Open-Meteo Geocoding)
  const geoParams = new URLSearchParams({
    name: geocodeQuery,
    count: '1',
    language: 'ko',
    format: 'json',
  })

  const geoRes = await fetch(`${GEOCODING_BASE_URL}?${geoParams.toString()}`)
  const geoData = await handleResponse(geoRes, '날씨 위치를 찾을 수 없습니다.')

  const firstResult =
    Array.isArray((geoData as any).results) && (geoData as any).results.length > 0
      ? (geoData as any).results[0]
      : null

  if (!firstResult) {
    throw new Error('날씨 위치를 찾을 수 없습니다.')
  }

  const latitude: number | undefined = firstResult.latitude
  const longitude: number | undefined = firstResult.longitude

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('위치 좌표 정보를 해석할 수 없습니다.')
  }

  const locationLabelParts: string[] = []
  if (typeof firstResult.name === 'string') {
    locationLabelParts.push(firstResult.name)
  }
  if (typeof firstResult.country_code === 'string') {
    locationLabelParts.push(firstResult.country_code)
  }
  const locationLabel =
    locationLabelParts.length > 0 ? locationLabelParts.join(', ') : location

  // 2) 좌표 기준으로 현재 날씨 + 일별 예보 조회
  const forecastParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'temperature_2m_max,temperature_2m_min,weathercode',
    current_weather: 'true',
    timezone: 'auto',
  })

  const forecastRes = await fetch(
    `${FORECAST_BASE_URL}?${forecastParams.toString()}`,
  )
  const forecastData = await handleResponse(
    forecastRes,
    '날씨 정보를 불러오지 못했습니다.',
  )

  const current = (forecastData as any).current_weather
  const daily = (forecastData as any).daily

  if (
    !current ||
    !daily ||
    !Array.isArray(daily.time) ||
    !Array.isArray(daily.temperature_2m_min) ||
    !Array.isArray(daily.temperature_2m_max) ||
    !Array.isArray(daily.weathercode)
  ) {
    throw new Error('날씨 정보를 해석할 수 없습니다.')
  }

  const times: string[] = daily.time
  const minArr: number[] = daily.temperature_2m_min
  const maxArr: number[] = daily.temperature_2m_max
  const codeArr: number[] = daily.weathercode

  const dailySummaries: WeatherDay[] = []
  for (let i = 0; i < times.length; i += 1) {
    if (
      typeof minArr[i] !== 'number' ||
      typeof maxArr[i] !== 'number' ||
      typeof codeArr[i] !== 'number'
    ) {
      continue
    }

    dailySummaries.push({
      date: times[i],
      label: times[i],
      minTemp: minArr[i],
      maxTemp: maxArr[i],
      description: describeWeatherCode(codeArr[i]),
    })
  }

  if (dailySummaries.length === 0) {
    throw new Error('날씨 일별 정보를 찾을 수 없습니다.')
  }

  const currentTemp: number =
    typeof current.temperature === 'number'
      ? current.temperature
      : dailySummaries[0].maxTemp
  const currentDescription = describeWeatherCode(current.weathercode)

  return {
    locationLabel,
    currentTemp,
    currentDescription,
    daily: dailySummaries,
    updatedAt: new Date(),
  }
}

