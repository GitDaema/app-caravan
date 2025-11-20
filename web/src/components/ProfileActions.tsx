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
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">프로필 / 데모 액션</h3>
      <div className="text-sm mb-2">
        ID: {user.id} / {user.email} / role: {user.role}
      </div>
      <div className="flex gap-2 flex-wrap">
        {isAdmin && (
          <button
            className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
            onClick={async () => {
              setMsg(null)
              try {
                await api.put('/api/users/me/balance', { amount: 100 })
                await fetchMe()
                await qc.invalidateQueries({ queryKey: ['me'] })
                setMsg('잔액 +100 충전 완료')
              } catch (e: any) {
                setMsg(e?.message || '충전에 실패했습니다.')
              }
            }}
          >
            잔액 충전 (+100)
          </button>
        )}

        {isGuest && (
          <>
            <button
              className="bg-sky-600 text-white px-3 py-2 rounded text-sm hover:bg-sky-700"
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
              className="bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm hover:bg-gray-300"
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
      </div>
      {msg && <div className="text-xs text-gray-600 mt-2">{msg}</div>}
    </div>
  )
}
