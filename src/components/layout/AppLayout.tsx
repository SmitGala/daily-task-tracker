import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <main className="flex-1 pb-24 overflow-x-hidden bg-background">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0.92, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <BottomNav />
    </div>
  )
}
