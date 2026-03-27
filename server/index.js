require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const path = require('path')
const { clerkMiddleware } = require('@clerk/express')
const connectDB = require('./db')

const productsRouter = require('./routes/products')
const cartRouter = require('./routes/cart')
const contactRouter = require('./routes/contact')
const ordersRouter = require('./routes/orders')
const authRouter = require('./routes/auth')
const addressesRouter = require('./routes/addresses')
const walletRouter = require('./routes/wallet')
const adminRouter = require('./routes/admin')

const app = express()
const PORT = process.env.PORT || 4000

// ── Connect to MongoDB ────────────────────────────────────────
connectDB()

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "https://www.keprates.in", "https://keprates.in"],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/contact', contactRouter)
app.use('/api/orders', clerkMiddleware(), ordersRouter)
app.use('/api/auth', authRouter)
app.use('/api/addresses', clerkMiddleware(), addressesRouter)
app.use('/api/wallet', clerkMiddleware(), walletRouter)
app.use('/api/admin', clerkMiddleware(), adminRouter)

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Keprates API is running', timestamp: new Date().toISOString() })
})

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// ── Serve React client (production) ─────────────────────────
const clientDist = path.join(__dirname, '../client/dist')
app.use(express.static(clientDist))
app.get('/*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`✅  Keprates API running at http://localhost:${PORT}`)
  console.log(`   GET  /api/products`)
  console.log(`   GET  /api/products/:id`)
  console.log(`   GET  /api/cart`)
  console.log(`   POST /api/cart`)
  console.log(`   PATCH /api/cart/:itemId`)
  console.log(`   DELETE /api/cart/:itemId`)
  console.log(`   POST /api/contact`)
  console.log(`   GET  /api/health`)
})
