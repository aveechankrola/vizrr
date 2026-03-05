const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const User = require('../models/User')
const { sessions } = require('../data/store')

function hashPassword(plain) {
  return crypto.createHash('sha256').update(plain + 'keprates_salt').digest('hex')
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' })
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    }

    const { phone } = req.body
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      passwordHash: hashPassword(password),
    })

    const token = generateToken()
    sessions[token] = user._id.toString()

    res.status(201).json({
      success: true,
      message: 'Account created!',
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' })
    }

    const token = generateToken()
    sessions[token] = user._id.toString()

    res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token && sessions[token]) delete sessions[token]
  res.json({ success: true, message: 'Logged out.' })
})

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token || !sessions[token]) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' })
    }
    const user = await User.findById(sessions[token])
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })
    res.json({
      success: true,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
