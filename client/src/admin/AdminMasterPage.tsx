import { motion } from 'framer-motion'
import type { StaffRole } from './types'
import { useAdmin } from './AdminProvider'

export function AdminMasterPage() {
  const {
    staffMembers,
    staffForm,
    setStaffForm,
    staffCreateMessage,
    handleCreateStaffMember,
  } = useAdmin()

  return (
    <motion.div className="admin-role-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="admin-page-title">Master — Staff IDs</h2>
      <section className="admin-role-card">
        <form className="admin-product-form" onSubmit={handleCreateStaffMember}>
          <motion.div className="contact-form-row" layout>
            <div className="contact-field">
              <label className="contact-label">Staff name</label>
              <input
                className="contact-input"
                value={staffForm.name}
                onChange={(e) => setStaffForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="contact-field">
              <label className="contact-label">Staff email</label>
              <input
                className="contact-input"
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
          </motion.div>
          <div className="contact-form-row">
            <div className="contact-field">
              <label className="contact-label">Role</label>
              <select
                className="contact-input"
                value={staffForm.role}
                onChange={(e) => setStaffForm((p) => ({ ...p, role: e.target.value as StaffRole }))}
              >
                <option value="support">Support</option>
                <option value="sales">Sales</option>
                <option value="master">Master</option>
              </select>
            </div>
            <div className="contact-field">
              <label className="contact-label">Branch</label>
              <input
                className="contact-input"
                value={staffForm.branch}
                onChange={(e) => setStaffForm((p) => ({ ...p, branch: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Staff ID
          </button>
        </form>
        {staffCreateMessage && (
          <p className="contact-body" style={{ marginTop: 12, color: '#6f4fb1' }}>
            {staffCreateMessage}
          </p>
        )}
      </section>
      <section className="admin-role-card">
        <div className="admin-list-header">
          <span>Staff Directory</span>
          <span>{staffMembers.length} members</span>
        </div>
        {staffMembers.map((member) => (
          <div key={member.id} className="admin-user-row">
            <motion.div className="admin-user-avatar" layout>
              {member.name.slice(0, 2).toUpperCase()}
            </motion.div>
            <div className="admin-user-info">
              <span className="admin-user-name">{member.name}</span>
              <span className="admin-user-email">
                {member.email} · {member.branch}
              </span>
            </div>
            <span className={`admin-status-badge admin-status--${member.status}`}>{member.role}</span>
            <span className="admin-user-since">{member.id}</span>
          </div>
        ))}
      </section>
    </motion.div>
  )
}
