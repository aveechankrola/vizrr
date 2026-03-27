const express = require('express')
const router = express.Router()
const { requireAuth } = require('@clerk/express')
const Product = require('../models/Product')
const Order = require('../models/Order')
const Wallet = require('../models/Wallet')

let nextOrderId = 1000

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    const userId = req.auth?.userId ?? null
    const { customer, items, paymentMethod } = req.body

    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'pincode']
    for (const field of required) {
      if (!customer?.[field]) {
        return res.status(400).json({ success: false, message: `Missing field: customer.${field}` })
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' })
    }

    const enrichedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId)
      if (!product) throw new Error(`Product ${item.productId} not found`)
      return {
        productId: product._id.toString(),
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: Number(item.quantity),
        lineTotal: Number((product.price * item.quantity).toFixed(2)),
      }
    }))

    const subtotal = enrichedItems.reduce((s, i) => s + i.lineTotal, 0)
    const deliveryFee = subtotal >= 50 ? 0 : 5
    const total = Number((subtotal + deliveryFee).toFixed(2))

    const order = await Order.create({
      orderId: `KPR-${nextOrderId++}`,
      userId,
      customer,
      items: enrichedItems,
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'cod',
      status: paymentMethod === 'online' ? 'pending' : 'confirmed',
      paymentStatus: paymentMethod === 'online' ? 'pending' : 'completed',
    })

    // 5% cashback for authenticated users
    if (userId) {
      const cashback = Number((total * 0.05).toFixed(2))
      let wallet = await Wallet.findOne({ userId })
      if (!wallet) wallet = new Wallet({ userId, balance: 0, transactions: [] })
      wallet.balance = Number((wallet.balance + cashback).toFixed(2))
      wallet.transactions.push({
        id: Date.now(),
        type: 'cashback',
        amount: cashback,
        description: `5% cashback on order ${order.orderId}`,
        date: new Date(),
      })
      await wallet.save()
    }

    console.log(`[Order] ${order.orderId} placed by ${customer.firstName} ${customer.lastName} — ₹${order.total}`)

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        orderId: order.orderId,
        total: order.total,
        placedAt: order.placedAt,
        estimatedDelivery: '2–4 hours',
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders/my  — orders for the logged-in user
router.get('/my', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    const myOrders = await Order.find({ userId }).sort({ placedAt: -1 })
    res.json({ success: true, data: myOrders })
  } catch (err) {
    console.error('Error fetching orders:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }
    const order = await Order.findOne({ orderId: req.params.id, userId })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' })
    }
    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled.' })
    }
    order.status = 'cancelled'
    await order.save()
    res.json({ success: true, data: order })
  } catch (err) {
    console.error('Error cancelling order:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/orders  — admin view
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ placedAt: -1 })
    res.json({ success: true, data: orders, total: orders.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
