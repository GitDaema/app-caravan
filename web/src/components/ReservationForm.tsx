import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'

export default function ReservationForm() {
  const qc = useQueryClient()
  const [caravanId, setCaravanId] = useState(1)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const mutation = useMutation({
    mutationFn: async () => {
      return api.post('/reservations', { caravan_id: Number(caravanId), start_date: start, end_date: end })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] })
  })

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">예약 생성</h3>
      <div className="grid gap-2">
        <label className="text-sm text-gray-700" htmlFor="caravanId">Caravan ID</label>
        <input id="caravanId" className="border p-2" value={caravanId} onChange={e => setCaravanId(Number(e.target.value))} placeholder="Caravan ID" />
        <label className="text-sm text-gray-700" htmlFor="startDate">시작일</label>
        <input id="startDate" className="border p-2" type="date" value={start} onChange={e => setStart(e.target.value)} />
        <label className="text-sm text-gray-700" htmlFor="endDate">종료일</label>
        <input id="endDate" className="border p-2" type="date" value={end} onChange={e => setEnd(e.target.value)} />
        <button className="bg-sky-600 text-white px-3 py-2 rounded" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? '생성 중...' : '예약하기'}
        </button>
        {mutation.isError && <p className="text-red-600 text-sm">오류: {(mutation.error as any)?.message || '실패'}</p>}
      </div>
    </div>
  )
}
