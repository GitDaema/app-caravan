import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../routes/Login'
import { withProviders } from '../test/utils'
import { useAuthStore } from '../store/auth'

test('이메일/비밀번호 폼 제출 시 loginLocal 호출', async () => {
  const spy = vi.spyOn(useAuthStore.getState(), 'loginLocal').mockResolvedValue()
  render(withProviders(<Login />))

  fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'secret' } })

  const submitButton = screen.getByRole('button', { name: '로그인' })
  fireEvent.click(submitButton)

  await waitFor(() => {
    expect(spy).toHaveBeenCalledWith('test@example.com', 'secret')
  })
})
