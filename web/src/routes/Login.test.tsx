import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'
import { useAuthStore } from '../store/auth'

function renderLogin(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Login />
    </MemoryRouter>
  )
}

describe('/login page', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null,
    } as any)
  })

  it('shows social login buttons', () => {
    renderLogin()

    expect(screen.getByText('Google로 계속하기')).toBeInTheDocument()
    expect(screen.getByText('Naver로 계속하기')).toBeInTheDocument()
    expect(screen.getByText('Kakao로 계속하기')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()

    const loginLocalMock = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null,
      loginLocal: loginLocalMock,
    } as any)

    renderLogin()

    const emailInput = screen.getByPlaceholderText('email')
    const passwordInput = screen.getByPlaceholderText('password')
    const submitButton = screen.getByRole('button', { name: '로그인' })

    // 잘못된 이메일 입력
    await user.clear(emailInput)
    await user.type(emailInput, 'not-an-email')
    await user.clear(passwordInput)
    await user.type(passwordInput, 'password')
    await user.click(submitButton)

    expect(loginLocalMock).not.toHaveBeenCalled()
  })

  it('submits and calls loginLocal from store', async () => {
    const user = userEvent.setup()

    const loginLocalMock = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null,
      loginLocal: loginLocalMock,
    } as any)

    renderLogin()

    const emailInput = screen.getByPlaceholderText('email')
    const passwordInput = screen.getByPlaceholderText('password')
    await user.type(emailInput, 'admin@example.com')
    await user.type(passwordInput, 'password')

    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)

    expect(loginLocalMock).toHaveBeenCalledWith('admin@example.com', 'password')
  })

  it('shows error message from query parameter', () => {
    renderLogin('/login?error=kakao_no_email')

    expect(screen.getByText('Kakao에서 이메일 정보를 제공하지 않았습니다.')).toBeInTheDocument()
  })
})
