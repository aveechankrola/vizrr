const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

// GET /api/products
// Query params: ?category=chocolate-cake|chocolate  ?sale=true  ?sort=priceLow|priceHigh|featured
router.get('/', async (req, res) => {
  try {
    const { category, sale, sort } = req.query
    const filter = {}
    if (category === 'chocolate-cake' || category === 'chocolate') filter.category = category
    if (sale === 'true') filter.onSale = true

    let query = Product.find(filter)
    if (sort === 'priceLow') query = query.sort({ price: 1 })
    else if (sort === 'priceHigh') query = query.sort({ price: -1 })
    else query = query.sort({ createdAt: 1 })

    const products = await query
    res.json({ success: true, data: products })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
