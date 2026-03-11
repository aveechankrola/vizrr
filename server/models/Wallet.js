const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  id:          { type: Number },
  type:        { type: String },
  amount:      { type: Number },
  description: { type: String },
  date:        { type: Date },
}, { _id: false })

const walletSchema = new mongoose.Schema({
  userId:  { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [transactionSchema],
})

module.exports = mongoose.model('Wallet', walletSchema)
