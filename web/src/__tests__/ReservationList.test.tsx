import { render, screen, waitFor } from '@testing-library/react'
import ReservationList from '../components/ReservationList'
import { withProviders } from '../test/utils'

test('내 예약 목록을 표시한다', async () => {
  vi.spyOn(global, 'fetch' as any).mockResolvedValue({
    ok: true,
    json: async () => ([
      { id: 1, caravan_id: 7, start_date: '2099-01-01', end_date: '2099-01-03', price: 200, status: 'confirmed' },
    ]),
  } as any)

  render(withProviders(<ReservationList />))
  await waitFor(() => {
    expect(screen.getByText(/Caravan 7/)).toBeInTheDocument()
  })
})

