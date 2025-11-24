import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  MapPin,
  Sparkles,
  ArrowRight,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

const staticPopularCaravans = [
  {
    id: 1,
    title: '동해 오션뷰 캠퍼',
    location: '강원 동해',
    price: '80,000원 / 박',
    image:
      'https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1000&auto=format&fit=crop',
    superHost: true,
  },
]

export default function Landing() {
  const { data } = useQuery({
    queryKey: ['landing-caravans'],
    queryFn: async () => api.get('/api/caravans'),
  })

  const popularCaravans = useMemo(() => {
    const caravans = Array.isArray(data) ? data : []
    const available = caravans.filter((c: any) => c.status !== 'maintenance')
    if (available.length === 0) return staticPopularCaravans
    if (available.length <= 4) return available
    const shuffled = [...available].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 4)
  }, [data])

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Hero Section - full-bleed background image */}
      <section className="relative min-h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
          >
            바다로 떠나
            <br />
            나만의 카라반 여행
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-base md:text-lg text-slate-100/90 mb-6 leading-relaxed"
          >
            CaravanShare에서 호스트와 게스트가 직접 연결되는 카라반 공유 경험을
            만나보세요.
            <br />
            주말 캠핑부터 장기 로드트립까지, 원하는 카라반을 골라 떠날 수
            있습니다.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-wrap gap-4 items-center justify-center"
          >
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-gray-400/20 hover:shadow-xl hover:-translate-y-0.5 transition-transform transition-shadow duration-200"
            >
              지금 시작하기
            </Link>
            <span className="text-xs md:text-sm text-slate-100/80">
              Google / Naver / Kakao 계정으로 간편 로그인
            </span>
          </motion.div>
        </div>
      </section>

      {/* Service usage flow panel (replaces floating search bar) */}
      <section id="search" className="-mt-10 px-4 relative z-20">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 px-6 py-8 md:px-10 md:py-10">
          <div className="mb-12">
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center">
              카라반을 찾아, 이렇게 여행해요
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="relative flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600 p-4 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">쉽게 찾고 등록해요</h3>
              <p className="text-slate-500 text-sm">
                원하는 지역과 가격, 인원을 중심으로 카라반을 빠르게 검색하고,
                호스트는 손쉽게 자신의 카라반을 등록할 수 있습니다.
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 p-4 mb-4">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">캘린더로 일정 관리</h3>
              <p className="text-slate-500 text-sm">
                예약 캘린더로 겹치는 일정 없이 손쉽게 예약을 확인하고, 게스트는
                가능한 날짜만 골라 예약을 진행할 수 있습니다.
              </p>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-slate-50 text-slate-700 p-4 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">안전한 정산과 보호</h3>
              <p className="text-slate-500 text-sm">
                가상 잔액과 예약 상태를 기반으로, 호스트와 게스트 모두가 안전하게
                이용할 수 있도록 설계되었습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular caravans list */}
      <section className="py-12 px-4 bg-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              인기 카라반 살펴보기
            </h2>
            <span className="text-xs text-slate-500">
              실제 등록된 카라반 중 일부를 보여줍니다
            </span>
          </div>
          {popularCaravans.length === 0 ? (
            <div className="text-sm text-slate-500">
              아직 추천할 카라반이 없습니다. 호스트가 카라반을 등록하면 이곳에
              표시됩니다.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {popularCaravans.map((c: any) => (
                <div
                  key={c.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-400/20 overflow-hidden transform transition-transform duration-150 hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full">
                    <img
                      src={
                        c.image ||
                        c.imageUrl ||
                        'https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1000&auto=format&fit=crop'
                      }
                      alt={c.title || c.name}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="text-xs text-slate-500">
                      {c.location || '지역 미정'}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {c.title || c.name}
                      </h3>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        최대 {c.capacity ?? 4}명
                      </span>
                      <span className="font-semibold text-slate-900">
                        {c.price
                          ? c.price
                          : c.price_per_day != null
                          ? `${c.price_per_day.toLocaleString?.('ko-KR') ?? c.price_per_day}원 / 박`
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div>
            <div className="text-white font-semibold text-lg mb-1">CaravanShare</div>
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} CaravanShare. All rights reserved.
            </div>
          </div>
          <nav className="flex gap-6 text-xs">
            <Link to="/" className="hover:text-white transition-colors">
              홈
            </Link>
            <a href="#search" className="hover:text-white transition-colors">
              서비스 안내
            </a>
            <Link to="/login" className="hover:text-white transition-colors">
              로그인
            </Link>
          </nav>
          <div className="flex gap-4 text-sm">
            <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
              <FaFacebook />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white transition-colors">
              <FaTwitter />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
