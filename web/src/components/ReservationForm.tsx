import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import { useUIStore } from '../store/ui'

export default function ReservationForm() {
  const qc = useQueryClient()
  const { selectedCaravanId } = useUIStore()
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const canSubmit = selectedCaravanId != null && !!start && !!end

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post('/reservations', {
        caravan_id: Number(selectedCaravanId),
        start_date: start,
        end_date: end,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] })
  })

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">예약 생성</h3>
      <div className="grid gap-2">
        <div className="text-sm text-gray-700">
          {selectedCaravanId ? (
            <span>선택된 카라반 ID: #{selectedCaravanId}</span>
          ) : (
            <span className="text-gray-500">먼저 아래 목록에서 카라반을 선택하세요.</span>
          )}
        </div>

        <label className="text-sm text-gray-700" htmlFor="startDate">시작일</label>
        <input id="startDate" className="border p-2" type="date" value={start} onChange={e => setStart(e.target.value)} />

        <label className="text-sm text-gray-700" htmlFor="endDate">종료일</label>
        <input id="endDate" className="border p-2" type="date" value={end} onChange={e => setEnd(e.target.value)} />

        <button
          className="bg-sky-600 text-white px-3 py-2 rounded"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !canSubmit}
        >
          {mutation.isPending ? '생성 중…' : '예약하기'}
        </button>
        {mutation.isError && (
          <p className="text-red-600 text-sm">오류: {(mutation.error as any)?.message || '실패'}</p>
        )}
      </div>
    </div>
  )
}
