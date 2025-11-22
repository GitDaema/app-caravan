import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useUIStore } from '../store/ui'

export default function ReservationForm() {
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

  return (
    <div className="bg-white rounded-2xl shadow-md ring-1 ring-gray-900/5 p-4 md:p-5">
      <h3 className="font-semibold mb-3">예약 생성</h3>
      <div className="grid gap-2">
        <div className="text-sm text-gray-700">
          {selectedCaravanId ? (
            <span>선택한 카라반 ID: #{selectedCaravanId}</span>
          ) : (
            <span className="text-gray-500">먼저 카라반 목록에서 예약할 카라반을 선택해 주세요.</span>
          )}
        </div>

        <label className="text-sm text-gray-700" htmlFor="startDate">
          시작일
        </label>
        <input
          id="startDate"
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          type="date"
          value={start}
          onChange={e => setStart(e.target.value)}
        />

        <label className="text-sm text-gray-700" htmlFor="endDate">
          종료일
        </label>
        <input
          id="endDate"
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          type="date"
          value={end}
          onChange={e => setEnd(e.target.value)}
        />

        <button
          className="bg-[#0F766E] text-white px-3 py-2 rounded-2xl text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#115e57] transition-colors shadow-sm hover:shadow-md"
          onClick={() => {
            if (!canSubmit || isOffline) return
            mutation.mutate()
          }}
          disabled={mutation.isPending || !canSubmit}
        >
          {mutation.isPending ? '생성 중...' : isOffline ? '오프라인 상태에서는 예약을 만들 수 없습니다.' : '예약하기'}
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
