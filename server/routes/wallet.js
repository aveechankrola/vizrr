const express = require('express')
const router = express.Router()
const Wallet = require('../models/Wallet')
const { sessions } = require('../data/store')

function requireAuth(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || !sessions[token]) {
    res.status(401).json({ success: false, message: 'Not authenticated.' })
    return null
  }
  return sessions[token]
}

// GET /api/wallet
router.get('/', async (req, res) => {
  const userId = requireAuth(req, res)
  if (!userId) return
  try {
    let wallet = await Wallet.findOne({ userId })
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0, transactions: [] })
    res.json({ success: true, data: wallet })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
