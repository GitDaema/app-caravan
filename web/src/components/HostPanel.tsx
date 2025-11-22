import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import MessageThread from './MessageThread'

function StatusChip({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
  }
  const cls = colors[status] || 'bg-slate-50 text-slate-700 border-slate-200'
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`} aria-label={`status ${status}`}>
      {status}
    </span>
  )
}

export default function HostPanel() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const isHost = !!user && user.role === 'HOST'
  const [activeReservationId, setActiveReservationId] = useState<number | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['host-reservations'],
    queryFn: async () => api.get('/api/reservations/host'),
    enabled: isHost,
  })

  const mutation = useMutation({
    mutationFn: async (vars: { id: number; status: string; caravan_id: number }) =>
      api.post(`/api/reservations/${vars.id}/status`, { status: vars.status }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['host-reservations'] })
      // 캘린더도 함께 갱신
      qc.invalidateQueries({ queryKey: ['caravan-calendar', vars.caravan_id] })
    },
    onError: (e: any) => {
      alert(e?.message || '상태 변경에 실패했습니다.')
    },
  })

  // Only show for hosts
  if (!isHost) return null
  return (
    <div className="bg-white rounded-2xl shadow-md ring-1 ring-gray-900/5 p-4 md:p-5">
      <h3 className="font-semibold mb-3">호스트 예약 관리</h3>
      {isLoading && <div>불러오는 중...</div>}
      {error && <div className="text-red-600 text-sm">예약 목록을 불러오지 못했습니다.</div>}
      {!isLoading && !error && (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-2">ID</th>
                <th className="py-2 pr-2">Caravan</th>
                <th className="py-2 pr-2">Dates</th>
                <th className="py-2 pr-2">Price</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((r: any) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-2 whitespace-nowrap text-slate-700">#{r.id}</td>
                  <td className="py-2 pr-2 whitespace-nowrap text-slate-700">{r.caravan_id}</td>
                  <td className="py-2 pr-2 whitespace-nowrap text-slate-700">
                    {r.start_date} ~ {r.end_date}
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap text-slate-700">{r.price}</td>
                  <td className="py-2 pr-2">
                    <StatusChip status={r.status} />
                  </td>
                  <td className="py-1 pr-2">
                    {/* 단일 액션 버튼: pending -> 확인, confirmed -> 취소, cancelled -> 비활성 */}
                    {r.status === 'pending' && (
                      <button
                        className="px-2.5 py-1.5 rounded-full border text-xs font-medium text-emerald-700 border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
                        aria-label={`예약 #${r.id} 확인`}
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({ id: r.id, status: 'confirmed', caravan_id: r.caravan_id })
                        }
                      >
                        확인
                      </button>
                    )}
                    {r.status === 'confirmed' && (
                      <button
                        className="px-2.5 py-1.5 rounded-full border text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
                        aria-label={`예약 #${r.id} 취소`}
                        disabled={mutation.isPending}
                        onClick={() => {
                          if (!window.confirm(`예약 #${r.id} 을(를) 정말 취소하시겠습니까?`)) return
                          mutation.mutate({ id: r.id, status: 'cancelled', caravan_id: r.caravan_id })
                        }}
                      >
                        취소
                      </button>
                    )}
                    {r.status === 'cancelled' && (
                      <button
                        className="px-2.5 py-1.5 rounded-full border text-xs font-medium text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed"
                        aria-label={`예약 #${r.id} 취소됨`}
                        disabled
                      >
                        취소됨
                      </button>
                    )}
                    <button
                      className="ml-2 px-2.5 py-1.5 rounded-full border text-xs font-medium text-[#0F766E] border-[#0F766E] hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 disabled:opacity-50"
                      aria-label={`예약 #${r.id} 메시지 보기`}
                      disabled={mutation.isPending}
                      onClick={() => setActiveReservationId(activeReservationId === r.id ? null : r.id)}
                    >
                      메시지
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activeReservationId && (
            <div className="mt-3">
              <MessageThread reservationId={activeReservationId} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
