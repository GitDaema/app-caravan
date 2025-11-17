import { create } from 'zustand'
import { api, API_BASE } from '../lib/api'

export type User = {
  id: number
  email: string
  fullName?: string
  role: 'GUEST' | 'HOST' | 'ADMIN'
  balance: number
}

type State = {
  user: User | null
  loading: boolean
  error: string | null
  fetchMe: () => Promise<void>
  loginLocal: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<State>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchMe: async () => {
    try {
      set({ loading: true, error: null })
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      if (!res.ok) {
        set({ user: null, loading: false })
        return
      }
      const data = await res.json()
      set({ user: data.user ?? data, loading: false })
    } catch (e: any) {
      set({ error: e?.message || '세션 정보를 가져오지 못했습니다.', loading: false })
    }
  },
  loginLocal: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || '로그인에 실패했습니다.')
      }
      const data = await res.json()
      set({ user: data.user, loading: false })
    } catch (e: any) {
      set({ error: e?.message || '로그인에 실패했습니다.', loading: false })
      throw e
    }
  },
  logout: async () => {
    await api.post('/auth/logout')
    set({ user: null })
  },
}))
