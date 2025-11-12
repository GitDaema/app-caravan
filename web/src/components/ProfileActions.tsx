import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { useState } from 'react'

export default function ProfileActions() {
  const { user } = useAuthStore()
  const [msg, setMsg] = useState<string | null>(null)

  if (!user) return null

  async function refreshMe() {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    const me = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json())
    // @ts-ignore
    useAuthStore.setState({ user: me })
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-3">프로필/개발용 액션</h3>
      <div className="text-sm mb-2">ID: {user.id} / {user.email}</div>
      <div className="flex gap-2 flex-wrap">
        {/* 관리자 전용: 잔액 충전 */}
        {/* @ts-ignore role may exist from /users/me */}
        {user.role === 'admin' && (
          <button
            className="bg-indigo-600 text-white px-3 py-2 rounded"
            onClick={async () => {
              setMsg(null)
              try {
                await api.post(`/users/${user.id}/topup`, { amount: 100 })
                await refreshMe()
                setMsg('잔액 +100 충전 완료')
              } catch (e:any) {
                setMsg(e?.message || '실패')
              }
            }}
          >잔액충전(+100)</button>
        )}
      </div>
      {msg && <div className="text-xs text-gray-600 mt-2">{msg}</div>}
    </div>
  )
}

