import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useUIStore } from '../store/ui'
import { useAuthStore } from '../store/auth'

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
    onError: (e: any) => alert(e?.message || '리뷰 저장에 실패했어요.'),
  })

  if (!selectedCaravanId) {
    return (
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">카라반 리뷰</h3>
        <div className="text-sm text-gray-600">리뷰를 보려면 카라반을 선택해 주세요.</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">카라반 리뷰</h3>
      {isLoading && <div className="text-sm">불러오는 중...</div>}
      {error && <div className="text-sm text-red-600">리뷰를 불러오지 못했어요.</div>}
      {!isLoading && !error && (
        <ul className="space-y-2 mb-4 text-sm">
          {(data || []).length === 0 && <li className="text-gray-500">아직 등록된 리뷰가 없어요.</li>}
          {(data || []).map((r: any) => (
            <li key={r.id} className="border rounded p-2 flex justify-between items-start gap-2">
              <div>
                <div className="font-medium">별점 {r.rating}/5</div>
                <div className="text-gray-700 whitespace-pre-wrap break-words">{r.comment}</div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                사용자 #{r.user_id}
                <br />
                {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {user ? (
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
              className="border rounded px-2 py-1 text-sm"
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
            className="border rounded p-2 text-sm"
            placeholder="이 카라반은 어땠나요?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="self-start px-3 py-1 rounded border text-sky-700 border-sky-600 hover:bg-sky-50 disabled:opacity-50"
            type="submit"
            disabled={createMutation.isPending}
          >
            리뷰 남기기
          </button>
        </form>
      ) : (
        <div className="text-sm text-gray-600">로그인하면 리뷰를 남길 수 있어요.</div>
      )}
    </div>
  )
}
