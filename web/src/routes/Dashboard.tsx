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
    <div className="grid gap-6 md:gap-8 md:grid-cols-2">
      <HostPanel />
      <BalanceCard />
      <ProfileActions />
      <CaravanForm />
      <CaravanList />
      <CaravanCalendar />
      <ReviewSection />
      <ReservationForm />
      <ReservationList />
      <DemoOverview />
      <AdminReservations />
    </div>
  )
}
