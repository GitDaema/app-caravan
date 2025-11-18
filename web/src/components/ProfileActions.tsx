import { useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function ProfileActions() {
  const { user, fetchMe } = useAuthStore()
  const [msg, setMsg] = useState<string | null>(null)

  if (!user) return null

  const isAdmin = user.role === 'ADMIN'

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
                setMsg('잔액 +100 충전 완료')
              } catch (e: any) {
                setMsg(e?.message || '충전에 실패했습니다.')
              }
            }}
          >
            잔액 충전 (+100)
          </button>
        )}
      </div>
      {msg && <div className="text-xs text-gray-600 mt-2">{msg}</div>}
    </div>
  )
}

