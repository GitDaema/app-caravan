import ReservationForm from '../components/ReservationForm'
import ReservationList from '../components/ReservationList'
import ProfileActions from '../components/ProfileActions'
import CaravanForm from '../components/CaravanForm'
import CaravanList from '../components/CaravanList'
import BalanceCard from '../components/BalanceCard'
import DemoOverview from '../components/DemoOverview'
import AdminReservations from '../components/AdminReservations'

export default function Dashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <BalanceCard />
      <ProfileActions />
      <CaravanForm />
      <CaravanList />
      <ReservationForm />
      <ReservationList />
      <DemoOverview />
      <AdminReservations />
    </div>
  )
}
