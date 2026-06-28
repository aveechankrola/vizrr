import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdmin } from './AdminProvider'

export function AdminLoginPage() {
  const {
    adminToken,
    adminLoginForm,
    setAdminLoginForm,
    adminLoginError,
    adminLoginLoading,
    handleAdminLogin,
  } = useAdmin()

  if (adminToken) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <motion.div
      className="admin-login-wrap admin-login-wrap--page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="admin-login-card">
        <h3 className="admin-login-title">Admin Access</h3>
        <p className="admin-login-sub">Sign in with your admin credentials</p>
        {adminLoginError && <div className="contact-error">⚠ {adminLoginError}</div>}
        <form className="admin-login-form" onSubmit={handleAdminLogin}>
          <div className="contact-field">
            <label className="contact-label">Email</label>
            <input
              className="contact-input"
              type="email"
              placeholder="admin@vizrr.com"
              value={adminLoginForm.email}
              onChange={(e) => setAdminLoginForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="contact-field">
            <label className="contact-label">Password</label>
            <input
              className="contact-input"
              type="password"
              placeholder="••••••••"
              value={adminLoginForm.password}
              onChange={(e) => setAdminLoginForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary admin-login-submit" disabled={adminLoginLoading}>
            {adminLoginLoading ? 'Signing in…' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
