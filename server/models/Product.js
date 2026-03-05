const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  category:      { type: String, required: true, enum: ['chocolate-cake', 'chocolate'] },
  price:         { type: Number, required: true },
  originalPrice: { type: Number },
  onSale:        { type: Boolean, default: false },
  image:         { type: String, default: '' },
  description:   { type: String, default: '' },
  rating:        { type: Number, default: 4.5 },
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)
