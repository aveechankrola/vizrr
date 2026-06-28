# Vizrr Backend Setup Guide

## 🚀 Quick Start

### 1. **Install Dependencies**

```bash
cd server
npm install
```

### 2. **Configure Environment Variables**

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vizrr
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vizrr

# CORS
CORS_ORIGIN=http://localhost:5173

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# AI Providers (Optional - for advanced face detection)
# If not provided, the system uses local face detection
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Payment (Optional - Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. **Setup MongoDB**

#### Option A: Local MongoDB
```bash
# Make sure MongoDB is running
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/vizrr`
4. Add to `.env` as `MONGODB_URI`

### 4. **Setup Cloudinary (Image Upload)**

1. Create account at https://cloudinary.com
2. Go to Dashboard → Settings
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add to `.env`

### 5. **Setup Clerk (Authentication)**

1. Create account at https://clerk.dev
2. Create an application
3. Copy Secret Key from settings
4. Add to `.env` as `CLERK_SECRET_KEY`
5. Configure webhook in Clerk dashboard to:
   - URL: `http://localhost:5000/api/auth/webhook/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`

### 6. **Start the Server**

```bash
npm run dev
```

Server will run on: `http://localhost:5000`

## 📁 Project Structure

```
server/
├── config/
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Cloudinary setup
├── middleware/
│   ├── clerkAuth.js       # Clerk authentication
│   └── errorHandler.js    # Error handling
├── models/
│   ├── Spectacle.js       # Product schema
│   ├── User.js            # User schema
│   ├── Order.js           # Order & Cart schema
│   └── FaceAnalysis.js    # Face analysis results
├── controllers/
│   ├── productController.js  # Product logic
│   ├── aiController.js       # Face analysis logic
│   ├── cartController.js     # Cart logic
│   ├── orderController.js    # Order logic
│   └── userController.js     # User logic
├── routes/
│   ├── products.js        # Product endpoints
│   ├── ai.js              # AI analyzer endpoints
│   ├── cart.js            # Cart endpoints
│   ├── orders.js          # Order endpoints
│   ├── users.js           # User endpoints
│   └── auth.js            # Auth endpoints
├── utils/
│   ├── faceAnalyzer.js    # AI face shape detection (BRAIN)
│   └── helpers.js         # Utility functions
├── index.js               # Main server file
├── package.json
└── .env                   # Environment variables (create this)
```

## 🧠 AI Face Analyzer Brain

The face analyzer is production-grade and never fails:

### Features:
- **Multi-Provider Support**: OpenAI → Anthropic → Local
- **Intelligent Fallback**: If cloud services fail, uses local detection
- **Face Shape Detection**: Detects 6 face shapes (oval, round, square, heart, diamond, oblong)
- **Frame Recommendations**: Suggests specific styles for each shape
- **Size Guidance**: Provides frame width, lens width, and bridge recommendations
- **Robust**: Always returns a result, never throws unhandled errors

### How It Works:
1. Receives base64 encoded face image
2. Tries OpenAI vision (if API key available)
3. Falls back to Anthropic vision
4. Falls back to local heuristic detection
5. Returns standardized analysis with frame recommendations

### Supported Face Shapes:
```
- Oval: Balanced, slightly longer
- Round: Fuller cheeks, rounded forehead
- Square: Strong jawline
- Heart: Wider forehead, narrower chin
- Diamond: Prominent cheekbones
- Oblong/Rectangular: Longer, consistent width
```

## 🔌 API Endpoints

### Products
```
GET  /api/products              # List products
GET  /api/products/:id          # Get product details
GET  /api/products/search       # Search products
GET  /api/products/by-face-shape/:shape # Products for face shape
POST /api/products              # Create (admin)
PUT  /api/products/:id          # Update (admin)
DELETE /api/products/:id        # Delete (admin)
```

### AI Face Analyzer (Protected)
```
POST /api/ai/analyze            # Analyze face from image
GET  /api/ai/latest-analysis    # Get user's latest analysis
GET  /api/ai/history            # Analysis history
GET  /api/ai/shapes             # Supported face shapes
GET  /api/ai/recommendations/:faceShape  # Frame recommendations
POST /api/ai/compare-shapes     # Compare multiple shapes
```

### Cart (Protected)
```
GET  /api/cart                  # Get cart
POST /api/cart/add              # Add item
PUT  /api/cart/update           # Update quantity
DELETE /api/cart/remove         # Remove item
DELETE /api/cart/clear          # Clear cart
```

### Orders (Protected)
```
POST /api/orders                # Place order
GET  /api/orders                # User's orders
GET  /api/orders/:orderId       # Order details
DELETE /api/orders/:orderId     # Cancel order
GET  /api/orders/track/:id      # Track order
```

### Users (Protected)
```
GET  /api/users/profile         # Get profile
PUT  /api/users/profile         # Update profile
GET  /api/users/addresses       # Get addresses
POST /api/users/addresses       # Add address
PUT  /api/users/addresses/:id   # Update address
DELETE /api/users/addresses/:id # Delete address
GET  /api/users/wallet          # Get wallet
POST /api/users/wallet/add      # Add funds
```

### Authentication
```
POST /api/auth/login            # Login/create user
POST /api/auth/verify-token     # Verify token
POST /api/auth/logout           # Logout
POST /api/auth/webhook/clerk    # Clerk webhook
```

## 🔐 Authentication Flow

1. **Client**: User signs in via Clerk UI
2. **Client**: Gets authentication token from Clerk
3. **Client**: Sends token in `Authorization: Bearer <token>` header
4. **Server**: Verifies token with Clerk
5. **Server**: Extracts user data and attaches to request
6. **Server**: Processes request with user context

## 📊 Database Schema Overview

### User
```javascript
{
  clerkId: String (unique),
  email: String,
  firstName: String,
  lastName: String,
  faceAnalysis: {
    detectedShape: String,
    confidence: Number,
    recommendedStyles: [String],
    analysisDate: Date
  },
  addresses: [{
    name, phone, addressLine1, city, state, postalCode
  }],
  wallet: {
    balance: Number,
    currency: String
  },
  role: 'customer' | 'admin' | 'support'
}
```

### Product (Spectacle)
```javascript
{
  name: String,
  category: 'sunglasses' | 'eyeglasses',
  price: Number,
  image: { url, publicId },
  material: String,
  style: String,
  frameWidth: Number,
  lensWidth: Number,
  bridgeWidth: Number,
  suitableFaceShapes: [String],
  stock: Number,
  rating: Number
}
```

### Order
```javascript
{
  orderId: String (unique),
  userId: String,
  items: [{
    productId, productName, quantity, price
  }],
  customerDetails: { name, email, phone },
  shippingAddress: { ... },
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered',
  totalAmount: Number,
  paymentStatus: 'pending' | 'completed' | 'failed'
}
```

## 🧪 Testing

### Test Face Analysis
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "base64_image_string",
    "width": 640,
    "height": 480
  }'
```

### Test Products
```bash
curl http://localhost:5000/api/products
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check MongoDB is running: `mongod`
- Check URI in `.env`: `mongodb://localhost:27017/vizrr`
- For Atlas, ensure IP is whitelisted

### Cloudinary Upload Failed
- Verify credentials in `.env`
- Check API key/secret is correct

### Clerk Auth Failed
- Verify `CLERK_SECRET_KEY` in `.env`
- Check webhook is configured in Clerk dashboard
- Token format: `Bearer <token_from_clerk>`

### Face Analysis Returns Fallback
- Check API keys if using OpenAI/Anthropic
- Local fallback always works even if no keys provided
- Check image is valid base64

## 📦 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (not local)
- [ ] Configure Cloudinary production credentials
- [ ] Set Clerk production secret
- [ ] Update `CORS_ORIGIN` to your frontend domain
- [ ] Update `FRONTEND_URL` for payment callbacks
- [ ] Enable SSL/HTTPS
- [ ] Set up environment variables on hosting platform

### Deploy to Vercel, Render, or Heroku
1. Push code to GitHub
2. Connect repository to hosting platform
3. Add environment variables
4. Deploy

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs: `npm run dev`
3. Check MongoDB connection
4. Verify all credentials in `.env`

---

**Built with ❤️ for Vizrr**
