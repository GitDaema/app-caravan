import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReservationForm from '../components/ReservationForm'
import { withProviders } from '../test/utils'

test('예약하기 클릭 시 POST /reservations 호출', async () => {
  const fetchMock = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, caravan_id: 1, start_date: '2099-01-01', end_date: '2099-01-03', price: 200, status: 'confirmed' }),
  } as any)

  render(withProviders(<ReservationForm />))

  fireEvent.change(screen.getByLabelText('Caravan ID'), { target: { value: '1' } })
  fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2099-01-01' } })
  fireEvent.change(screen.getByLabelText('종료일'), { target: { value: '2099-01-03' } })

  const button = screen.getByRole('button', { name: '예약하기' })
  fireEvent.click(button)

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalled()
  })
})
