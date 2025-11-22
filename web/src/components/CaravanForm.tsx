import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function CaravanForm() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    description: '',
    capacity: 2,
    amenities: '',
    location: '',
    price_per_day: 100000,
  })

  const mutation = useMutation({
    mutationFn: async () => api.post('/api/caravans', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caravans'] })
      setForm({
        name: '',
        description: '',
        capacity: 2,
        amenities: '',
        location: '',
        price_per_day: 100000,
      })
    },
  })

  if (!user || user.role !== 'HOST') return null

  return (
    <div className="bg-white rounded-2xl shadow-md ring-1 ring-gray-900/5 p-4 md:p-5">
      <h3 className="font-semibold mb-3">카라반 등록</h3>
      <div className="grid gap-2">
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="설명"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="수용 인원"
          type="number"
          min={1}
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) || 1 })}
        />
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="편의 시설"
          value={form.amenities}
          onChange={(e) => setForm({ ...form, amenities: e.target.value })}
        />
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="위치 (도시 등)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          className="border border-slate-200 bg-slate-50 rounded-2xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="1일 가격 (원)"
          type="number"
          min={0}
          value={form.price_per_day}
          onChange={(e) => setForm({ ...form, price_per_day: Number(e.target.value) || 0 })}
        />
        <button
          className="bg-[#0F766E] text-white px-3 py-2 rounded-2xl text-sm font-medium hover:bg-[#115e57] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? '등록 중...' : '등록'}
        </button>
        {mutation.isError && (
          <p className="text-red-600 text-sm">
            오류: {(mutation.error as any)?.message || '등록에 실패했습니다.'}
          </p>
        )}
      </div>
    </div>
  )
}
