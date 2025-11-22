import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

type Props = {
  reservationId: number
}

export default function MessageThread({ reservationId }: Props) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [content, setContent] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['messages', reservationId],
    queryFn: async () => api.get(`/api/messages?reservation_id=${reservationId}`),
    enabled: reservationId != null,
  })

  const mutation = useMutation({
    mutationFn: async () => api.post('/api/messages', { reservation_id: reservationId, content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', reservationId] })
      setContent('')
    },
    onError: (e: any) => alert(e?.message || '메시지 전송에 실패했어요.'),
  })

  return (
    <div className="border rounded-2xl p-3 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="font-medium">메시지</span>
        <span className="text-gray-500">예약 #{reservationId}</span>
      </div>
      {isLoading && <div className="text-sm">불러오는 중...</div>}
      {error && <div className="text-sm text-red-600">메시지를 불러오지 못했어요.</div>}
      {!isLoading && !error && (
        <ul className="space-y-1 max-h-48 overflow-auto mb-2">
          {(data || []).length === 0 && <li className="text-xs text-gray-600">아직 대화가 없어요.</li>}
          {(data || []).map((m: any) => {
            const isMine = user?.id === m.sender_id
            return (
              <li
                key={m.id}
                className={`text-xs border rounded-2xl px-3 py-2 ${
                  isMine
                    ? 'bg-[#0F766E]/5 border-[#0F766E]/40 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold">{isMine ? '나' : `#${m.sender_id}`}</span>
                  <span className="text-[11px] text-gray-500">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              </li>
            )
          })}
        </ul>
      )}

      <form
        className="flex gap-2 pt-1"
        onSubmit={(e) => {
          e.preventDefault()
          if (!content.trim()) {
            alert('메시지를 입력해 주세요.')
            return
          }
          mutation.mutate()
        }}
      >
        <input
          className="flex-1 border border-slate-200 rounded-2xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="메시지 입력"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-2xl border text-xs font-medium text-[#0F766E] border-[#0F766E] bg-white hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
          disabled={mutation.isPending}
        >
          전송
        </button>
      </form>
    </div>
  )
}
