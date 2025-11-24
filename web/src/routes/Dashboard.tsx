import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import ReservationForm from '../components/ReservationForm'
import ReservationList from '../components/ReservationList'
import ProfileActions from '../components/ProfileActions'
import CaravanForm from '../components/CaravanForm'
import CaravanList from '../components/CaravanList'
import BalanceCard from '../components/BalanceCard'
import DemoOverview from '../components/DemoOverview'
import AdminReservations from '../components/AdminReservations'
import HostPanel from '../components/HostPanel'
import CaravanCalendar from '../components/CaravanCalendar'
import ReviewSection from '../components/ReviewSection'
import WeatherPanel from '../components/WeatherPanel'
import CaravanManager from '../components/CaravanManager'
import PreMessageThread from '../components/PreMessageThread'
import { LayoutDashboard, CalendarDays, Compass, BriefcaseBusiness, ShieldCheck } from 'lucide-react'

type TabKey = 'overview' | 'trips' | 'explore' | 'host' | 'admin'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [selectedCaravanMeta, setSelectedCaravanMeta] = useState<any | null>(null)
  const [justBooked, setJustBooked] = useState(false)
  const [reservationStart, setReservationStart] = useState<string | null>(null)
  const { user } = useAuthStore()

  const isHost = user?.role === 'HOST'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#F1F5F9]">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 px-4 py-6">
        <div className="mb-8">
          <div className="text-xs font-semibold text-slate-500 tracking-wider mb-2">대시보드</div>
          <div className="text-sm text-slate-400">필요한 정보를 빠르게 살펴보세요.</div>
        </div>
        <nav className="space-y-2 text-sm font-medium">
          <button
            type="button"
            className={`flex items-center gap-3 w-full rounded-xl px-3 py-2 transition-colors ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>홈</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-3 w-full rounded-xl px-3 py-2 transition-colors ${
              activeTab === 'trips'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('trips')}
          >
            <CalendarDays className="w-4 h-4" />
            <span>내 일정</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-3 w-full rounded-xl px-3 py-2 transition-colors ${
              activeTab === 'explore'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
            }`}
            onClick={() => setActiveTab('explore')}
          >
            <Compass className="w-4 h-4" />
            <span>탐색</span>
          </button>
          {isHost && (
            <button
              type="button"
              className={`flex items-center gap-3 w-full rounded-xl px-3 py-2 transition-colors ${
                activeTab === 'host'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('host')}
            >
              <BriefcaseBusiness className="w-4 h-4" />
              <span>호스트 모드</span>
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              className={`flex items-center gap-3 w-full rounded-xl px-3 py-2 transition-colors ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('admin')}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>관리자</span>
            </button>
          )}
        </nav>
      </aside>

      {/* Bottom navigation - mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around py-2 z-30">
        <button
          type="button"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'overview' ? 'text-slate-900' : 'text-slate-400'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>홈</span>
        </button>
        <button
          type="button"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'trips' ? 'text-slate-900' : 'text-slate-400'
          }`}
          onClick={() => setActiveTab('trips')}
        >
          <CalendarDays className="w-5 h-5" />
          <span>일정</span>
        </button>
        <button
          type="button"
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'explore' ? 'text-slate-900' : 'text-slate-400'
          }`}
          onClick={() => setActiveTab('explore')}
        >
          <Compass className="w-5 h-5" />
          <span>탐색</span>
        </button>
        {isHost && (
          <button
            type="button"
            className={`flex flex-col items-center gap-1 text-[11px] ${
              activeTab === 'host' ? 'text-slate-900' : 'text-slate-400'
            }`}
            onClick={() => setActiveTab('host')}
          >
            <BriefcaseBusiness className="w-5 h-5" />
            <span>호스트</span>
          </button>
        )}
        {isAdmin && (
          <button
            type="button"
            className={`flex flex-col items-center gap-1 text-[11px] ${
              activeTab === 'admin' ? 'text-slate-900' : 'text-slate-400'
            }`}
            onClick={() => setActiveTab('admin')}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>관리자</span>
          </button>
        )}
      </nav>

      {/* Main content area */}
      <main className="flex-1 px-4 py-4 md:px-6 md:py-6 md:ml-0">
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
          {activeTab === 'overview' && (
            <>
              <BalanceCard />
              <ProfileActions />
              <ReservationList onEmptyNavigateExplore={() => setActiveTab('explore')} />
              <DemoOverview />
            </>
          )}

          {activeTab === 'trips' && (
            <>
              {justBooked && (
                <div className="rounded-xl bg-slate-900 text-white text-sm px-4 py-3 shadow-md flex items-center justify-between">
                  <span>예약 정보를 입력해 주세요.</span>
                  <button
                    type="button"
                    className="text-xs text-slate-200 hover:text-white underline"
                    onClick={() => setJustBooked(false)}
                  >
                    닫기
                  </button>
                </div>
              )}
              <ReservationList onEmptyNavigateExplore={() => setActiveTab('explore')} />
              <CaravanCalendar />
              <WeatherPanel selectedCaravan={selectedCaravanMeta} startDate={reservationStart} />
              <ReservationForm
                selectedCaravan={selectedCaravanMeta}
                onStartDateChange={setReservationStart}
                onSelectCaravanRequest={() => setActiveTab('explore')}
              />
              {selectedCaravanMeta && (
                <div className="mt-3 space-y-3">
                  <PreMessageThread caravanId={selectedCaravanMeta.id} />
                  <ReviewSection />
                </div>
              )}
            </>
          )}

          {activeTab === 'explore' && (
            <>
              <CaravanList
                onBookClick={(caravan) => {
                  setSelectedCaravanMeta(caravan)
                  setReservationStart(null)
                  setActiveTab('trips')
                  setJustBooked(true)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
              <ReviewSection />
            </>
          )}

          {activeTab === 'host' && isHost && (
            <>
              <HostPanel />
              <CaravanManager mode="host" />
              <CaravanForm />
            </>
          )}

          {activeTab === 'admin' && isAdmin && (
            <>
              <AdminReservations />
              <CaravanManager mode="admin" />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
