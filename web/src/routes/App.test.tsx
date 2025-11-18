import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import { useAuthStore } from '../store/auth'
import { withProviders } from '../test/utils'

vi.mock('../lib/api', () => {
  const api = {
    get: vi.fn(async (path: string) => {
      if (path === '/users/me') return { balance: 100000 }
      if (path === '/api/reservations/admin/all') return []
      if (path === '/api/reservations/host') return []
      if (path === '/api/reservations') return []
      if (path.startsWith('/api/caravans/')) return { ranges: [] }
      if (path.startsWith('/api/caravans?')) return []
      if (path === '/dev/overview') return { caravans: [], reservations: [] }
      return []
    }),
    post: vi.fn(async () => ({})),
    put: vi.fn(async () => ({})),
  }
  return {
    API_BASE: '',
    api,
  }
})

describe('/app dashboard access control', () => {
  it('hides host/admin panels when not logged in', () => {
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null,
    } as any)

    render(withProviders(<Dashboard />))

    expect(screen.queryByText('호스트 예약 관리')).not.toBeInTheDocument()
    expect(screen.queryByText('전체 예약 (관리자)')).not.toBeInTheDocument()
  })

  it('shows host panel for HOST user', () => {
    useAuthStore.setState({
      user: {
        id: 2,
        email: 'host@example.com',
        fullName: 'Host User',
        role: 'HOST',
        balance: 0,
      },
      loading: false,
      error: null,
    } as any)

    render(withProviders(<Dashboard />))

    expect(screen.getByText('호스트 예약 관리')).toBeInTheDocument()
  })

  it('shows admin reservations for ADMIN user', () => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'ADMIN',
        balance: 0,
      },
      loading: false,
      error: null,
    } as any)

    render(withProviders(<Dashboard />))

    expect(screen.getByText('전체 예약 (관리자)')).toBeInTheDocument()
    expect(screen.getByText('잔액 충전 (+100)')).toBeInTheDocument()
  })
})

