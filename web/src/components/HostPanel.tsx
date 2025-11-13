import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

function StatusChip({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-300',
  }
  const cls = colors[status] || 'bg-gray-100 text-gray-700 border-gray-300'
  return <span className={`px-2 py-0.5 rounded border text-xs ${cls}`} aria-label={`status ${status}`}>{status}</span>
}

export default function HostPanel() {
  const { user } = useAuthStore()
  // Only show for hosts
  // @ts-ignore
  if (!user || (user.role && user.role !== 'host')) return null

  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['host-reservations'],
    queryFn: async () => api.get('/reservations/host'),
  })

  const mutation = useMutation({
    mutationFn: async (
      vars: { id: number; status: string; caravan_id: number }
    ) => api.post(`/reservations/${vars.id}/status`, { status: vars.status }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['host-reservations'] })
      // 캘린더 자동 갱신
      qc.invalidateQueries({ queryKey: ['caravan-calendar', vars.caravan_id] })
    },
    onError: (e: any) => {
      alert(e?.message || '상태 변경 실패')
    },
  })

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">호스트 예약 관리</h3>
      {isLoading && <div>불러오는 중…</div>}
      {error && <div className="text-red-600 text-sm">목록을 불러오지 못했습니다</div>}
      {!isLoading && !error && (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-1 pr-2">ID</th>
                <th className="py-1 pr-2">Caravan</th>
                <th className="py-1 pr-2">Dates</th>
                <th className="py-1 pr-2">Price</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-1 pr-2">#{r.id}</td>
                  <td className="py-1 pr-2">{r.caravan_id}</td>
                  <td className="py-1 pr-2">{r.start_date} ~ {r.end_date}</td>
                  <td className="py-1 pr-2">{r.price}</td>
                  <td className="py-1 pr-2"><StatusChip status={r.status} /></td>
                  <td className="py-1 pr-2">
                    {/* 단일 액션 버튼: pending -> 승인, confirmed -> 취소, cancelled -> 비활성 */}
                    {r.status === 'pending' && (
                      <button
                        className="px-2 py-1 rounded border text-green-700 border-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                        aria-label={`예약 #${r.id} 승인`}
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ id: r.id, status: 'confirmed', caravan_id: r.caravan_id })}
                      >승인</button>
                    )}
                    {r.status === 'confirmed' && (
                      <button
                        className="px-2 py-1 rounded border text-gray-700 border-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
                        aria-label={`예약 #${r.id} 취소`}
                        disabled={mutation.isPending}
                        onClick={() => {
                          if (!window.confirm(`예약 #${r.id} 을(를) 취소하시겠습니까?`)) return
                          mutation.mutate({ id: r.id, status: 'cancelled', caravan_id: r.caravan_id })
                        }}
                      >취소</button>
                    )}
                    {r.status === 'cancelled' && (
                      <button
                        className="px-2 py-1 rounded border text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed"
                        aria-label={`예약 #${r.id} 취소됨`}
                        disabled
                      >취소됨</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
