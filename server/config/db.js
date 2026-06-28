const mongoose = require('mongoose');

let cachedClient = null;

async function connectDB() {
  if (cachedClient) {
    console.log('✓ Using cached DB connection');
    return cachedClient;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vizrr';
    
    const client = await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
    });

    cachedClient = client;
    console.log('✓ Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    cachedClient = null;
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
