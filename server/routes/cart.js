const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

// In-memory cart (per server session)
let cart = []
let nextItemId = 1

// GET /api/cart
router.get('/', async (req, res) => {
  try {

    const enriched = await Promise.all(cart.map(async (item) => {
      const product = await Product.findById(item.productId)
      return { ...item, product }
    }))
    const valid = enriched.filter(i => i.product)
    const total = valid.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    res.json({ success: true, data: valid, total: Number(total.toFixed(2)), count: valid.reduce((s, i) => s + i.quantity, 0) })
  } catch (err) {

    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/cart  — body: { productId, quantity? }
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    const existing = cart.find((i) => i.productId === productId)
    if (existing) {
      existing.quantity += Number(quantity)
    } else {
      cart.push({ id: nextItemId++, productId, quantity: Number(quantity) })
    }
    const count = cart.reduce((s, i) => s + i.quantity, 0)
    res.status(201).json({ success: true, message: 'Added to cart', count })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/cart/:itemId  — body: { quantity }
router.patch('/:itemId', (req, res) => {
  const item = cart.find((i) => i.id === Number(req.params.itemId))
  if (!item) {
    return res.status(404).json({ success: false, message: 'Cart item not found' })
  }

  const { quantity } = req.body
  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'quantity must be >= 1' })
  }

  item.quantity = Number(quantity)
  res.json({ success: true, message: 'Cart updated', data: item })
})

// DELETE /api/cart/:itemId
router.delete('/:itemId', (req, res) => {
  const index = cart.findIndex((i) => i.id === Number(req.params.itemId))
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Cart item not found' })
  }

  cart.splice(index, 1)
  const count = cart.reduce((s, i) => s + i.quantity, 0)
  res.json({ success: true, message: 'Item removed', count })
})

// DELETE /api/cart  — clear entire cart
router.delete('/', (req, res) => {
  cart = []
  res.json({ success: true, message: 'Cart cleared' })
})

module.exports = router
res.json({ success: true, message: 'Cart cleared' })


