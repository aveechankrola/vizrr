import { motion } from 'framer-motion'
import { useAdmin } from './AdminProvider'

export function AdminOrdersPage() {
  const { adminOrders, handleAdminOrderStatus } = useAdmin()

  return (
    <motion.div className="admin-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="admin-page-title">Orders</h2>
      {adminOrders.length === 0 ? (
        <p className="admin-empty">No orders yet.</p>
      ) : (
        adminOrders.map((order, index) => (
          <motion.div
            key={order.id}
            className="admin-order-row"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <div className="admin-order-info">
              <span className="admin-order-id">{order.id}</span>
              <span className="admin-order-customer">
                {order.customer.firstName} {order.customer.lastName}
              </span>
              <span className="admin-order-date">
                {new Date(order.placedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="admin-order-total">₹{order.total.toFixed(2)}</span>
            </div>
            <div className="admin-order-actions">
              <span className={`admin-status-badge admin-status--${order.status}`}>{order.status}</span>
              <select
                className="admin-status-select"
                value={order.status}
                onChange={(e) => handleAdminOrderStatus(order.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  )
}
