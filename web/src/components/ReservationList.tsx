import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function ReservationList() {
  const { data, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => api.get('/reservations'),
  })

  if (isLoading) return <div className="bg-white rounded shadow p-4">불러오는 중...</div>

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">내 예약</h3>
      <ul className="space-y-2">
        {(data || []).map((r: any) => (
          <li key={r.id} className="border rounded p-2 flex justify-between">
            <span>#{r.id} Caravan {r.caravan_id}</span>
            <span>{r.start_date} → {r.end_date} ({r.price})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

