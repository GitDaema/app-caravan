import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import MessageThread from './MessageThread'
import PreMessageThread from './PreMessageThread'
import { Users } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: '대기',
  confirmed: '확정',
  cancelled: '취소',
}

function formatDate(value: any): string {
  if (!value) return ''
  const s = typeof value === 'string' ? value : String(value)
  return s.slice(0, 10)
}

function formatPrice(value: any): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return String(value ?? '')
  return `${num.toLocaleString('ko-KR')}원`
}

function StatusChip({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
  }
  const cls = colors[status] || 'bg-slate-50 text-slate-700 border-slate-200'
  const label = STATUS_LABELS[status] || status
  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}
      aria-label={`예약 상태 ${label}`}
    >
      {label}
    </span>
  )
}

export default function HostPanel() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const isHost = !!user && user.role === 'HOST'
  const [activeReservationId, setActiveReservationId] = useState<number | null>(null)
  const [openCaravanInbox, setOpenCaravanInbox] = useState<{ id: number; name: string } | null>(
    null,
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ['host-reservations'],
    queryFn: async () => api.get('/api/reservations/host'),
    enabled: isHost,
  })

  const { data: preInbox } = useQuery({
    queryKey: ['host-pre-messages-inbox'],
    queryFn: async () => api.get('/api/pre-messages/inbox'),
    enabled: isHost,
  })

  const mutation = useMutation({
    mutationFn: async (vars: { id: number; status: string; caravan_id: number }) =>
      api.post(`/api/reservations/${vars.id}/status`, { status: vars.status }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['host-reservations'] })
      qc.invalidateQueries({ queryKey: ['caravan-calendar', vars.caravan_id] })
    },
    onError: (e: any) => {
      alert(e?.message || '상태 변경에 실패했습니다.')
    },
  })

  if (!isHost) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-slate-400 mr-2" />
          <h3 className="text-sm font-semibold text-slate-900">호스트 예약 관리</h3>
        </div>
        {preInbox && (preInbox as any[]).length > 0 && (
          <button
            type="button"
            className="text-[11px] px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            onClick={() => {
              const first = (preInbox as any[])[0]
              if (first?.caravan_id) {
                setOpenCaravanInbox({
                  id: first.caravan_id,
                  name: first.caravan_name ?? `Caravan ${first.caravan_id}`,
                })
              } else {
                setOpenCaravanInbox(null)
              }
            }}
          >
            새 문의 {(preInbox as any[]).reduce((sum, item: any) => sum + (item.count || 0), 0)}건
          </button>
        )}
      </div>
      {isLoading && <div>불러오는 중...</div>}
      {error && <div className="text-red-600 text-sm">예약 목록을 불러오지 못했어요.</div>}
      {!isLoading && !error && (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-2">예약 ID</th>
                <th className="py-2 pr-2">카라반</th>
                <th className="py-2 pr-2">기간</th>
                <th className="py-2 pr-2">가격</th>
                <th className="py-2 pr-2">상태</th>
                <th className="py-2 pr-2">작업</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((r: any) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-2 whitespace-nowrap text-slate-700">#{r.id}</td>
                  <td className="py-2 pr-2 whitespace-nowrap text-slate-700">
                    {r.caravan_name || `카라반 #${r.caravan_id}`}
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap text-slate-700">
                    {formatDate(r.start_date)} ~ {formatDate(r.end_date)}
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap text-slate-700">
                    {formatPrice(r.price)}
                  </td>
                  <td className="py-2 pr-2">
                    <StatusChip status={r.status} />
                  </td>
                  <td className="py-1 pr-2">
                    {r.status === 'pending' && (
                      <button
                        className="px-2.5 py-1.5 rounded-full border text-xs font-medium text-emerald-700 border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
                        aria-label={`예약 #${r.id} 승인`}
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({
                            id: r.id,
                            status: 'confirmed',
                            caravan_id: r.caravan_id,
                          })
                        }
                      >
                        승인
                      </button>
                    )}
                    {r.status === 'confirmed' && (
                      <button
                        className="px-2.5 py-1.5 rounded-full border text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
                        aria-label={`예약 #${r.id} 취소`}
                        disabled={mutation.isPending}
                        onClick={() => {
                          if (!window.confirm(`예약 #${r.id}을 정말 취소하시겠습니까?`)) return
                          mutation.mutate({
                            id: r.id,
                            status: 'cancelled',
                            caravan_id: r.caravan_id,
                          })
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
                      onClick={() =>
                        setActiveReservationId(activeReservationId === r.id ? null : r.id)
                      }
                    >
                      예약 메시지
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
          {openCaravanInbox && (
            <div className="mt-3">
              <PreMessageThread
                caravanId={openCaravanInbox.id}
                caravanName={openCaravanInbox.name}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
