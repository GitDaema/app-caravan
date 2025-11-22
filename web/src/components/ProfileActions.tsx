import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function ProfileActions() {
  const { user, fetchMe } = useAuthStore()
  const [msg, setMsg] = useState<string | null>(null)
  const qc = useQueryClient()

  if (!user) return null

  const isAdmin = user.role === 'ADMIN'
  const isGuest = user.role === 'GUEST'

  return (
    <div className="bg-white rounded-2xl shadow-md ring-1 ring-gray-900/5 p-4 md:p-5">
      <h3 className="font-semibold mb-3">프로필 / 데모 액션</h3>
      <div className="text-sm mb-2">
        ID: {user.id} / {user.email} / role: {user.role}
      </div>
      <div className="flex gap-2 flex-wrap">
        {isAdmin && (
          <>
            <button
              className="bg-[#0F766E] text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-[#115e57] shadow-sm hover:shadow-md transition-colors"
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
              잔액 +100 (세밀 조정)
            </button>
            <button
              className="bg-[#0F766E] text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-[#115e57] shadow-sm hover:shadow-md transition-colors"
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
              잔액 +100,000원 (관리자 테스트)
            </button>
            <button
              className="bg-slate-900 text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-slate-950 shadow-sm hover:shadow-md transition-colors"
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
              className="bg-[#0F766E] text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-[#115e57] shadow-sm hover:shadow-md transition-colors"
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
              잔액 +100,000원 (테스트 충전)
            </button>
            <button
              className="bg-slate-100 text-slate-800 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium hover:bg-slate-200 transition-colors"
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
          className="bg-rose-50 text-rose-700 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium border border-rose-200 hover:bg-rose-100 transition-colors"
          onClick={async () => {
            if (!window.confirm('모든 사용자에 대해 상태가 cancelled 인 예약을 삭제합니다. 계속할까요?')) return
            setMsg(null)
            try {
              const result = await api.post('/api/reservations/cleanup-cancelled')
              await qc.invalidateQueries({ queryKey: ['reservations'] })
              await qc.invalidateQueries({ queryKey: ['host-reservations'] })
              await qc.invalidateQueries({ queryKey: ['admin-reservations'] })
              setMsg(
                `취소된 예약 ${result.deletedCount ?? 0}건을 삭제했습니다. (테스트용 정리 기능)`,
              )
            } catch (e: any) {
              setMsg(e?.message || '취소된 예약 삭제에 실패했습니다.')
            }
          }}
        >
          취소된 예약 모두 삭제 (테스트)
        </button>
      </div>
      {msg && <div className="text-xs text-gray-600 mt-2">{msg}</div>}
    </div>
  )
}
