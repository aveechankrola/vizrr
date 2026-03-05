const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
  userId:  { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [{
    id:          Number,
    type:        String,
    amount:      Number,
    description: String,
    date:        Date,
  }],
})

module.exports = mongoose.model('Wallet', walletSchema)
