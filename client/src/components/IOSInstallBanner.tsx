import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { dismissIOSInstallPrompt, shouldShowIOSInstallPrompt } from '../lib/platform'

export function IOSInstallBanner() {
  const [visible, setVisible] = useState(shouldShowIOSInstallPrompt)

  if (!visible) return null

  function handleDismiss() {
    dismissIOSInstallPrompt()
    setVisible(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="ios-install-banner"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        role="dialog"
        aria-label="Install Vizrr on iPhone"
      >
        <div className="ios-install-banner-icon">📲</div>
        <div className="ios-install-banner-text">
          <strong>Install Vizrr on your iPhone</strong>
          <span>Tap Share → Add to Home Screen</span>
        </div>
        <Link to="/get-app" className="btn btn-primary ios-install-banner-btn" onClick={handleDismiss}>
          How to install
        </Link>
        <button type="button" className="ios-install-banner-close" onClick={handleDismiss} aria-label="Dismiss">
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
