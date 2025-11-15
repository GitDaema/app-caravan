import Header from './components/Header'
import { ReactNode, useEffect } from 'react'
import { api } from './lib/api'
import { useAuthStore } from './store/auth'
import PwaInstallBanner from './components/PwaInstallBanner'
import OfflineBanner from './components/OfflineBanner'

export default function App({ children }: { children?: ReactNode }) {
  const { user } = useAuthStore()
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    // ?�큰?� ?�는???�토?��? 비어 ?�으�?/users/me�??�이?�레?�션
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
      <PwaInstallBanner />
      <OfflineBanner />
      <main className="container mx-auto p-4 flex-1">{children}</main>
    </div>
  )
}

