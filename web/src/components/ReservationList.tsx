import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function ReservationList() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => api.get('/reservations'),
  })

  const cancelMutation = useMutation({
    mutationFn: async (vars: { id: number; caravan_id: number }) => api.post(`/reservations/${vars.id}/cancel`),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['reservations'] })
      qc.invalidateQueries({ queryKey: ['me'] })
      // 캘린더 자동 갱신
      qc.invalidateQueries({ queryKey: ['caravan-calendar', vars.caravan_id] })
    },
    onError: (e: any) => alert(e?.message || '취소 실패'),
  })

  if (isLoading) return <div className="bg-white rounded shadow p-4">불러오는 중…</div>

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">내 예약</h3>
      <ul className="space-y-2">
        {(data || []).map((r: any) => (
          <li key={r.id} className="border rounded p-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-medium">#{r.id} Caravan {r.caravan_id}</span>
              <span className="text-sm text-gray-600">{r.start_date} ~ {r.end_date}</span>
              <span className="text-sm">{r.price}</span>
              <span className={`px-2 py-0.5 rounded border text-xs ${r.status==='confirmed' ? 'bg-green-100 text-green-800 border-green-300' : r.status==='pending' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>{r.status}</span>
            </div>
            <div>
              <button
                className="px-2 py-1 rounded border text-gray-700 border-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                aria-label={`예약 #${r.id} 취소`}
                onClick={() => {
                  if (!window.confirm(`예약 #${r.id} 을(를) 취소하시겠습니까?`)) return
                  cancelMutation.mutate({ id: r.id, caravan_id: r.caravan_id })
                }}
                disabled={cancelMutation.isPending || r.status === 'cancelled'}
              >취소</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
