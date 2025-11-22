import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { UserCog } from 'lucide-react'

export default function ProfileActions() {
  const { user, fetchMe } = useAuthStore()
  const [msg, setMsg] = useState<string | null>(null)
  const qc = useQueryClient()

  if (!user) return null

  const isAdmin = user.role === 'ADMIN'
  const isGuest = user.role === 'GUEST'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <UserCog className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">프로필 / 데모 액션</h3>
      </div>
      <div className="text-sm mb-2 text-slate-700">
        ID: {user.id} / {user.email} / role: {user.role}
      </div>
      <div className="flex gap-2 flex-wrap">
        {isAdmin && (
          <>
            <button
              className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors transition-transform active:scale-[0.98]"
              onClick={async () => {
                setMsg(null)
                try {
                  await api.put('/api/users/me/balance', { amount: 100 })
                  await fetchMe()
                  await qc.invalidateQueries({ queryKey: ['me'] })
                  setMsg('관리자 잔액 +100 충전 완료')
                } catch (e: any) {
                  setMsg(e?.message || '충전에 실패했습니다.')
                }
              }}
            >
              잔액 +100 (미세 조정)
            </button>
            <button
              className="bg-slate-900 text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-black transition-colors transition-transform active:scale-[0.98]"
              onClick={async () => {
                setMsg(null)
                try {
                  await api.put('/api/users/me/balance', { amount: 100000 })
                  await fetchMe()
                  await qc.invalidateQueries({ queryKey: ['me'] })
                  setMsg('관리자 잔액 +100,000원 충전 완료')
                } catch (e: any) {
                  setMsg(e?.message || '충전에 실패했습니다.')
                }
              }}
            >
              잔액 +100,000원 (관리자 부스트)
            </button>
            <button
              className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors transition-transform active:scale-[0.98]"
              onClick={async () => {
                setMsg(null)
                try {
                  const amount = -user.balance
                  await api.put('/api/users/me/balance', { amount })
                  await fetchMe()
                  await qc.invalidateQueries({ queryKey: ['me'] })
                  setMsg('관리자 잔액을 0원으로 초기화했습니다.')
                } catch (e: any) {
                  setMsg(e?.message || '잔액 초기화에 실패했습니다.')
                }
              }}
            >
              관리자 잔액 0원으로 초기화
            </button>
          </>
        )}

        {isGuest && (
          <>
            <button
              className="bg-slate-900 text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-black transition-colors transition-transform active:scale-[0.98]"
              onClick={async () => {
                setMsg(null)
                try {
                  await api.put('/api/users/me/balance', { amount: 100000 })
                  await fetchMe()
                  await qc.invalidateQueries({ queryKey: ['me'] })
                  setMsg('게스트 잔액 +100,000원 충전 완료')
                } catch (e: any) {
                  setMsg(e?.message || '잔액 충전에 실패했습니다.')
                }
              }}
            >
              잔액 +100,000원 (게스트 충전)
            </button>
            <button
              className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors transition-transform active:scale-[0.98]"
              onClick={async () => {
                setMsg(null)
                try {
                  const amount = -user.balance
                  await api.put('/api/users/me/balance', { amount })
                  await fetchMe()
                  await qc.invalidateQueries({ queryKey: ['me'] })
                  setMsg('게스트 잔액을 0원으로 초기화했습니다.')
                } catch (e: any) {
                  setMsg(e?.message || '잔액 초기화에 실패했습니다.')
                }
              }}
            >
              잔액 0원으로 초기화
            </button>
          </>
        )}

        <button
          className="bg-white text-red-600 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium border border-red-200 hover:bg-red-50 transition-colors transition-transform active:scale-[0.98]"
          onClick={async () => {
            if (!window.confirm('모든 사용자의 취소 상태 예약을 정리하시겠어요? 계속 진행할까요?')) return
            setMsg(null)
            try {
              const result = await api.post('/api/reservations/cleanup-cancelled')
              await qc.invalidateQueries({ queryKey: ['reservations'] })
              await qc.invalidateQueries({ queryKey: ['host-reservations'] })
              await qc.invalidateQueries({ queryKey: ['admin-reservations'] })
              setMsg(`취소된 예약 ${result.deletedCount ?? 0}건을 정리했습니다. (데모용 관리 기능)`)
            } catch (e: any) {
              setMsg(e?.message || '취소 예약 정리에 실패했습니다.')
            }
          }}
        >
          취소된 예약 모두 정리 (데모)
        </button>
      </div>
      {msg && <div className="text-xs text-gray-600 mt-2">{msg}</div>}
    </div>
  )
}

