import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { useUIStore } from '../store/ui'
import { Search } from 'lucide-react'
import PreMessageThread from './PreMessageThread'

type CaravanListProps = {
  onBookClick?: (caravan: any) => void
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?q=80&w=1000&auto=format&fit=crop'

export default function CaravanList({ onBookClick }: CaravanListProps) {
  const { user } = useAuthStore()
  const { selectedCaravanId, setSelectedCaravanId } = useUIStore()
  const [filters, setFilters] = useState({
    location: '',
    min_price: '',
    max_price: '',
    min_capacity: '',
  })
  const [openInquiryId, setOpenInquiryId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['caravans'],
    queryFn: async () => api.get('/api/caravans'),
  })

  const caravans = (data || [])
    .filter((c: any) => c.status !== 'maintenance')
    .filter((c: any) => {
      let ok = true
      const term = filters.location.trim()
      if (term) {
        const lower = term.toLowerCase()
        const name = (c.name || '').toLowerCase()
        const loc = (c.location || '').toLowerCase()
        ok = name.includes(lower) || loc.includes(lower)
      }
      if (filters.min_price) {
        const min = Number(filters.min_price)
        if (!Number.isNaN(min)) {
          ok = ok && typeof c.price_per_day === 'number' && c.price_per_day >= min
        }
      }
      if (filters.max_price) {
        const max = Number(filters.max_price)
        if (!Number.isNaN(max)) {
          ok = ok && typeof c.price_per_day === 'number' && c.price_per_day <= max
        }
      }
      if (filters.min_capacity) {
        const minCap = Number(filters.min_capacity)
        if (!Number.isNaN(minCap)) {
          ok = ok && typeof c.capacity === 'number' && c.capacity >= minCap
        }
      }
      return ok
    })

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <Search className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">카라반 목록</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="이름 또는 위치"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="최소 가격"
          value={filters.min_price}
          onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
        />
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="최대 가격"
          value={filters.max_price}
          onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
        />
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="최소 인원"
          value={filters.min_capacity}
          onChange={(e) => setFilters({ ...filters, min_capacity: e.target.value })}
        />
      </div>
      {isLoading ? (
        <div>불러오는 중...</div>
      ) : caravans.length === 0 ? (
        <div className="text-sm text-gray-500">조건에 맞는 카라반이 없습니다.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {caravans.map((c: any) => {
            const imageSrc = c.imageUrl || FALLBACK_IMAGE
            const isSelected = selectedCaravanId === c.id
            return (
              <div
                key={c.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-md transition-transform duration-150 hover:-translate-y-1 ${
                  isSelected ? 'border-[#0F766E] shadow-lg' : 'border-slate-200'
                }`}
              >
                <div className="relative w-full h-48 bg-slate-200">
                  <img
                    src={imageSrc}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = FALLBACK_IMAGE
                    }}
                  />
                </div>
                <div className="p-4 md:p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.location}</div>
                    </div>
                    {user && c.host_id === user.id && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                        내 카라반
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>최대 {c.capacity}명</span>
                    <span className="font-semibold text-slate-900">
                      {c.price_per_day?.toLocaleString?.('ko-KR') ?? c.price_per_day}원/박
                    </span>
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full border text-xs font-medium text-slate-600 border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setOpenInquiryId(openInquiryId === c.id ? null : c.id)
                      }}
                      aria-label={`카라반 문의: ${c.name}`}
                    >
                      문의
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full border text-xs font-medium text-[#0F766E] border-[#0F766E] bg-white hover:bg-teal-50 transition-colors"
                      onClick={() => {
                        setSelectedCaravanId(c.id)
                        onBookClick?.(c)
                      }}
                      aria-label={`카라반 예약 선택: ${c.name}`}
                    >
                      예약
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {openInquiryId && (
        <div className="mt-4">
          <PreMessageThread caravanId={openInquiryId} />
        </div>
      )}
    </div>
  )
}

