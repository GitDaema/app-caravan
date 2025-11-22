import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, MapPin, Sparkles } from 'lucide-react'
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa'

const popularCaravans = [
  {
    id: 1,
    title: '동해 오션뷰 카라반',
    location: '강원도 동해',
    price: '₩180,000 / 박',
    image:
      'https://unsplash.com/photos/vintage-camper-van-parked-by-the-ocean-at-sunset-PvQ4RPTuXOQ',
    superHost: true,
  },
  {
    id: 2,
    title: '제주 노을 캠핑 트레일러',
    location: '제주 애월',
    price: '₩210,000 / 박',
    image:
      'https://unsplash.com/photos/white-and-green-camper-trailer-sPig58MKN58',
    superHost: true,
  },
  {
    id: 3,
    title: '강릉 감성 캠핑카',
    location: '강릉 경포대',
    price: '₩150,000 / 박',
    image:
      'https://unsplash.com/photos/white-rv-qaYwmYOpUDE',
    superHost: false,
  },
  {
    id: 4,
    title: '부산 비치 사이드 캠퍼',
    location: '부산 기장',
    price: '₩190,000 / 박',
    image:
      'https://unsplash.com/photos/green-and-orange-rv-parked-near-mountain-M3zDlLrJAsU',
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
            CaravanShare에서 호스트와 게스트가 직접 연결되는 카라반 공유 여행을 경험해 보세요.
            주말 캠핑부터 장거리 로드트립까지, 일정과 예산에 맞는 카라반을 쉽게 찾을 수 있습니다.
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

      {/* Floating search bar */}
      <section className="-mt-10 px-4 relative z-20">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-full shadow-2xl shadow-gray-400/30 px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              위치
            </span>
            <input
              type="text"
              placeholder="어디로 떠나시나요?"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200" />
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              날짜
            </span>
            <input
              type="text"
              placeholder="언제부터 언제까지"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200" />
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              인원
            </span>
            <input
              type="text"
              placeholder="인원 수"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="shrink-0 w-full md:w-auto h-11 rounded-full bg-[#0F766E] text-white text-sm font-semibold flex items-center justify-center px-5 hover:bg-[#115e57] hover:-translate-y-0.5 transition-transform transition-colors duration-150 shadow-md"
          >
            검색
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
            왜 CaravanShare 인가?
          </h2>
          <p className="text-center text-2xl font-semibold text-slate-900 mb-10">
            여행을 더 빠르고, 안전하고, 특별하게
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-6">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">한 눈에 보이는 여행지</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                지도를 기반으로 원하는 지역의 카라반을 빠르게 탐색하고, 위치와 주변 환경을 직관적으로 확인할
                수 있습니다.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-6">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">안전한 결제와 보호</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                에스크로 결제와 명확한 취소 정책으로, 예기치 못한 상황에도 호스트와 게스트 모두를 안전하게
                보호합니다.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-6">
              <div className="mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">검증된 슈퍼호스트</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                실제 이용 후기와 평점, 응답률 데이터를 바탕으로 신뢰할 수 있는 호스트와 특별한 경험을
                만들어 보세요.
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
              인기 카라반 추천
            </h2>
            <span className="text-xs text-slate-500">실제 서비스 화면과 유사한 데모</span>
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
                      슈퍼호스트
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div className="text-xs text-slate-500">{c.location}</div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{c.title}</h3>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 rounded-full px-2 py-1">
                      4.8 ★
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">최대 4인 · 전기 · 샤워 · 주방</span>
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
              검색
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
