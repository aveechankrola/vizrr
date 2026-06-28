/** Detect iPhone / iPad (Safari or in-app browser). */
export function isIOSDevice() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/** True when opened from Home Screen (installed PWA or Capacitor). */
export function isStandaloneApp() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** iOS Safari (not Chrome/Facebook in-app) — required for Add to Home Screen. */
export function isIOSSafari() {
  if (!isIOSDevice()) return false
  const ua = navigator.userAgent
  const isOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|FBAN|FBAV|Instagram|Line/.test(ua)
  return !isOtherBrowser
}

export function isSecureContext() {
  return typeof window !== 'undefined' && (window.isSecureContext || location.protocol === 'https:')
}

const DISMISS_KEY = 'vizrr_ios_install_dismissed'

export function dismissIOSInstallPrompt() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()))
}

export function shouldShowIOSInstallPrompt() {
  if (!isIOSSafari() || isStandaloneApp()) return false
  if (!isSecureContext()) return false
  const dismissed = localStorage.getItem(DISMISS_KEY)
  if (!dismissed) return true
  // Show again after 7 days
  return Date.now() - Number(dismissed) > 7 * 24 * 60 * 60 * 1000
}

export function getAppShareUrl() {
  return typeof window !== 'undefined' ? window.location.origin : ''
}
