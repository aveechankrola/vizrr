const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId:  { type: String, default: null },
  customer: {
    firstName: String,
    lastName:  String,
    email:     String,
    phone:     String,
    address:   String,
    city:      String,
    pincode:   String,
  },
  items: [{
    productId: String,
    name:      String,
    category:  String,
    price:     Number,
    quantity:  Number,
    lineTotal: Number,
  }],
  subtotal:      Number,
  deliveryFee:   Number,
  total:         Number,
  paymentMethod: { type: String, default: 'cod' },
  status: {
    type:    String,
    default: 'confirmed',
    enum:    ['pending', 'confirmed', 'cancelled', 'delivered'],
  },
  placedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Order', orderSchema)
