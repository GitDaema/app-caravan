import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import PreMessageThread from './PreMessageThread'
import { MessageCircle } from 'lucide-react'

export default function GuestPreMessageInbox() {
  const { user } = useAuthStore()
  const [openCaravanInbox, setOpenCaravanInbox] = useState<{ id: number; name: string } | null>(
    null,
  )
  const [seenCount, setSeenCount] = useState<number | null>(null)

  if (!user || user.role !== 'GUEST') return null

  const { data, isLoading, error } = useQuery({
    queryKey: ['guest-pre-messages-inbox'],
    queryFn: async () => api.get('/api/pre-messages/inbox'),
  })

  if (isLoading || error) return null

  const list = (data as any[]) || []
  if (list.length === 0) return null

  const totalCount = list.reduce((sum, item: any) => sum + (item.count || 0), 0)
  const hasNew = totalCount > (seenCount ?? 0)

  const first = list[0]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-3 md:p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <MessageCircle className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-900">
            {hasNew ? '새 답장' : '답장함'} {totalCount}건
          </span>
        </div>
        <button
          type="button"
          className="text-[11px] px-2 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
          onClick={() => {
            if (first?.caravan_id) {
              setOpenCaravanInbox({
                id: first.caravan_id,
                name: first.caravan_name ?? `Caravan ${first.caravan_id}`,
              })
              setSeenCount(totalCount)
            }
          }}
        >
          문의 확인
        </button>
      </div>
      {openCaravanInbox && (
        <div className="mt-1">
          <PreMessageThread
            caravanId={openCaravanInbox.id}
            caravanName={openCaravanInbox.name}
          />
        </div>
      )}
    </div>
  )
}
