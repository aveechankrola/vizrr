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

// POST /api/addresses — Save new address with location
router.post('/', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    const { label, firstName, lastName, phone, address, city, pincode, lat, lng } = req.body
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
      lat: lat || 0,
      lng: lng || 0,
    })
    res.status(201).json({ success: true, data: newAddr })
  } catch (err) {
    console.error('Error creating address:', err)
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
