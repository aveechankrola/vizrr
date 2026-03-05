const express = require('express')
const router = express.Router()
const Address = require('../models/Address')
const { sessions } = require('../data/store')

function requireAuth(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || !sessions[token]) {
    res.status(401).json({ success: false, message: 'Not authenticated.' })
    return null
  }
  return sessions[token]
}

// GET /api/addresses
router.get('/', async (req, res) => {
  const userId = requireAuth(req, res)
  if (!userId) return
  try {
    const addrs = await Address.find({ userId })
    res.json({ success: true, data: addrs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/addresses
router.post('/', async (req, res) => {
  const userId = requireAuth(req, res)
  if (!userId) return
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
router.delete('/:id', async (req, res) => {
  const userId = requireAuth(req, res)
  if (!userId) return
  try {
    await Address.findOneAndDelete({ _id: req.params.id, userId })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
