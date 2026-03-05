// Shared in-memory store — sessions only (all persistent data is in MongoDB)
const sessions = {}        // token → userId
const adminSessions = {}   // token → 'admin'

// Admin credentials (hardcoded)
const ADMIN_EMAIL = 'admin@keprates.com'
const ADMIN_PASSWORD = 'admin123'

module.exports = { sessions, adminSessions, ADMIN_EMAIL, ADMIN_PASSWORD }
