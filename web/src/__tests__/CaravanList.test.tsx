import { render, screen } from '@testing-library/react'
import { withProviders } from '../test/utils'
import CaravanList from '../components/CaravanList'

describe('CaravanList', () => {
  test('목록 렌더링', async () => {
    const caravans = [
      { id: 1, name: 'A', location: 'Seoul', capacity: 2, price_per_day: 100, host_id: 10, status: 'available', description: '', amenities: '' },
      { id: 2, name: 'B', location: 'Busan', capacity: 4, price_per_day: 150, host_id: 11, status: 'available', description: '', amenities: '' },
    ]
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => caravans })
    render(withProviders(<CaravanList />))
    expect(await screen.findByText('A')).toBeInTheDocument()
    expect(screen.getByText('Busan')).toBeInTheDocument()
  })
})

