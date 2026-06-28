const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { clerkMiddleware } = require('./middleware/clerkAuth');

// Import routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(compression());
const defaultOrigins = [
  'http://localhost:5173',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
];
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : defaultOrigins;

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Public routes (no auth required)
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/cart', clerkMiddleware, cartRoutes);
app.use('/api/orders', clerkMiddleware, orderRoutes);
app.use('/api/users', clerkMiddleware, userRoutes);
app.use('/api/ai', clerkMiddleware, aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Production: serve Vite build from client/dist (same-origin HTTPS for web + PWA)
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Vizrr Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
