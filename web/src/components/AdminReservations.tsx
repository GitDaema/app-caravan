import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function AdminReservations() {
  const { user } = useAuthStore()

  if (!user || user.role !== 'admin') return null

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => api.get('/api/reservations/admin/all'),
  })

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">전체 예약(관리자)</h3>
      {isLoading && <div>불러오는 중...</div>}
      {error && <div className="text-red-600 text-sm">불러오기 실패</div>}
      {!isLoading && !error && (
        <ul className="space-y-1 text-sm">
          {(data || []).map((r: any) => (
            <li key={r.id} className="border rounded p-2 flex justify-between">
              <span>
                #{r.id} 사용자 {r.user_id} / 카라반 {r.caravan_id}
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

