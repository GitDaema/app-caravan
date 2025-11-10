import { create } from 'zustand'
import { signInWithGooglePopup } from '../lib/firebase'
import { API_BASE } from '../lib/api'

type User = { id: number; email: string; name?: string }

type State = {
  user: User | null
  accessToken: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => void
}

export const useAuthStore = create<State>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  signInWithGoogle: async () => {
    const { idToken } = await signInWithGooglePopup()
    const res = await fetch(`${API_BASE}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    const data = await res.json()
    localStorage.setItem('accessToken', data.access_token)
    set({ accessToken: data.access_token, user: data.user })
  },
  signOut: () => {
    localStorage.removeItem('accessToken')
    set({ user: null, accessToken: null })
  }
}))

