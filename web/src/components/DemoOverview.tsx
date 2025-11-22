import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function DemoOverview() {
  const { data, isError } = useQuery({
    queryKey: ['demo-overview'],
    queryFn: async () => api.get('/dev/overview'),
  })

  if (isError || !data) return null

  return (
    <div className="bg-white rounded-2xl shadow-md ring-1 ring-gray-900/5 p-4 md:p-5">
      <h3 className="font-semibold mb-3">데모 개요</h3>
      <div className="text-sm text-gray-600 mb-2">
        데모 모드에서 현재 카라반과 예약 정보를 요약해서 보여줍니다.
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">카라반</h4>
          <ul className="space-y-1 text-sm">
            {data.caravans.map((c: any) => (
              <li key={c.id} className="border rounded-2xl p-2.5 flex justify-between border-slate-200 hover:bg-slate-50 transition-colors">
                <span>
                  {c.name} (#{c.id})
                </span>
                <span className="text-gray-600">{c.location}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">예약 (데모 샘플)</h4>
          <ul className="space-y-1 text-sm">
            {data.reservations.map((r: any) => (
              <li key={r.id} className="border rounded-2xl p-2.5 flex justify-between border-slate-200 hover:bg-slate-50 transition-colors">
                <span>#{r.id} Caravan {r.caravan_id}</span>
                <span className="text-gray-600">
                  {r.start_date} ~ {r.end_date} [{r.status}]
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
