import { Link } from 'react-router-dom'
import hero from '../assets/ai/hero.svg'
import { motion } from 'framer-motion'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-slate-100">
      <div className="container mx-auto max-w-6xl px-6 py-16 grid gap-12 lg:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 mb-5">
            바다와 별 사이,
            <br />
            당신만의 카라반 여행
          </h1>
          <p className="text-slate-600 mb-8 text-base md:text-lg leading-relaxed">
            CaravanShare는 호스트와 게스트를 연결하는 카라반 공유 플랫폼입니다.
            주말 짧은 휴식부터 장기 트립까지, 원하는 일정과 예산에 맞는 카라반을 찾아보세요.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-[#0F766E] px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#115e57] hover:shadow-lg transform transition-colors transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F766E]"
            >
              지금 시작하기
            </Link>
            <span className="text-xs md:text-sm text-slate-500">
              Google / Naver / Kakao 계정으로 간편 로그인
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="relative flex justify-center"
        >
          <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-gray-900/5 bg-white">
            <img src={hero} alt="카라반 여행을 추상적으로 표현한 일러스트" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-4 bg-white/90 backdrop-blur rounded-2xl px-4 py-3 shadow-md ring-1 ring-gray-900/5 text-xs md:text-sm text-slate-700 max-w-xs">
            실시간 예약 현황, 캘린더 기반 가용성, 호스트/게스트용 대시보드를 한 번에.
          </div>
        </motion.div>
      </div>
    </div>
  )
}
