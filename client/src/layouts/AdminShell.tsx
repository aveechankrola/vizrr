import { motion } from 'framer-motion'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAdmin } from '../admin/AdminProvider'

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/support', label: 'Support', icon: '🛟' },
  { to: '/admin/sales', label: 'Sales', icon: '💼' },
  { to: '/admin/master', label: 'Master', icon: '🗝' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/products', label: 'Products', icon: '🕶️' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
] as const

export function AdminShell() {
  const navigate = useNavigate()
  const { adminToken, handleAdminLogout } = useAdmin()

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <motion.div
      className="app-system app-system--admin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <aside className="app-sidebar app-sidebar--admin" aria-label="Admin navigation">
        <div className="app-sidebar-brand">
          <span className="brand-name">Vizrr</span>
          <span className="app-sidebar-tag">Admin Console</span>
        </div>
        <nav className="app-sidebar-nav">
          {adminNav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `app-nav-item${isActive ? ' app-nav-item--active' : ''}`
              }
            >
              <span className="app-nav-icon" aria-hidden>
                {icon}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar-footer">
          <button type="button" className="app-nav-item app-nav-item--ghost" onClick={() => navigate('/')}>
            <span className="app-nav-icon" aria-hidden>←</span>
            <span>Customer App</span>
          </button>
          <button type="button" className="admin-logout-btn app-nav-item" onClick={handleAdminLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar app-topbar--admin">
          <p className="app-topbar-title">Vizrr Admin Application</p>
        </header>
        <main className="app-content app-content--admin">
          <Outlet />
        </main>
      </div>
    </motion.div>
  )
}
