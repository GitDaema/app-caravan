import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function BalanceCard() {
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => api.get('/api/users/me'),
  })

  if (!data) return null

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-2">현재 잔액</h3>
      <div className="text-2xl">
        {Number(data.balance).toLocaleString('ko-KR')}원
      </div>
    </div>
  )
}

