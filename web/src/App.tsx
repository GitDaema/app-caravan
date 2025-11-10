import Header from './components/Header'
import { ReactNode } from 'react'

export default function App({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="container mx-auto p-4 flex-1">{children}</main>
    </div>
  )
}

