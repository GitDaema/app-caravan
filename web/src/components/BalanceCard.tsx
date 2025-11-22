import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Wallet } from 'lucide-react'

export default function BalanceCard() {
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => api.get('/api/users/me'),
  })

  if (!data) return null

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5">
      <div className="flex items-center mb-3">
        <Wallet className="w-5 h-5 text-slate-400 mr-2" />
        <h3 className="text-sm font-semibold text-slate-900">현재 잔액</h3>
      </div>
      <div className="text-4xl font-extrabold text-slate-900">
        {Number(data.balance).toLocaleString('ko-KR')}원
      </div>
      <div className="absolute -bottom-4 -right-4 text-slate-100 pointer-events-none">
        <Wallet className="w-24 h-24 rotate-12" />
      </div>
    </div>
  )
}

