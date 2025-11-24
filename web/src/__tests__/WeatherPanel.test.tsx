import { render, screen, waitFor } from '@testing-library/react'
import WeatherPanel from '../components/WeatherPanel'
import { withProviders } from '../test/utils'

describe('WeatherPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('선택된 카라반이 없으면 렌더되지 않는다', () => {
    render(withProviders(<WeatherPanel selectedCaravan={null} />))
    expect(screen.queryByText(/카라반 주변 날씨/)).not.toBeInTheDocument()
  })

  test('날씨 정보를 불러와서 표시한다', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch' as any)

    // Geocoding 응답
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            name: '서울',
            country_code: 'KR',
            latitude: 37.57,
            longitude: 126.98,
          },
        ],
      }),
    } as any)

    // Forecast 응답
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current_weather: {
          temperature: 21.3,
          weathercode: 0,
        },
        daily: {
          time: ['2025-01-01', '2025-01-02', '2025-01-03'],
          temperature_2m_min: [10, 11, 12],
          temperature_2m_max: [20, 21, 22],
          weathercode: [0, 3, 61],
        },
      }),
    } as any)

    render(
      withProviders(
        <WeatherPanel
          selectedCaravan={{ location: 'Seoul', name: '테스트 카라반' }}
        />,
      ),
    )

    await waitFor(() => {
      expect(screen.getByText(/카라반 주변 날씨/)).toBeInTheDocument()
    })

    expect(screen.getByText(/맑음/)).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})

