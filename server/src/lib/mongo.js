import mongoose from 'mongoose'

export async function connectMongo() {
  const uri = process.env.MONGODB_URI || ''

  if (!uri) {
    return false
  }

  if (mongoose.connection.readyState === 1) {
    return true
  }

  const isSrvUri = uri.startsWith('mongodb+srv://')
  const tlsEnabled = process.env.MONGODB_TLS
    ? process.env.MONGODB_TLS.toLowerCase() === 'true'
    : isSrvUri

  mongoose.set('strictQuery', true)

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || undefined,
    tls: tlsEnabled,
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 10),
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
  })

  console.log('MongoDB connected for Vizrr products')
  return true
}