import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import MessageThread from './MessageThread'
import { CalendarX, ListChecks } from 'lucide-react'

type ReservationListProps = {
  onEmptyNavigateExplore?: () => void
}

export default function ReservationList({ onEmptyNavigateExplore }: ReservationListProps) {
  const qc = useQueryClient()
  const [openMessageId, setOpenMessageId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => api.get('/api/reservations'),
  })

  const cancelMutation = useMutation({
    mutationFn: async (vars: { id: number; caravan_id: number }) =>
      api.post(`/api/reservations/${vars.id}/cancel`),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['reservations'] })
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['caravan-calendar', vars.caravan_id] })
    },
    onError: (e: any) => alert(e?.message || '취소에 실패했어요.'),
  })

  if (isLoading) return <div className="bg-white rounded-2xl shadow-md p-4">불러오는 중...</div>

  const items = data || []

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <ListChecks className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">내 예약</h3>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CalendarX className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm text-slate-500 mb-3">예정된 여행이 없어요.</p>
          <button
            type="button"
            onClick={onEmptyNavigateExplore}
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors transition-transform active:scale-[0.98]"
          >
            여행 떠나기 (탐색 탭으로 이동)
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-2 text-sm">
            {items.map((r: any) => (
              <li
                key={r.id}
                className="border rounded-2xl p-3 border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      #{r.id} Caravan {r.caravan_id}
                    </span>
                    <span className="text-sm text-gray-600">
                      {r.start_date} ~ {r.end_date}
                    </span>
                    <span className="text-sm">{r.price}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                        r.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-2.5 py-1.5 rounded-full border text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
                      aria-label={`예약 #${r.id} 취소`}
                      onClick={() => {
                        if (!window.confirm(`예약 #${r.id}을 정말 취소하시겠어요?`)) return
                        cancelMutation.mutate({ id: r.id, caravan_id: r.caravan_id })
                      }}
                      disabled={cancelMutation.isPending || r.status === 'cancelled'}
                    >
                      취소
                    </button>
                    <button
                      className="px-2.5 py-1.5 rounded-full border text-xs font-medium text-[#0F766E] border-[#0F766E] hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 disabled:opacity-50"
                      aria-label={`예약 #${r.id} 메시지`}
                      onClick={() => setOpenMessageId(openMessageId === r.id ? null : r.id)}
                    >
                      메시지
                    </button>
                  </div>
                </div>
                {openMessageId === r.id && (
                  <div className="mt-2">
                    <MessageThread reservationId={r.id} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          {openMessageId && !items.find((r: any) => r.id === openMessageId) && (
            <div className="mt-3">
              <MessageThread reservationId={openMessageId} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

