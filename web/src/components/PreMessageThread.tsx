import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { MessageCircle } from 'lucide-react'

type Props = {
  caravanId: number
  caravanName?: string | null
}

export default function PreMessageThread({ caravanId, caravanName }: Props) {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [content, setContent] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['pre-messages', caravanId],
    queryFn: async () => api.get(`/api/pre-messages?caravan_id=${caravanId}`),
    enabled: caravanId != null,
  })

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/api/pre-messages', { caravan_id: caravanId, content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pre-messages', caravanId] })
      setContent('')
    },
    onError: (e: any) => alert(e?.message || '문의 메시지 전송에 실패했습니다.'),
  })

  const caravanLabel = caravanName ? caravanName : `Caravan #${caravanId}`

  if (!user) {
    return (
      <div className="border rounded-2xl p-3 bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
        <div className="flex items-center gap-2 mb-2 text-sm">
          <MessageCircle className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-900">
            호스트에게 문의 · {caravanLabel}
          </span>
        </div>
        <div className="text-xs text-slate-600">
          로그인 후 호스트에게 문의 메시지를 보낼 수 있습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-2xl p-3 bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-900">
            호스트에게 문의 · {caravanLabel}
          </span>
        </div>
      </div>
      {isLoading && <div className="text-sm">불러오는 중...</div>}
      {error && (
        <div className="text-sm text-red-600">
          문의 메시지를 불러오지 못했습니다.
        </div>
      )}
      {!isLoading && !error && (
        <ul className="space-y-1 max-h-48 overflow-auto mb-2">
          {(data || []).length === 0 && (
            <li className="text-xs text-gray-600">
              아직 주고받은 문의 메시지가 없습니다.
            </li>
          )}
          {(data || []).map((m: any) => {
            const isMine = user?.id === m.sender_id
            const isHost = user?.role === 'HOST'

            let senderLabel = ''
            if (isMine) {
              senderLabel = '나'
            } else if (isHost) {
              senderLabel = `게스트 #${m.sender_id}`
            } else {
              senderLabel = '호스트'
            }

            return (
              <li
                key={m.id}
                className={`text-xs border rounded-2xl px-3 py-2 ${
                  isMine
                    ? 'bg-[#0F766E]/5 border-[#0F766E]/40 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-center gap-2 mb-0.5">
                  <span className="font-semibold">{senderLabel}</span>
                  <span className="text-[11px] text-gray-500">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
            alert('문의 내용을 입력해 주세요.')
            return
          }
          mutation.mutate()
        }}
      >
        <input
          className="flex-1 border border-slate-200 rounded-2xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors"
          placeholder="호스트에게 궁금한 점을 남겨 보세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-2xl border text-xs font-medium text-[#0F766E] border-[#0F766E] bg-white hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          disabled={mutation.isPending}
        >
          전송
        </button>
      </form>
    </div>
  )
}

