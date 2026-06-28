import { motion } from 'framer-motion'
import { useAdmin } from './AdminProvider'

export function AdminSupportPage() {
  const {
    supportTickets,
    staffMembers,
    supportTalkMessages,
    supportTalkInput,
    setSupportTalkInput,
    supportTalkLoading,
    handleAssignExecutive,
    handleBookSupportConsult,
    handleSupportTalkSend,
  } = useAdmin()

  return (
    <motion.div className="admin-role-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="admin-page-title">Support</h2>
      <section className="admin-role-card">
        <motion.div className="admin-list-header" layout>
          <span>Support Queue</span>
          <span>{supportTickets.length} open tickets</span>
        </motion.div>
        {supportTickets.length === 0 ? (
          <p className="admin-empty">No support tickets yet.</p>
        ) : (
          supportTickets.map((ticket) => {
            const selectedExecutive = staffMembers.find((s) => s.id === ticket.assignedTo)
            return (
              <div key={ticket.id} className="admin-ticket-row">
                <div className="admin-ticket-info">
                  <span className="admin-ticket-customer">{ticket.customerName}</span>
                  <span className="admin-ticket-topic">{ticket.topic}</span>
                  <span className="admin-ticket-note">{ticket.note}</span>
                </div>
                <div className="admin-ticket-actions">
                  <span className={`admin-status-badge admin-status--${ticket.status}`}>
                    {ticket.status}
                  </span>
                  <select
                    className="admin-status-select"
                    value={ticket.assignedTo}
                    onChange={(e) => handleAssignExecutive(ticket.id, e.target.value)}
                  >
                    <option value="">Assign executive</option>
                    {staffMembers
                      .filter((s) => s.status === 'active' && (s.role === 'support' || s.role === 'sales'))
                      .map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} · {staff.role}
                        </option>
                      ))}
                  </select>
                  <button type="button" className="btn btn-primary" onClick={() => handleBookSupportConsult(ticket.id)}>
                    Book consult
                  </button>
                  <span className="admin-ticket-meta">
                    {selectedExecutive ? `Assigned to ${selectedExecutive.name}` : 'Waiting for assignment'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </section>
      <section className="admin-role-card">
        <div className="admin-list-header">
          <span>Executive Talk</span>
          <span>Internal support desk</span>
        </div>
        <div className="support-chat-window">
          {supportTalkMessages.map((message, index) => (
            <div key={index} className={`support-chat-bubble support-chat-bubble--${message.role}`}>
              {message.content}
            </div>
          ))}
          {supportTalkLoading && <motion.div className="support-chat-loading">Thinking…</motion.div>}
        </div>
        <form className="support-chat-form" onSubmit={handleSupportTalkSend}>
          <textarea
            className="contact-input"
            rows={3}
            placeholder="Ask about a customer, assign staff, or book a consult"
            value={supportTalkInput}
            onChange={(e) => setSupportTalkInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={supportTalkLoading || !supportTalkInput.trim()}>
            Send to Executive
          </button>
        </form>
      </section>
    </motion.div>
  )
}
