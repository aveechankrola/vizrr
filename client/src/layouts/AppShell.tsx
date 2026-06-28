import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/react'
import { useAppUI } from '../context/AppUIContext'
import { useCart } from '../context/CartContext'
import { CartDrawer } from '../components/CartDrawer'
import { ChatModal } from '../components/ChatModal'
import { IOSInstallBanner } from '../components/IOSInstallBanner'
import { isIOSDevice, isStandaloneApp } from '../lib/platform'

const navItems = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/ai-analyser', label: 'AI Analyser', icon: '🤖' },
  { to: '/about', label: 'Frames', icon: '✨' },
  { to: '/contact', label: 'AI Chat', icon: '💬' },
  { to: '/account', label: 'Account', icon: '👤' },
  ...(!isStandaloneApp() && isIOSDevice()
    ? [{ to: '/get-app', label: 'Get App', icon: '📲' } as const]
    : []),
] as const

export function AppShell() {
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  const { mobileMenuOpen, setMobileMenuOpen } = useAppUI()
  const { cartCount, openCart } = useCart()

  function handleAccountNav(e: React.MouseEvent) {
    if (!isSignedIn) {
      e.preventDefault()
      openSignIn()
    }
  }

  return (
    <motion.div
      className="app-system"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="app-sidebar-brand">
          <span className="brand-name">Vizrr</span>
        </div>

        <nav className="app-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : undefined}
              className={({ isActive }) =>
                `app-nav-item${isActive ? ' app-nav-item--active' : ''}`
              }
              onClick={item.to === '/account' ? handleAccountNav : undefined}
            >
              <span className="app-nav-icon" aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <motion.div
          className="app-sidebar-footer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <button
            type="button"
            className="app-nav-item app-nav-item--ghost"
            onClick={() => navigate('/admin')}
          >
            <span className="app-nav-icon" aria-hidden>⚙️</span>
            <span>Admin Console</span>
          </button>
        </motion.div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-branding">
            <button
              type="button"
              className="hamburger app-topbar-menu"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span /><span /><span />
            </button>
            <div className="app-topbar-copy">
              <p className="app-topbar-title">Vizrr Frames Studio</p>
              <span className="app-topbar-subtitle">Match eyewear to face shape with AI guidance</span>
            </div>
          </div>
          <div className="app-topbar-actions">
            <span className="app-topbar-chip">Live AI fit guide</span>
            <button
              type="button"
              className="icon-button icon-button--cart"
              aria-label="Cart"
              onClick={() => openCart()}
            >
              <span className="icon-cart" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-nav-drawer app-mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="mobile-nav-header"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <span className="brand-name" style={{ fontSize: '22px', padding: '6px 14px' }}>
                  Vizrr
                </span>
                <button className="cart-close" type="button" onClick={() => setMobileMenuOpen(false)}>
                  ✕
                </button>
              </motion.div>
              <nav className="mobile-nav-links">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={'end' in item ? item.end : undefined}
                    className={({ isActive }) =>
                      `mobile-nav-link${isActive ? ' mobile-nav-link--active' : ''}`
                    }
                    onClick={(e) => {
                      if (item.to === '/account' && !isSignedIn) {
                        e.preventDefault()
                        openSignIn()
                      }
                      setMobileMenuOpen(false)
                    }}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  className="mobile-nav-link"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/admin')
                  }}
                >
                  Admin Console
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
      <ChatModal />
      <IOSInstallBanner />
    </motion.div>
  )
}
