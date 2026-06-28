import { motion } from 'framer-motion'
import { useAdmin } from './AdminProvider'

export function AdminSalesPage() {
  const {
    salesConsultations,
    salesConsultForm,
    setSalesConsultForm,
    staffMembers,
    handleScheduleSalesConsult,
  } = useAdmin()

  return (
    <motion.div className="admin-role-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="admin-page-title">Sales</h2>
      <section className="admin-role-card">
        <div className="admin-list-header">
          <span>Book a Consultation</span>
        </div>
        <form className="admin-product-form" onSubmit={handleScheduleSalesConsult}>
          <div className="contact-form-row">
            <div className="contact-field">
              <label className="contact-label">Customer name</label>
              <input
                className="contact-input"
                value={salesConsultForm.customerName}
                onChange={(e) => setSalesConsultForm((p) => ({ ...p, customerName: e.target.value }))}
              />
            </div>
            <motion.div className="contact-field" layout>
              <label className="contact-label">Product / frame</label>
              <input
                className="contact-input"
                value={salesConsultForm.product}
                onChange={(e) => setSalesConsultForm((p) => ({ ...p, product: e.target.value }))}
              />
            </motion.div>
          </div>
          <motion.div className="contact-form-row" layout>
            <motion.div className="contact-field" layout>
              <label className="contact-label">Executive</label>
              <select
                className="contact-input"
                value={salesConsultForm.executive}
                onChange={(e) => setSalesConsultForm((p) => ({ ...p, executive: e.target.value }))}
              >
                <option value="">Assign later</option>
                {staffMembers
                  .filter((s) => s.status === 'active' && (s.role === 'sales' || s.role === 'master'))
                  .map((staff) => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name} · {staff.role}
                    </option>
                  ))}
              </select>
            </motion.div>
            <div className="contact-field">
              <label className="contact-label">Date</label>
              <input
                className="contact-input"
                type="date"
                value={salesConsultForm.date}
                onChange={(e) => setSalesConsultForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
          </motion.div>
          <div className="contact-field">
            <label className="contact-label">Time</label>
            <input
              className="contact-input"
              type="time"
              value={salesConsultForm.time}
              onChange={(e) => setSalesConsultForm((p) => ({ ...p, time: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Book Consultation
          </button>
        </form>
      </section>
      <section className="admin-role-card">
        <div className="admin-list-header">
          <span>Consultation Board</span>
          <span>{salesConsultations.length} booked</span>
        </div>
        {salesConsultations.map((consult) => (
          <div key={consult.id} className="admin-consult-row">
            <motion.div className="admin-ticket-info" layout>
              <span className="admin-ticket-customer">{consult.customerName}</span>
              <span className="admin-ticket-topic">{consult.product}</span>
              <span className="admin-ticket-note">
                {consult.date} · {consult.time || 'TBD'}
              </span>
            </motion.div>
            <span className={`admin-status-badge admin-status--${consult.status}`}>{consult.status}</span>
          </div>
        ))}
      </section>
    </motion.div>
  )
}
