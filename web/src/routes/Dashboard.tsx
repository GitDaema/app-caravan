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

export default function Dashboard() {
  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
      <div className="lg:col-span-8 md:col-span-2 col-span-1">
        <HostPanel />
      </div>
      <div className="lg:col-span-4 md:col-span-2 col-span-1">
        <BalanceCard />
      </div>
      <div className="lg:col-span-4 md:col-span-2 col-span-1">
        <ProfileActions />
      </div>
      <div className="lg:col-span-4 md:col-span-2 col-span-1">
        <CaravanForm />
      </div>
      <div className="lg:col-span-4 md:col-span-2 col-span-1">
        <CaravanList />
      </div>
      <div className="lg:col-span-8 md:col-span-2 col-span-1">
        <CaravanCalendar />
      </div>
      <div className="lg:col-span-8 md:col-span-2 col-span-1">
        <ReviewSection />
      </div>
      <div className="lg:col-span-4 md:col-span-2 col-span-1">
        <ReservationForm />
      </div>
      <div className="lg:col-span-8 md:col-span-2 col-span-1">
        <ReservationList />
      </div>
      <div className="lg:col-span-4 md:col-span-2 col-span-1">
        <DemoOverview />
      </div>
      <div className="lg:col-span-8 md:col-span-2 col-span-1">
        <AdminReservations />
      </div>
    </div>
  )
}
