const express = require('express')
const router = express.Router()
const { requireAuth } = require('@clerk/express')
const Wallet = require('../models/Wallet')

// GET /api/wallet
router.get('/', requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  try {
    let wallet = await Wallet.findOne({ userId })
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0, transactions: [] })
    res.json({ success: true, data: wallet })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
