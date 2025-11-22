import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useUIStore } from '../store/ui'
import { CalendarRange } from 'lucide-react'

function daysInMonth(year: number, monthIndexZeroBased: number) {
  return new Date(year, monthIndexZeroBased + 1, 0).getDate()
}

function formatISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function CaravanCalendar() {
  const { selectedCaravanId } = useUIStore()

  const { data, isLoading, error } = useQuery({
    enabled: selectedCaravanId != null,
    queryKey: ['caravan-calendar', selectedCaravanId],
    queryFn: async () => api.get(`/api/caravans/${selectedCaravanId}/calendar`),
  })

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() // 0-based
  const days = daysInMonth(year, month)

  const reservedSet = useMemo(() => {
    const s = new Set<string>()
    for (const r of data?.ranges || []) {
      const start = new Date(r.start)
      const end = new Date(r.end)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        s.add(formatISO(d))
      }
    }
    return s
  }, [data])

  if (!selectedCaravanId) {
    return (
      <div
        className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5"
        aria-live="polite"
      >
        <div className="flex items-center mb-3">
          <CalendarRange className="w-5 h-5 text-slate-400 mr-2" />
          <h3 className="text-sm font-semibold text-slate-900">예약 캘린더</h3>
        </div>
        <div className="text-sm text-gray-600">
          카라반을 선택하면 해당 카라반의 예약 현황을 캘린더로 확인할 수 있어요.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <CalendarRange className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">
          예약 캘린더 (Caravan #{selectedCaravanId})
        </h3>
      </div>
      {isLoading && <div>불러오는 중...</div>}
      {error && <div className="text-red-600 text-sm">캘린더를 불러오지 못했어요.</div>}
      {!isLoading && !error && (
        <div>
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-600 mb-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <div key={d} className="text-center font-medium">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
              const dateObj = new Date(year, month, day)
              const iso = formatISO(dateObj)
              const isReserved = reservedSet.has(iso)
              return (
                <div
                  key={iso}
                  className={`aspect-square rounded-xl border flex items-center justify-center text-sm select-none ${
                    isReserved
                      ? 'bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/40'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  aria-label={`${iso}${isReserved ? ' 예약됨' : ''}`}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

