import { Link } from 'react-router-dom'
import hero from '../assets/ai/hero.svg'
import { motion } from 'framer-motion'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Hero Section - full-bleed background image */}
      <section className="relative min-h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero})` }}
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
              <div className="text-2xl mb-3">🚀</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                빠른 예약
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                실시간 캘린더와 직관적인 검색 필터로, 원하는 날짜와 지역의 카라반을 몇 번의 클릭으로 바로
                예약할 수 있습니다.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-6">
              <div className="text-2xl mb-3">🛡</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                안전한 결제
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                에스크로 기반 결제와 취소 정책으로, 호스트와 게스트 모두 안심하고 거래할 수 있는 환경을
                제공합니다.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-6">
              <div className="text-2xl mb-3">🌟</div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                검증된 호스트
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                실제 이용 후기와 평점, 호스트 프로필을 통해 믿을 수 있는 카라반만 선택할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular caravans horizontal list */}
      <section className="py-12 px-4 bg-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              인기 카라반 추천
            </h2>
            <span className="text-xs text-slate-500">더미 데이터 · 데모 전용</span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2">
              {['동해 오션뷰 카라반', '강릉 감성 캠핑카', '제주 올인원 캠핑 트레일러', '부산 비치 사이드 캠퍼'].map(
                (name, idx) => (
                  <div
                    key={name}
                    className="min-w-[240px] bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-400/20 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                        추천 #{idx + 1}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">{name}</h3>
                      <p className="text-xs text-slate-600 mb-2">
                        4.8 · 바다 전망 · 최대 4인 · 전기 / 샤워 / 주방 구비
                      </p>
                    </div>
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black transition-colors"
                    >
                      자세히 보기
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 bg-black text-gray-400">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
          <div>
            <div className="text-white font-semibold text-lg mb-1">CaravanShare</div>
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} CaravanShare. All rights reserved.
            </div>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-white transition-colors">
              이용약관
            </a>
            <a href="#" className="hover:text-white transition-colors">
              개인정보 처리방침
            </a>
          </div>
          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-white transition-colors">
              Instagram
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Facebook
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Blog
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

