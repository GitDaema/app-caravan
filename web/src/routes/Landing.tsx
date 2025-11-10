import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">CaravanShare</h1>
      <p className="mb-6">카라반 공유 플랫폼 – 어디서든 캠핑을.</p>
      <Link to="/login" className="text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded">로그인</Link>
    </div>
  )
}

