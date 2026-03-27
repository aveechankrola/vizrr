const express = require('express')
const router = express.Router()
const { requireAuth } = require('@clerk/express')
const Address = require('../models/Address')

// GET /api/addresses
router.get('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    const addrs = await Address.find({ userId })
    res.json({ success: true, data: addrs })
  } catch (err) {
    console.error('Error fetching addresses:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/addresses/:id
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    const result = await Address.findOneAndDelete({ _id: req.params.id, userId })
    if (!result) {
      return res.status(404).json({ success: false, message: 'Address not found' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting address:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
