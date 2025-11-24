import { CloudSun } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'

type WeatherPanelProps = {
  selectedCaravan: {
    location?: string | null
    name?: string | null
  } | null
  startDate?: string | null
}

function parseIsoDateOnly(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('T')[0]?.split('-') ?? []
  if (!y || !m || !d) return null
  const dt = new Date(Number(y), Number(m) - 1, Number(d))
  return Number.isNaN(dt.getTime()) ? null : dt
}

function formatMmdd(date: Date): string {
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${m}/${d}`
}

export default function WeatherPanel({ selectedCaravan, startDate }: WeatherPanelProps) {
  const location = selectedCaravan?.location

  if (!location || !location.trim()) {
    return null
  }

  const { data, isLoading, isError, refetch } = useWeather(location)

  // Feature flag: allow disabling panel entirely via build-time env
  const enabledFlag = import.meta.env.VITE_ENABLE_WEATHER_PANEL
  if (enabledFlag === 'false') {
    return null
  }

  // If query is disabled for some reason and we have no data/loading/error,
  // avoid rendering an empty card.
  if (!data && !isLoading && !isError) {
    return null
  }

  const title = '카라반 주변 날씨'
  const caravanName = selectedCaravan?.name || '선택한 카라반'

  let daysToShow = data?.daily ?? []

  if (data && data.daily.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const baseDate =
      (startDate && parseIsoDateOnly(startDate)) ||
      today

    if (baseDate) {
      const baseMs = baseDate.getTime()

      const dayMap = new Map<number, (typeof data.daily)[number]>()
      for (const day of data.daily) {
        const dt = parseIsoDateOnly(day.date)
        if (!dt) continue
        const diffDays = Math.round((dt.getTime() - baseMs) / (1000 * 60 * 60 * 24))
        if (!dayMap.has(diffDays)) {
          dayMap.set(diffDays, day)
        }
      }

      const offsets =
        startDate && parseIsoDateOnly(startDate)
          ? [1, 2] // 시작일 기준 다음날, 다다음날
          : [0, 1, 2] // 기본: 오늘, 내일, 모레

      const selected: typeof data.daily = []
      for (const off of offsets) {
        const found = dayMap.get(off)
        if (found) {
          selected.push(found)
        }
      }

      if (selected.length > 0) {
        daysToShow = selected
      } else {
        daysToShow = data.daily.slice(0, offsets.length)
      }
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center">
            <CloudSun className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">
              {startDate
                ? `${caravanName} 예약 시작일을 기준으로 다음 이틀 간의 날씨를 보여줍니다.`
                : `${caravanName} 주변의 오늘과 가까운 날씨를 미리 확인해 보세요.`}
            </p>
          </div>
        </div>
        {data && (
          <span className="hidden md:inline text-[11px] text-slate-400">
            업데이트:{' '}
            {data.updatedAt.toLocaleTimeString
              ? data.updatedAt.toLocaleTimeString()
              : ''}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="animate-pulse flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="h-6 w-24 bg-slate-100 rounded-lg mb-2" />
            <div className="h-3 w-32 bg-slate-100 rounded mb-1" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
          <div className="flex-[2] flex gap-2">
            <div className="flex-1 h-16 bg-slate-100 rounded-xl" />
            <div className="flex-1 h-16 bg-slate-100 rounded-xl hidden sm:block" />
            <div className="flex-1 h-16 bg-slate-100 rounded-xl hidden md:block" />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col gap-2 text-xs text-red-600 bg-red-50/60 border border-red-100 rounded-xl px-3 py-2">
          <span>날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</span>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-2 py-1 rounded-full border border-red-200 text-[11px] text-red-700 bg-white hover:bg-red-50 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {data && !isLoading && !isError && (
        <div className="mt-3 flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 flex flex-col justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-900">
                  {Math.round(data.currentTemp)}
                  <span className="text-base font-normal align-top ml-0.5">
                    °C
                  </span>
                </span>
                <span className="text-sm text-slate-600">
                  {data.currentDescription}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                실제 체감 온도와는 다를 수 있으며, 출발 전 최신 날씨를 다시 확인해
                주세요.
              </p>
            </div>
            <p className="text-[11px] text-slate-400 md:hidden">
              업데이트:{' '}
              {data.updatedAt.toLocaleTimeString
                ? data.updatedAt.toLocaleTimeString()
                : ''}
            </p>
          </div>
          <div className="flex-[1.8] flex flex-col sm:flex-row gap-2 text-xs">
            {daysToShow.map((day) => {
              const dt = parseIsoDateOnly(day.date)
              const dateLabel = dt ? formatMmdd(dt) : day.date
              return (
                <div
                  key={day.date}
                  className="flex-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {dateLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {day.description}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-900">
                    최고 {Math.round(day.maxTemp)}° / 최저{' '}
                    {Math.round(day.minTemp)}°
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
