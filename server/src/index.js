import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

import aiRoutes from './routes/aiRoutes.js'
import productsRoutes from './routes/productsRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { connectMongo } from './lib/mongo.js'

const app = express()
const PORT = process.env.PORT || 4000

app.disable('x-powered-by')
app.use(cors())
app.use(express.json({ limit: '12mb' }))
app.use(express.urlencoded({ extended: true, limit: '12mb' }))

app.use('/api/ai', aiRoutes)
app.use('/api', adminRoutes)
app.use('/api', productsRoutes)

// serve uploaded files when saved locally
app.use('/uploads', express.static(path.resolve(process.cwd(), 'server', 'public', 'uploads')))

app.get('/', (req, res) => res.json({ status: 'vizrr server running' }))

async function startServer() {
  try {
    await connectMongo()
  } catch (error) {
    console.warn('MongoDB is not configured or unavailable, falling back to local product storage.')
  }

  app.listen(PORT, () => {
    console.log(`Vizrr server listening on http://localhost:${PORT}`)
  })
}

startServer()
