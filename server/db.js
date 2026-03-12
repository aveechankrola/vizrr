const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/keprates'

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅  Connected to MongoDB at', MONGO_URI)
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
