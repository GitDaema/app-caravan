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

const popularCaravans = [
  {
    id: 1,
    title: '동해 오션뷰 카라반',
    location: '강원도 동해',
    price: '₩80,000 / 박',
    image:
      'https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1000&auto=format&fit=crop',
    superHost: true,
  },
  {
    id: 2,
    title: '제주 감성 캠핑 트레일러',
    location: '제주 서귀포',
    price: '₩110,000 / 박',
    image:
      'https://images.unsplash.com/photo-1592351763700-b9b35a6465ea?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    superHost: true,
  },
  {
    id: 3,
    title: '강릉 바다 감성 캠핑',
    location: '강릉 경포대',
    price: '₩150,000 / 박',
    image:
      'https://images.unsplash.com/photo-1626680114529-3f6ffa002b80?q=80&w=685&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    superHost: false,
  },
  {
    id: 4,
    title: '부산 비치 뷰 캠퍼',
    location: '부산 기장',
    price: '₩190,000 / 박',
    image:
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1000&auto=format&fit=crop',
    superHost: true,
  },
]

export default function Landing() {
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
            바다를 따라 떠나는
            <br />
            당신만의 카라반 여행
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-base md:text-lg text-slate-100/90 mb-6 leading-relaxed"
          >
            CaravanShare에서 호스트와 게스트가 직접 연결되는 카라반 공유 경험을 만나보세요.
            주말 캠핑부터 장기 로드트립까지, 서로의 카라반을 나누며 더 유연한 여행을 떠날 수
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
              카라반 셰어, 이렇게 쓰여요
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="relative flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600 p-4 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">쉽게 찾고 등록해요</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                원하는 지역의 카라반을 검색하거나, 내 카라반을 간편하게 호스팅하세요.
              </p>
              <ArrowRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-green-50 text-green-600 p-4 mb-4">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">일정을 맞춰요</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                호스트와 게스트가 대화하며 완벽한 여행 날짜와 이용 방식을 조율합니다.
              </p>
              <ArrowRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-purple-50 text-purple-600 p-4 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">안전하게 이용해요</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                검증된 에스크로 결제로 빌려주는 사람도, 빌리는 사람도 안심할 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
            왜 CaravanShare인가요?
          </h2>
          <p className="text-center text-2xl font-semibold text-slate-900 mb-10">
            카라반 공유를 더 쉽고, 안전하고, 특별하게
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-6">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">어디서든 만나는 카라반</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                다양한 지역의 카라반이 한곳에 모여 있어, 게스트는 가까운 카라반을 찾고 호스트는
                자신의 카라반을 쉽게 소개할 수 있습니다.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-6">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">안전한 예약과 결제</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                플랫폼을 통한 예약과 정산으로, 예상치 못한 상황에서도 게스트와 호스트 모두를
                안전하게 보호합니다.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-6">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">검증된 슈퍼 호스트</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                이용 후기와 응답률을 기반으로 한 슈퍼 호스트 배지로, 신뢰할 수 있는 카라반과의
                만남을 도와줍니다.
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
            <span className="text-xs text-slate-500">현재는 예시 이미지와 가격입니다</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {popularCaravans.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-400/20 overflow-hidden transform transition-transform duration-150 hover:-translate-y-1"
              >
                <div className="relative h-48 w-full">
                  <img src={c.image} alt={c.title} className="h-48 w-full object-cover" />
                  {c.superHost && (
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-amber-700 shadow-sm">
                      슈퍼 호스트
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div className="text-xs text-slate-500">{c.location}</div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {c.title}
                    </h3>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 rounded-full px-2 py-1">
                      4.8 ★
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">최대 4인 · 취침 · 주방</span>
                    <span className="font-semibold text-slate-900">{c.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              서비스 흐름
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
