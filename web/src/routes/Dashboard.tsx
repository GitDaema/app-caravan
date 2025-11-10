import ReservationForm from '../components/ReservationForm'
import ReservationList from '../components/ReservationList'

export default function Dashboard() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ReservationForm />
      <ReservationList />
    </div>
  )
}

