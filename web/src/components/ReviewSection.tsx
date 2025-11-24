import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useUIStore } from '../store/ui'
import { useAuthStore } from '../store/auth'
import { MessageCircle } from 'lucide-react'

export default function ReviewSection() {
  const { selectedCaravanId } = useUIStore()
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', selectedCaravanId],
    queryFn: async () => api.get(`/api/reviews?caravan_id=${selectedCaravanId}`),
    enabled: selectedCaravanId != null,
  })

  const { data: reservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => api.get('/api/reservations'),
  })

  const canReview = useMemo(() => {
    if (!user || !selectedCaravanId || !reservations) return false
    const now = new Date()
    return (reservations as any[]).some((r) => {
      if (r.caravan_id !== selectedCaravanId) return false
      if (r.status !== 'confirmed') return false
      const end = new Date(r.end_date)
      if (Number.isNaN(end.getTime())) return false
      return end.getTime() < now.getTime()
    })
  }, [user, selectedCaravanId, reservations])

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post('/api/reviews', {
        caravan_id: selectedCaravanId,
        rating: Number(rating),
        comment,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', selectedCaravanId] })
      setComment('')
    },
    onError: (e: any) => alert(e?.message || '리뷰 생성에 실패했습니다.'),
  })

  if (!selectedCaravanId) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
        <div className="flex items-center mb-3">
          <MessageCircle className="w-5 h-5 text-slate-400 mr-2" />
          <h3 className="text-sm font-semibold text-slate-900">카라반 리뷰</h3>
        </div>
        <div className="text-sm text-gray-600">
          리뷰를 보려면 카라반을 먼저 선택해 주세요.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <MessageCircle className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">카라반 리뷰</h3>
      </div>
      {isLoading && <div className="text-sm">불러오는 중...</div>}
      {error && <div className="text-sm text-red-600">리뷰를 불러오지 못했습니다.</div>}
      {!isLoading && !error && (
        <ul className="space-y-2 mb-4 text-sm">
          {(data || []).length === 0 && (
            <li className="text-gray-500">아직 등록된 리뷰가 없습니다.</li>
          )}
          {(data || []).map((r: any) => (
            <li
              key={r.id}
              className="border rounded-2xl p-2.5 flex justify-between items-start gap-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div>
                <div className="font-medium">별점 {r.rating}/5</div>
                <div className="text-gray-700 whitespace-pre-wrap break-words">
                  {r.comment}
                </div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                이용자 #{r.user_id}
                <br />
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        canReview ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!comment.trim()) {
                alert('리뷰 내용을 입력해 주세요.')
                return
              }
              createMutation.mutate()
            }}
          >
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-700">별점</label>
              <select
                className="border border-slate-200 rounded-2xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="border border-slate-200 rounded-2xl p-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
              placeholder="이번 카라반 여행은 어땠나요?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="self-start px-3 py-2 rounded-2xl border text-xs sm:text-sm font-medium text-[#0F766E] border-[#0F766E] bg-white hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              type="submit"
              disabled={createMutation.isPending}
            >
              리뷰 남기기
            </button>
          </form>
        ) : (
          <div className="text-sm text-gray-600">
            종료된 예약이 있는 카라반에만 리뷰를 남길 수 있습니다. 여행이 끝난 후에
            다시 시도해 주세요.
          </div>
        )
      ) : (
        <div className="text-sm text-gray-600">로그인 후 리뷰를 남길 수 있어요.</div>
      )}
    </div>
  )
}

