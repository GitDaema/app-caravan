import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { CarFront } from 'lucide-react'

const IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?q=80&w=1000&auto=format&fit=crop'

export default function CaravanForm() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    capacity: 2,
    amenities: '',
    location: '',
    price_per_day: 100000,
  })
  const [imageError, setImageError] = useState(false)

  const mutation = useMutation({
    mutationFn: async () => api.post('/api/caravans', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caravans'] })
      setForm({
        name: '',
        description: '',
        imageUrl: '',
        capacity: 2,
        amenities: '',
        location: '',
        price_per_day: 100000,
      })
      setImageError(false)
    },
  })

  if (!user || user.role !== 'HOST') return null

  const previewUrl = !imageError && form.imageUrl ? form.imageUrl : ''

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <CarFront className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">카라반 등록</h3>
      </div>
      <div className="grid gap-3">
        <input
          className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="카라반 이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="간단한 설명"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid gap-2">
          <label className="text-xs font-medium text-slate-700">대표 이미지 주소 (URL)</label>
          <input
            type="text"
            className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
            placeholder="예: https://images.unsplash.com/..."
            value={form.imageUrl}
            onChange={(e) => {
              setForm({ ...form, imageUrl: e.target.value })
              setImageError(false)
            }}
          />
          <div className="w-full h-48 rounded-xl bg-slate-200 mt-2 overflow-hidden flex items-center justify-center">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="카라반 미리보기"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = IMAGE_PLACEHOLDER
                  setImageError(true)
                }}
              />
            )}
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">최대 인원 (명)</label>
          <input
            className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
            placeholder="예: 4"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: Number(e.target.value) || 1 })
            }
          />
        </div>

        <input
          className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="주요 편의시설 (예: 침대 2개, 샤워실, 바베큐 공간)"
          value={form.amenities}
          onChange={(e) => setForm({ ...form, amenities: e.target.value })}
        />
        <input
          className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="위치 (예: Seoul, KR / Busan, KR)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <div className="grid gap-1">
          <label className="text-xs font-medium text-slate-700">1박당 가격 (원)</label>
          <input
            className="w-full h-12 border border-slate-200 bg-slate-50 rounded-xl px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
            placeholder="예: 80000"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.price_per_day ? String(form.price_per_day) : ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, '')
              setForm({
                ...form,
                price_per_day: digits ? Number(digits) : 0,
              })
            }}
          />
        </div>

        <button
          className="mt-1 bg-[#0F766E] text-white px-3 py-2 rounded-2xl text-sm font-medium hover:bg-[#115e57] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md"
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

