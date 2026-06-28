import { motion } from 'framer-motion'
import { useAdmin } from './AdminProvider'

export function AdminDashboardPage() {
  const { adminStats, adminLoading } = useAdmin()

  if (adminLoading && !adminStats) {
    return <p className="admin-loading">Loading dashboard…</p>
  }

  if (!adminStats) {
    return <p className="admin-empty">Unable to load dashboard stats.</p>
  }

  return (
    <motion.div className="admin-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="admin-page-title">Dashboard</h2>
      <div className="admin-stat-grid">
        <div className="admin-stat-card admin-stat-card--pink">
          <span className="admin-stat-value">{adminStats.totalOrders}</span>
          <span className="admin-stat-label">Total Orders</span>
        </div>
        <div className="admin-stat-card admin-stat-card--green">
          <span className="admin-stat-value">₹{adminStats.totalRevenue.toFixed(2)}</span>
          <span className="admin-stat-label">Revenue</span>
        </div>
        <motion.div className="admin-stat-card admin-stat-card--blue" whileHover={{ y: -4 }}>
          <span className="admin-stat-value">{adminStats.totalUsers}</span>
          <span className="admin-stat-label">Users</span>
        </motion.div>
        <div className="admin-stat-card admin-stat-card--purple">
          <span className="admin-stat-value">{adminStats.totalProducts}</span>
          <span className="admin-stat-label">Products</span>
        </div>
      </div>
      <div className="admin-stat-grid">
        <motion.div className="admin-mini-stat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <span className="admin-mini-dot admin-mini-dot--yellow" />
          {adminStats.pendingOrders} Pending
        </motion.div>
        <div className="admin-mini-stat">
          <span className="admin-mini-dot admin-mini-dot--pink" />
          {adminStats.confirmedOrders} Confirmed
        </div>
        <div className="admin-mini-stat">
          <span className="admin-mini-dot admin-mini-dot--green" />
          {adminStats.deliveredOrders} Delivered
        </div>
        <div className="admin-mini-stat">
          <span className="admin-mini-dot admin-mini-dot--red" />
          {adminStats.cancelledOrders} Cancelled
        </div>
      </div>
    </motion.div>
  )
}
