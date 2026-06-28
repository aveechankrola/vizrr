const mongoose = require('mongoose');

let cachedClient = null;
let reconnectTimer = null;

function scheduleReconnect() {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectDB().catch(() => {});
  }, 30000);
}

async function connectDB() {
  if (cachedClient) {
    console.log('✓ Using cached DB connection');
    return cachedClient;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vizrr';
    const dbName = process.env.MONGODB_DB_NAME || 'vizrr';
    
    const client = await mongoose.connect(mongoUri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
    });

    cachedClient = client;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    console.log('✓ Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    scheduleReconnect();
    return null;
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    cachedClient = null;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Failed to disconnect:', error.message);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  mongoose,
};
