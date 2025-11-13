import { useAuthStore } from '../store/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/api'

export default function Login() {
  const { signInWithGoogle } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)

  async function signInLocal() {
    try {
      setError(null)
      const form = new URLSearchParams()
      form.set('username', email)
      form.set('password', password)
      const res = await fetch(`${API_BASE}/login/access-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })
      if (!res.ok) throw new Error('로그인 실패')
      const data = await res.json()
      localStorage.setItem('accessToken', data.access_token)
      // 사용자 정보 조회
      const me = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      }).then(r => r.json())
      useAuthStore.setState({ accessToken: data.access_token, user: me })
      navigate('/app')
    } catch (e: any) {
      setError(e?.message || '로그인 실패')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">로그인</h2>
      <button onClick={async () => {
        try {
          await signInWithGoogle()
          navigate('/app')
        } catch (e:any) {
          setError(e?.message || 'Google 로그인 실패')
        }
      }} className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
        Google로 로그인
      </button>
      <div className="mt-6 max-w-sm">
        <div className="text-sm text-gray-500 mb-2">또는 로컬 계정(개발용)</div>
        <input className="border p-2 w-full mb-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full mb-2" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={signInLocal} className="text-white bg-gray-800 hover:bg-black px-4 py-2 rounded w-full">로컬 로그인</button>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </div>
    </div>
  )
}

