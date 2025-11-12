import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { useUIStore } from '../store/ui'

export default function CaravanList() {
  const { user } = useAuthStore()
  const { selectedCaravanId, setSelectedCaravanId } = useUIStore()
  const [filters, setFilters] = useState({ location: '', min_price: '', max_price: '', min_capacity: '' })
  const query = new URLSearchParams()
  if (filters.location) query.set('location', filters.location)
  if (filters.min_price) query.set('min_price', filters.min_price)
  if (filters.max_price) query.set('max_price', filters.max_price)
  if (filters.min_capacity) query.set('min_capacity', filters.min_capacity)
  const { data, isLoading } = useQuery({
    queryKey: ['caravans', query.toString()],
    queryFn: async () => api.get(`/caravans?${query.toString()}`),
  })

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">카라반 목록</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <input className="border p-2" placeholder="위치" value={filters.location} onChange={e=>setFilters({...filters, location: e.target.value})} />
        <input className="border p-2" placeholder="최소 가격" value={filters.min_price} onChange={e=>setFilters({...filters, min_price: e.target.value})} />
        <input className="border p-2" placeholder="최대 가격" value={filters.max_price} onChange={e=>setFilters({...filters, max_price: e.target.value})} />
        <input className="border p-2" placeholder="최소 인원" value={filters.min_capacity} onChange={e=>setFilters({...filters, min_capacity: e.target.value})} />
      </div>
      {isLoading ? (
        <div>불러오는 중…</div>
      ) : (
        <ul className="space-y-2">
          {(data || []).map((c:any) => (
            <li key={c.id} className={`border rounded p-2 flex items-center gap-3 justify-between text-sm ${selectedCaravanId===c.id ? 'ring-2 ring-sky-500' : ''}`}>
              <div className="flex gap-3 items-center">
                <span className="font-medium">{c.name}</span>
                <span className="text-gray-500">{c.location}</span>
                <span>{c.capacity}인</span>
                <span>₩{c.price_per_day}/일</span>
                {/* 내 캐러밴 표시 */}
                {/* @ts-ignore */}
                {user && c.host_id === user.id && <span className="text-emerald-700">내 캐러밴</span>}
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 rounded border text-sky-700 border-sky-600 hover:bg-sky-50"
                  onClick={() => setSelectedCaravanId(c.id)}
                  aria-label={`이 카라반 예약 선택: ${c.name}`}
                >예약</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
