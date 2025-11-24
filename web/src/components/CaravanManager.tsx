import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { CarFront } from 'lucide-react'

type Mode = 'host' | 'admin'

type CaravanManagerProps = {
  mode: Mode
}

type CaravanFormState = {
  name: string
  description: string
  imageUrl: string
  capacity: number
  amenities: string
  location: string
  price_per_day: number
}

export default function CaravanManager({ mode }: CaravanManagerProps) {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const isHost = !!user && user.role === 'HOST'
  const isAdmin = !!user && user.role === 'ADMIN'

  if (mode === 'host' && !isHost) return null
  if (mode === 'admin' && !isAdmin) return null

  const { data, isLoading, error } = useQuery({
    queryKey: ['caravans'],
    queryFn: async () => api.get('/api/caravans'),
    enabled: isHost || isAdmin,
  })

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<CaravanFormState | null>(null)

  const updateMutation = useMutation({
    mutationFn: async (vars: { id: number; data: CaravanFormState }) =>
      api.put(`/api/caravans/${vars.id}`, vars.data),
    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === 'caravans',
      })
      setEditingId(null)
      setEditForm(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/api/caravans/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === 'caravans',
      })
      if (editingId != null) {
        setEditingId(null)
        setEditForm(null)
      }
    },
  })

  const handleStartEdit = (caravan: any) => {
    setEditingId(caravan.id)
    setEditForm({
      name: caravan.name || '',
      description: caravan.description || '',
      imageUrl: caravan.imageUrl || '',
      capacity: caravan.capacity || 1,
      amenities: caravan.amenities || '',
      location: caravan.location || '',
      price_per_day: caravan.price_per_day || 0,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const caravans = (data || []) as any[]

  const filtered = caravans.filter((c) => {
    if (mode === 'host' && isHost) {
      return c.host_id === user!.id
    }
    if (mode === 'admin' && isAdmin) {
      return true
    }
    return false
  })

  if (!isLoading && !error && filtered.length === 0) {
    if (mode === 'host') {
      return null
    }
  }

  const title =
    mode === 'host' ? '내 카라반 관리' : '카라반 목록 (관리자 편집)'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5 mt-4">
      <div className="flex items-center mb-3">
        <CarFront className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {isLoading && <div>불러오는 중...</div>}
      {error && (
        <div className="text-red-600 text-sm">
          카라반 정보를 불러오지 못했습니다.
        </div>
      )}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.map((c) => {
            const isEditing = editingId === c.id && editForm
            const canEdit =
              isAdmin || (isHost && c.host_id === user!.id)

            if (isEditing) {
              return (
                <div
                  key={c.id}
                  className="border border-slate-200 rounded-2xl p-3 md:p-4 bg-slate-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-semibold text-slate-500">
                      편집 중: #{c.id}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-black disabled:opacity-50"
                        disabled={updateMutation.isPending}
                        onClick={() => {
                          if (!editForm) return
                          updateMutation.mutate({
                            id: c.id,
                            data: editForm,
                          })
                        }}
                      >
                        {updateMutation.isPending ? '저장 중...' : '저장'}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate-600 hover:bg-slate-100"
                        onClick={handleCancelEdit}
                        disabled={updateMutation.isPending}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      className="h-9 border border-slate-200 bg-white rounded-lg px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      placeholder="이름"
                      value={editForm?.name ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, name: e.target.value }
                            : prev,
                        )
                      }
                    />
                    <input
                      className="h-9 border border-slate-200 bg-white rounded-lg px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      placeholder="위치"
                      value={editForm?.location ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, location: e.target.value }
                            : prev,
                        )
                      }
                    />
                    <input
                      className="h-9 border border-slate-200 bg-white rounded-lg px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      placeholder="이미지 URL"
                      value={editForm?.imageUrl ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, imageUrl: e.target.value }
                            : prev,
                        )
                      }
                    />
                    <input
                      className="h-9 border border-slate-200 bg-white rounded-lg px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      placeholder="편의시설"
                      value={editForm?.amenities ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? { ...prev, amenities: e.target.value }
                            : prev,
                        )
                      }
                    />
                    <input
                      className="h-9 border border-slate-200 bg-white rounded-lg px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      placeholder="최대 인원"
                      type="number"
                      min={1}
                      value={editForm?.capacity ?? 1}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                capacity:
                                  Number(e.target.value) || prev.capacity,
                              }
                            : prev,
                        )
                      }
                    />
                    <input
                      className="h-9 border border-slate-200 bg-white rounded-lg px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]"
                      placeholder="1박당 가격 (원)"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={
                        editForm?.price_per_day
                          ? String(editForm.price_per_day)
                          : ''
                      }
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^\d]/g, '')
                        setEditForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                price_per_day: digits
                                  ? Number(digits)
                                  : prev.price_per_day,
                              }
                            : prev,
                        )
                      }}
                    />
                  </div>
                </div>
              )
            }

            return (
              <div
                key={c.id}
                className="border border-slate-200 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">
                    #{c.id} {c.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    위치: {c.location}{' '}
                    {c.status === 'maintenance' && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-200 text-[10px] text-slate-700">
                        숨김 처리됨
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    최대 {c.capacity}명 /{' '}
                    {c.price_per_day?.toLocaleString?.('ko-KR') ??
                      c.price_per_day}
                    원/박
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full border text-xs font-medium text-[#0F766E] border-[#0F766E] hover:bg-teal-50 disabled:opacity-50"
                      onClick={() => handleStartEdit(c)}
                      disabled={updateMutation.isPending || deleteMutation.isPending}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-full border text-xs font-medium text-red-700 border-red-200 hover:bg-red-50 disabled:opacity-50"
                      onClick={() => {
                        if (
                          !window.confirm(
                            '이 카라반을 목록에서 숨기시겠습니까? 기존 예약에는 영향을 주지 않습니다.',
                          )
                        ) {
                          return
                        }
                        deleteMutation.mutate(c.id)
                      }}
                      disabled={updateMutation.isPending || deleteMutation.isPending}
                    >
                      숨기기
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

