import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function CaravanForm() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', description: '', capacity: 2, amenities: '', location: '', price_per_day: 100,
  })
  const mutation = useMutation({
    mutationFn: async () => api.post('/caravans', form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['caravans'] })
  })

  // @ts-ignore
  if (!user || user.role !== 'host') return null

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">카라반 등록</h3>
      <div className="grid gap-2">
        <input className="border p-2" placeholder="이름" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="border p-2" placeholder="설명" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <input className="border p-2" placeholder="수용 인원" type="number" value={form.capacity} onChange={e=>setForm({...form, capacity:Number(e.target.value)})} />
        <input className="border p-2" placeholder="편의 시설" value={form.amenities} onChange={e=>setForm({...form, amenities:e.target.value})} />
        <input className="border p-2" placeholder="위치(도시)" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} />
        <input className="border p-2" placeholder="일일 가격" type="number" value={form.price_per_day} onChange={e=>setForm({...form, price_per_day:Number(e.target.value)})} />
        <button className="bg-teal-600 text-white px-3 py-2 rounded" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? '등록 중…' : '등록'}
        </button>
        {mutation.isError && <p className="text-red-600 text-sm">오류: {(mutation.error as any)?.message || '실패'}</p>}
      </div>
    </div>
  )
}

