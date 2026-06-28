import express from 'express'
import adminModel from '../models/adminModel.js'

const router = express.Router()

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vizrr.in'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vizrradmin123'

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ success: false, message: 'Missing credentials' })
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = adminModel.createTokenForAdmin(email)
    return res.json({ success: true, token })
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' })
})

router.post('/admin/logout', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (token) adminModel.revokeToken(token)
  res.json({ success: true })
})

export default router
