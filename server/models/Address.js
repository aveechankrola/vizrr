const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  label: { type: String, default: 'Home' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
})

module.exports = mongoose.model('Address', addressSchema)
