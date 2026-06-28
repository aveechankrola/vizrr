import { motion } from 'framer-motion'
import { useAdmin } from './AdminProvider'

export function AdminUsersPage() {
  const { adminUsers } = useAdmin()

  return (
    <motion.div className="admin-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="admin-page-title">Users</h2>
      {adminUsers.length === 0 ? (
        <p className="admin-empty">No registered users yet.</p>
      ) : (
        adminUsers.map((u) => (
          <div key={u.id} className="admin-user-row">
            <div className="admin-user-avatar">
              {u.firstName[0]}
              {u.lastName[0]}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">
                {u.firstName} {u.lastName}
              </span>
              <span className="admin-user-email">{u.email}</span>
            </div>
            <span className="admin-user-since">
              {new Date(u.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        ))
      )}
    </motion.div>
  )
}
