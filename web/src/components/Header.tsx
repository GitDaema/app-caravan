import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg tracking-tight text-slate-900">
          CaravanShare
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-600">{user.fullName || user.email}</span>
              <button
                className="text-sm font-medium text-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                onClick={() => {
                  logout().finally(() => navigate('/'))
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-[#0F766E] px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
