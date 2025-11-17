import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  return (
    <header className="bg-white border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight">
          CaravanShare
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.fullName || user.email}</span>
              <button
                className="text-sm text-gray-700 underline"
                onClick={() => {
                  logout().finally(() => navigate('/'))
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-gray-700 underline">
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

