const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { adminSessions, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../data/store')
const User = require('../models/User')
const Product = require('../models/Product')
const Order = require('../models/Order')

function requireAdmin(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || adminSessions[token] !== 'admin') {
    res.status(401).json({ success: false, message: 'Admin access required.' })
    return false
  }
  return true
}

// -- POST /api/admin/login ------------------------------------
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' })
  }
  const token = crypto.randomBytes(32).toString('hex')
  adminSessions[token] = 'admin'
  res.json({ success: true, token })
})

// -- POST /api/admin/logout -----------------------------------
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token) delete adminSessions[token]
  res.json({ success: true })
})

// -- GET /api/admin/stats -------------------------------------
router.get('/stats', async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const orders = await Order.find()
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0)
    const [totalUsers, totalProducts] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
    ])
    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalUsers,
        totalProducts,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// -- GET /api/admin/orders ------------------------------------
router.get('/orders', async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const orders = await Order.find().sort({ placedAt: -1 })
    res.json({ success: true, data: orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// -- PATCH /api/admin/orders/:id/status ----------------------
router.patch('/orders/:id/status', async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const { status } = req.body
    const allowed = ['pending', 'confirmed', 'cancelled', 'delivered']
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` })
    }
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { status },
      { new: true }
    )
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// -- GET /api/admin/products ----------------------------------
router.get('/products', async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const products = await Product.find().sort({ createdAt: 1 })
    res.json({ success: true, data: products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// -- POST /api/admin/products ---------------------------------
router.post('/products', async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const { name, category, price, originalPrice, onSale, image, description, rating } = req.body
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'name, category and price are required.' })
    }
    if (!['chocolate-cake', 'chocolate'].includes(category)) {
      return res.status(400).json({ success: false, message: 'category must be chocolate-cake or chocolate.' })
    }
    const product = await Product.create({
      name: name.trim(),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      onSale: Boolean(onSale),
      image: image?.trim() || '',
      description: description?.trim() || '',
      rating: rating ? Number(rating) : 4.5,
    })
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// -- PATCH /api/admin/products/:id ---------------------------
router.patch('/products/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const { name, category, price, originalPrice, onSale, image, description, rating } = req.body
    if (category && !['chocolate-cake', 'chocolate'].includes(category)) {
      return res.status(400).json({ success: false, message: 'category must be chocolate-cake or chocolate.' })
    }
    const updates = {}
    if (name !== undefined)          updates.name = name.trim()
    if (category !== undefined)      updates.category = category
    if (price !== undefined)         updates.price = Number(price)
    if (originalPrice !== undefined) updates.originalPrice = originalPrice ? Number(originalPrice) : undefined
    if (onSale !== undefined)        updates.onSale = Boolean(onSale)
    if (image !== undefined)         updates.image = image.trim()
    if (description !== undefined)   updates.description = description.trim()
    if (rating !== undefined)        updates.rating = Number(rating)
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// -- DELETE /api/admin/products/:id --------------------------
router.delete('/products/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// -- GET /api/admin/users -------------------------------------
router.get('/users', async (req, res) => {
  if (!requireAdmin(req, res)) return
  try {
    const users = await User.find({}, { passwordHash: 0 })
    res.json({ success: true, data: users })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
