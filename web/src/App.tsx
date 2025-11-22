import Header from './components/Header'
import type { ReactNode } from 'react'
import PwaInstallBanner from './components/PwaInstallBanner'
import OfflineBanner from './components/OfflineBanner'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function App({ children }: { children?: ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-[#F8FAFC] via-white to-slate-100">
      <Header />
      <PwaInstallBanner />
      <OfflineBanner />
      <main className="container mx-auto max-w-6xl px-4 py-6 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
