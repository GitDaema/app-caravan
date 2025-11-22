import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { ShieldCheck } from 'lucide-react'

export default function AdminReservations() {
  const { user } = useAuthStore()
  const isAdmin = !!user && user.role === 'ADMIN'

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => api.get('/api/reservations/admin/all'),
    enabled: isAdmin,
  })

  if (!isAdmin) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <ShieldCheck className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">전체 예약 (관리자)</h3>
      </div>
      {isLoading && <div>불러오는 중...</div>}
      {error && <div className="text-red-600 text-sm">예약 정보를 불러오지 못했어요.</div>}
      {!isLoading && !error && (
        <ul className="space-y-1 text-sm">
          {(data || []).map((r: any) => (
            <li
              key={r.id}
              className="border rounded-2xl p-2.5 flex justify-between border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <span>
                #{r.id} 사용자 #{r.user_id} / 카라반 #{r.caravan_id}
              </span>
              <span>
                {String(r.start_date)} ~ {String(r.end_date)} [{r.status}]
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

