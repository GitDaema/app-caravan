import Header from './components/Header'
import { ReactNode, useEffect } from 'react'
import { api } from './lib/api'
import { useAuthStore } from './store/auth'

export default function App({ children }: { children?: ReactNode }) {
  const { user } = useAuthStore()
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    // 토큰은 있는데 스토어가 비어 있으면 /users/me로 하이드레이션
    if (token && !user) {
      api.get('/users/me').then((me) => {
        // @ts-ignore
        useAuthStore.setState({ user: me })
      }).catch(() => {/* ignore */})
    }
  }, [user])
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="container mx-auto p-4 flex-1">{children}</main>
    </div>
  )
}
