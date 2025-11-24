import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { FaGoogle } from 'react-icons/fa'
import { SiNaver } from 'react-icons/si'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해 주세요'),
  password: z.string().min(4, '4자 이상 비밀번호를 입력해 주세요'),
})

const registerSchema = loginSchema.extend({
  fullName: z.string().optional(),
})

type FormValues = z.infer<typeof registerSchema>

const SOCIAL_ERROR_MESSAGES: Record<string, string> = {
  google: 'Google 로그인에 실패했습니다. 다시 시도해 주세요.',
  google_no_email: 'Google에서 이메일 정보를 제공하지 않았습니다.',
  google_cancelled: 'Google 로그인을 취소했습니다.',
  google_server: 'Google 로그인 서버 오류가 발생했습니다.',
  google_login: 'Google 계정으로 로그인 중 문제가 발생했습니다.',

  naver: 'Naver 로그인에 실패했습니다. 다시 시도해 주세요.',
  naver_no_email: 'Naver에서 이메일 정보를 제공하지 않았습니다.',
  naver_cancelled: 'Naver 로그인을 취소했습니다.',
  naver_server: 'Naver 로그인 서버 오류가 발생했습니다.',
  naver_login: 'Naver 계정으로 로그인 중 문제가 발생했습니다.',

  kakao: 'Kakao 로그인에 실패했습니다. 다시 시도해 주세요.',
  kakao_no_email: 'Kakao에서 이메일 정보를 제공하지 않았습니다.',
  kakao_cancelled: 'Kakao 로그인을 취소했습니다.',
  kakao_server: 'Kakao 로그인 서버 오류가 발생했습니다.',
  kakao_login: 'Kakao 계정으로 로그인 중 문제가 발생했습니다.',
}

export default function Login() {
  const { loginLocal, registerLocal, loading, error } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const urlErrorCode = searchParams.get('error') ?? ''
  const socialError =
    urlErrorCode && SOCIAL_ERROR_MESSAGES[urlErrorCode]
      ? SOCIAL_ERROR_MESSAGES[urlErrorCode]
      : urlErrorCode
      ? '소셜 로그인에 실패했습니다. 다시 시도해 주세요.'
      : null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (mode === 'login') {
      await loginLocal(values.email, values.password)
    } else {
      await registerLocal(values.email, values.password, values.fullName)
    }
    navigate('/app')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* Header */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            CaravanShare 로그인
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 mb-8">
            여행을 시작해볼까요? 간편 로그인 또는 이메일로 계정을 만들 수 있어요.
          </p>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-full">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setMode('login')}
            >
              이메일 로그인
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setMode('register')}
            >
              회원가입
            </button>
          </div>

          {/* Social login buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              type="button"
              className="w-full h-12 rounded-xl bg-white text-slate-700 border border-slate-200 flex items-center justify-center gap-3 text-sm font-medium hover:bg-slate-50 transition-colors transition-transform active:scale-[0.98]"
              onClick={() => {
                window.location.href = `${API_BASE}/auth/google`
              }}
            >
              <FaGoogle className="w-5 h-5" />
              <span>Google로 계속하기</span>
            </button>
            <button
              type="button"
              className="w-full h-12 rounded-xl bg-[#03C75A] text-white flex items-center justify-center gap-3 text-sm font-medium hover:bg-[#02b351] transition-colors transition-transform active:scale-[0.98]"
              onClick={() => {
                window.location.href = `${API_BASE}/auth/naver`
              }}
            >
              <SiNaver className="w-5 h-5" />
              <span>Naver로 계속하기</span>
            </button>
            <button
              type="button"
              className="w-full h-12 rounded-xl bg-[#FEE500] text-[#3c1e1e] flex items-center justify-center gap-3 text-sm font-medium hover:bg-[#fdd835] transition-colors transition-transform active:scale-[0.98]"
              onClick={() => {
                window.location.href = `${API_BASE}/auth/kakao`
              }}
            >
              <RiKakaoTalkFill className="w-5 h-5" />
              <span>Kakao로 계속하기</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">또는</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">이메일</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full h-12 rounded-xl bg-slate-50 border border-transparent pl-11 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="비밀번호"
                  className="w-full h-12 rounded-xl bg-slate-50 border border-transparent pl-11 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  이름 (선택)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="이름 또는 닉네임"
                    className="w-full h-12 rounded-xl bg-slate-50 border border-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-slate-900 text-white text-sm font-semibold flex items-center justify-center hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition-colors transition-transform active:scale-[0.98]"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>

            {socialError && <div className="text-red-600 text-sm mt-2">{socialError}</div>}
            {error && (
              <div className="text-red-600 text-sm mt-1">
                {error === 'Invalid credentials'
                  ? '이메일 또는 비밀번호가 잘못되었습니다.'
                  : error}
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  )
}
