import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../routes/Login'
import { withProviders } from '../test/utils'
import { useAuthStore } from '../store/auth'

test('로그인 버튼 클릭 시 signInWithGoogle 호출', async () => {
  const spy = vi.spyOn(useAuthStore.getState(), 'signInWithGoogle').mockResolvedValue()
  render(withProviders(<Login />))
  const btn = screen.getByRole('button', { name: /Google로 로그인/i })
  fireEvent.click(btn)
  expect(spy).toHaveBeenCalledTimes(1)
})

