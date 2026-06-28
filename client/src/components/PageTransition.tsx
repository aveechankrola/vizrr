import { AnimatePresence } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'

export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname} className="app-page-transition">
        {outlet}
      </div>
    </AnimatePresence>
  )
}
