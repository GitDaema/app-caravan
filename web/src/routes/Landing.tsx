import { Link } from 'react-router-dom'
import hero from '../assets/ai/hero.svg'
import { motion } from 'framer-motion'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
      <div className="container mx-auto px-4 py-10 grid gap-10 md:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            바다와 별 사이,
            <br />
            당신만의 카라반 여행
          </h1>
          <p className="text-gray-600 mb-6 text-base md:text-lg">
            CaravanShare는 호스트와 게스트를 연결하는 카라반 공유 플랫폼입니다.
            주말 짧은 휴식부터 장기 트립까지, 원하는 일정과 예산에 맞는 카라반을 찾아보세요.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-sky-700 transition-colors"
            >
              지금 시작하기
            </Link>
            <span className="text-xs md:text-sm text-gray-500">
              Google / Naver / Kakao 계정으로 간편 로그인
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="relative"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-sky-100">
            <img src={hero} alt="카라반 여행을 추상적으로 표현한 일러스트" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-4 bg-white/80 backdrop-blur rounded-xl px-4 py-3 shadow-lg text-xs md:text-sm">
            실시간 예약 현황, 캘린더 기반 가용성, 호스트/게스트용 대시보드를 한 번에.
          </div>
        </motion.div>
      </div>
    </div>
  )
}

