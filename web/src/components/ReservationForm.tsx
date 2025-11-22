import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useUIStore } from '../store/ui'
import { CalendarPlus, ImageOff } from 'lucide-react'

type ReservationFormProps = {
  selectedCaravan?: any | null
  onSelectCaravanRequest?: () => void
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523419409543-3e4f83b9b8f2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500534314211-0a24cd03f2c0?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop',
]

export default function ReservationForm({ selectedCaravan, onSelectCaravanRequest }: ReservationFormProps) {
  const qc = useQueryClient()
  const { selectedCaravanId } = useUIStore()
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' && 'onLine' in navigator ? !navigator.onLine : false,
  )

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const canSubmit = selectedCaravanId != null && !!start && !!end && !isOffline

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post('/api/reservations', {
        caravan_id: Number(selectedCaravanId),
        start_date: start,
        end_date: end,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })

  const totalPrice = useMemo(() => {
    if (!selectedCaravan || !start || !end || !selectedCaravan.price_per_day) return null
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null
    const diffMs = endDate.getTime() - startDate.getTime()
    const nights = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (nights <= 0) return null
    return nights * selectedCaravan.price_per_day
  }, [selectedCaravan, start, end])

  const thumbnailUrl =
    selectedCaravan && selectedCaravan.id
      ? fallbackImages[selectedCaravan.id % fallbackImages.length]
      : null

  if (!selectedCaravanId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3">
        <CalendarPlus className="w-8 h-8 text-slate-300" />
        <p className="text-sm text-slate-600">여행할 카라반을 먼저 선택해 주세요.</p>
        <button
          type="button"
          onClick={onSelectCaravanRequest}
          className="mt-1 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors transition-transform active:scale-[0.98]"
        >
          카라반 찾아보기
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <CalendarPlus className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">예약 생성</h3>
      </div>

      {selectedCaravan && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-24 h-24 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={selectedCaravan.name} className="w-full h-full object-cover" />
            ) : (
              <ImageOff className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-slate-900">{selectedCaravan.name}</div>
            <div className="text-sm text-slate-500">{selectedCaravan.location}</div>
            <div className="mt-1 text-sm font-bold text-blue-600">
              {selectedCaravan.price_per_day?.toLocaleString?.('ko-KR') ??
                selectedCaravan.price_per_day}
              원 / 박
            </div>
          </div>
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-slate-900 underline"
            onClick={onSelectCaravanRequest}
          >
            변경
          </button>
        </div>
      )}

      <div className="grid gap-3">
        <div className="grid gap-1">
          <label className="text-sm text-gray-700" htmlFor="startDate">
            시작일
          </label>
          <input
            id="startDate"
            className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm text-gray-700" htmlFor="endDate">
            종료일
          </label>
          <input
            id="endDate"
            className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        {totalPrice != null && (
          <div className="mt-1 text-sm font-semibold text-slate-900">
            총 예상 금액: {totalPrice.toLocaleString('ko-KR')}원
          </div>
        )}

        <button
          className="mt-2 bg-[#0F766E] text-white px-3 py-2 rounded-2xl text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#115e57] transition-colors shadow-md"
          onClick={() => {
            if (!canSubmit || isOffline) return
            mutation.mutate()
          }}
          disabled={mutation.isPending || !canSubmit}
        >
          {mutation.isPending
            ? '예약 생성 중...'
            : isOffline
            ? '오프라인 상태에서는 예약할 수 없어요.'
            : '예약하기'}
        </button>

        {isOffline && (
          <p className="text-amber-600 text-xs sm:text-sm">
            오프라인 상태에서는 예약을 만들 수 없습니다. 네트워크 연결 후 다시 시도해 주세요.
          </p>
        )}

        {mutation.isError && (
          <p className="text-red-600 text-sm">
            오류: {(mutation.error as any)?.message || '요청에 실패했습니다.'}
          </p>
        )}
      </div>
    </div>
  )
}

