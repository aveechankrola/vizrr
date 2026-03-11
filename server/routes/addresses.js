const express = require('express')
const router = express.Router()
const { requireAuth } = require('@clerk/express')
const Address = require('../models/Address')

// GET /api/addresses
router.get('/', requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  try {
    const addrs = await Address.find({ userId })
    res.json({ success: true, data: addrs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/addresses
router.post('/', requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  try {
    const { label, firstName, lastName, phone, address, city, pincode } = req.body
    if (!address || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'Address, city and pincode are required.' })
    }
    const newAddr = await Address.create({
      userId,
      label: label?.trim() || 'Home',
      firstName: firstName?.trim() || '',
      lastName: lastName?.trim() || '',
      phone: phone?.trim() || '',
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    })
    res.status(201).json({ success: true, data: newAddr })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/addresses/:id
router.delete('/:id', requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  try {
    await Address.findOneAndDelete({ _id: req.params.id, userId })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
