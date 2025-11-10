import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Header() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="font-bold">CaravanShare</Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name || user.email}</span>
              <button className="text-sm text-gray-700 underline" onClick={() => { signOut(); navigate('/'); }}>로그아웃</button>
            </>
          ) : (
            <Link to="/login" className="text-sm text-gray-700 underline">로그인</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

