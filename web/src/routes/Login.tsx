import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { motion } from 'framer-motion'
import { FaGoogle } from 'react-icons/fa'
import { SiNaver } from 'react-icons/si'
import { RiKakaoTalkFill } from 'react-icons/ri'

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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#F5F7FA]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-[400px] mx-auto"
      >
        <Card>
          <h2 className="text-2xl font-semibold mb-6 text-center">로그인 / 회원가입</h2>

          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-full">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-slate-50 text-[#0F766E] shadow-sm ring-1 ring-[#0F766E]/20'
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
                  ? 'bg-slate-50 text-[#0F766E] shadow-sm ring-1 ring-[#0F766E]/20'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setMode('register')}
            >
              회원가입
            </button>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <Button
              type="button"
              className="w-full h-12 justify-center border border-gray-300 rounded-2xl text-sm font-medium shadow-sm hover:shadow-md transition-transform duration-150 flex items-center gap-3"
              style={{ backgroundColor: '#FFFFFF', color: '#374151' }}
              onClick={() => {
                window.location.href = `${API_BASE}/auth/google`
              }}
            >
              <FaGoogle className="w-5 h-5" />
              <span className="text-sm">Google로 계속하기</span>
            </Button>
            <Button
              type="button"
              className="w-full h-12 justify-center rounded-2xl text-sm font-medium shadow-sm hover:shadow-md transition-transform duration-150 flex items-center gap-3"
              style={{ backgroundColor: '#03C75A', color: '#FFFFFF' }}
              onClick={() => {
                window.location.href = `${API_BASE}/auth/naver`
              }}
            >
              <SiNaver className="w-5 h-5" />
              <span className="text-sm">Naver로 계속하기</span>
            </Button>
            <Button
              type="button"
              className="w-full h-12 justify-center rounded-2xl text-sm font-medium shadow-sm hover:shadow-md transition-transform duration-150 flex items-center gap-3"
              style={{ backgroundColor: '#FEE500', color: '#000000' }}
              onClick={() => {
                window.location.href = `${API_BASE}/auth/kakao`
              }}
            >
              <RiKakaoTalkFill className="w-5 h-5" />
              <span className="text-sm">Kakao로 계속하기</span>
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-xs sm:text-sm text-slate-500 mb-2">
              {mode === 'login'
                ? '이메일과 비밀번호로 로그인할 수 있어요.'
                : '이메일과 비밀번호로 새 계정을 만들 수 있어요.'}
            </div>
            <div>
              <Input placeholder="email" type="email" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <Input placeholder="password" type="password" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            {mode === 'register' && (
              <div>
                <Input placeholder="full name (선택)" type="text" {...register('fullName')} />
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </Button>
            {socialError && <div className="text-red-600 text-sm mt-2">{socialError}</div>}
            {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

