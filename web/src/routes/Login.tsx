import { useAuthStore } from '../store/auth'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/api'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { motion } from 'framer-motion'

const schema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(4, '4자 이상 비밀번호를 입력해주세요.'),
})

type FormValues = z.infer<typeof schema>

export default function Login() {
  const { loginLocal, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'password',
    },
  })

  const onSubmit = async (values: FormValues) => {
    await loginLocal(values.email, values.password)
    navigate('/app')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-sky-100 via-white to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md"
      >
        <Card>
          <h2 className="text-2xl font-semibold mb-6 text-center">로그인</h2>

          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                window.location.href = `${API_BASE}/auth/google`
              }}
            >
              Google로 로그인
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                window.location.href = `${API_BASE}/auth/naver`
              }}
            >
              Naver로 로그인
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                window.location.href = `${API_BASE}/auth/kakao`
              }}
            >
              Kakao로 로그인
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-sm text-gray-500 mb-1">또는 이메일/비밀번호로 로그인</div>
            <div>
              <Input placeholder="email" type="email" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <Input placeholder="password" type="password" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '로그인 중...' : '로그인'}
            </Button>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

