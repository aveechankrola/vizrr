# Vizrr Backend Server

Premium eyewear shopping platform with AI-powered face shape detection and personalized frame recommendations.

## 🌟 Features

### 🛍️ E-Commerce
- Product catalog with Cloudinary image hosting
- Advanced filtering (price, style, material, face shape)
- Shopping cart management
- Complete order lifecycle (pending → confirmed → shipped → delivered)
- Order tracking and cancellation
- Wallet system for store credits

### 🧠 AI Face Analyzer (Production-Grade Brain)
- **Multi-Provider Face Detection**
  - Primary: OpenAI Vision API
  - Secondary: Anthropic Claude Vision
  - Fallback: Local heuristic detection (always works)
- **6 Face Shape Detection**: Oval, Round, Square, Heart, Diamond, Oblong
- **Smart Recommendations**: Suggests specific frame styles for each face shape
- **Size Guidance**: Precise frame width, lens width, and bridge measurements
- **Zero Failures**: Local fallback ensures analysis always succeeds

### 👤 User Management
- Clerk authentication integration
- User profiles with preferences
- Multiple saved addresses
- Wallet and transaction history
- Face analysis history tracking

### 📊 Admin Features
- Product management (CRUD)
- Order management
- User management
- Sales statistics (ready to implement)

### 🔐 Security
- Clerk authentication for all protected endpoints
- MongoDB encryption ready
- CORS protection
- Input validation and sanitization
- Secure image handling via Cloudinary

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           CLIENT (React + Vite)                     │
│  - Face Analyzer UI                                 │
│  - Product Browsing                                 │
│  - Shopping Cart                                    │
│  - User Authentication (Clerk)                      │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────────────┐
│    BACKEND SERVER (Express.js)                      │
├──────────────────────────────────────────────────────┤
│  Routes & Controllers                               │
│  ├─ Products       → productController              │
│  ├─ AI Analyzer    → aiController                   │
│  ├─ Cart           → cartController                 │
│  ├─ Orders         → orderController                │
│  ├─ Users          → userController                 │
│  └─ Auth           → clerkAuth middleware           │
├──────────────────────────────────────────────────────┤
│  Business Logic                                     │
│  ├─ Face Analyzer Brain    → utils/faceAnalyzer.js │
│  ├─ Helper Functions       → utils/helpers.js      │
│  └─ Error Handling         → middleware/            │
├──────────────────────────────────────────────────────┤
│  Data Layer                                         │
│  ├─ MongoDB Models                                  │
│  │  ├─ Spectacle (Products)                        │
│  │  ├─ User                                         │
│  │  ├─ Order & Cart                                │
│  │  └─ FaceAnalysis                                │
│  └─ Database Connection                            │
└──────────┬──────────────────┬──────────────────┬───┘
           │                  │                  │
      ┌────▼────┐      ┌─────▼──────┐    ┌────▼─────┐
      │MongoDB  │      │Cloudinary  │    │Clerk     │
      │(Data)   │      │(Images)    │    │(Auth)    │
      └─────────┘      └────────────┘    └──────────┘
```

## 📦 Tech Stack

**Core**
- Node.js (Runtime)
- Express.js (Web Framework)
- MongoDB (Database)
- Mongoose (ODM)

**Integration**
- Cloudinary (Image Hosting)
- Clerk (Authentication)
- Razorpay (Payments - Optional)
- OpenAI / Anthropic (AI Vision - Optional)

**Development**
- Nodemon (Auto-reload)
- Helmet (Security Headers)
- CORS (Cross-Origin)
- Compression (Response Compression)

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

4. **Server Running**
   ```
   🚀 Vizrr Server running on http://localhost:5000
   📡 API available at http://localhost:5000/api
   ```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup and deployment guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoints and examples
- **[Architecture](#-architecture)** - System design overview

## 🧠 AI Face Analyzer Deep Dive

### The Brain: `utils/faceAnalyzer.js`

This is where the magic happens. It's designed to **never fail**:

```
User uploads face image
    ↓
Try OpenAI Vision (if key available)
    ↓ Success → Return result
    ↓ Fail → Try next provider
Try Anthropic Vision (if key available)
    ↓ Success → Return result
    ↓ Fail → Try next provider
Try Local Heuristic Detection
    ↓ Always succeeds → Return result
```

### Face Shape Detection Algorithm

1. **Input**: Face image (base64)
2. **Extraction**: Measure width/height ratio
3. **Classification**:
   - Ratio ≤ 0.92 → Round
   - Ratio 0.93-1.05 → Square/Oval/Diamond
   - Ratio 1.05-1.15 → Heart
   - Ratio > 1.15 → Oblong/Rectangular
4. **Recommendation**:
   - Get frame styles for detected shape
   - Calculate optimal frame width
   - Provide lens and bridge guidance
5. **Output**: Structured analysis JSON

### Supported Face Shapes

| Shape | Characteristics | Recommended Frames | Frame Width |
|-------|-----------------|-------------------|------------|
| Oval | Balanced proportions | Aviator, Square, Cat-eye | 124-130mm |
| Round | Fuller cheeks | Rectangular, Geometric | 124-130mm |
| Square | Strong jawline | Round, Oval, Cat-eye | 126-132mm |
| Heart | Wide forehead | Browline, Oval, Aviator | 126-132mm |
| Diamond | Prominent cheekbones | Oval, Cat-eye, Rimless | 124-130mm |
| Oblong | Longer face | Round, Aviator, Oversized | 128-138mm |

## 🔄 Request-Response Cycle

### Face Analysis Request
```
Client → Camera Capture → Convert to Base64 → Send to Backend
  ↓
Backend → Receive Image Data
  ↓
AI Analyzer → Process (OpenAI/Anthropic/Local)
  ↓
Save to Database (MongoDB + Cloudinary)
  ↓
Get Matching Products
  ↓
Return Analysis + Recommendations
  ↓
Client → Display Results + Products
```

## 🔐 Security Measures

- **Authentication**: Clerk handles secure token verification
- **Authorization**: Role-based access (customer, admin, support)
- **Input Validation**: All inputs sanitized
- **Error Handling**: Detailed errors in dev, generic in production
- **Image Security**: Cloudinary CDN, no local storage
- **Database**: Prepared statements via Mongoose
- **CORS**: Configurable origin whitelist
- **Headers**: Helmet.js security headers

## 📈 Scalability

Currently optimized for:
- 1000s of products
- 100s of concurrent users
- Real-time cart updates

For higher scale:
1. Add caching layer (Redis)
2. Implement rate limiting
3. Use CDN for static assets
4. Add database indexing
5. Implement API versioning
6. Add message queue (Bull/RabbitMQ)

## 🧪 Testing API Locally

### 1. Get Products
```bash
curl http://localhost:5000/api/products
```

### 2. Analyze Face (with token)
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "base64_string_here",
    "width": 640,
    "height": 480
  }'
```

### 3. Get Face Shapes
```bash
curl -X GET http://localhost:5000/api/ai/shapes \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

## 🐛 Debugging

**Enable verbose logging:**
```bash
NODE_ENV=development npm run dev
```

**Check MongoDB connection:**
```bash
# In MongoDB CLI
use vizrr
db.spectacles.countDocuments()
```

**Verify Cloudinary:**
```bash
# Check environment variables
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
```

## 📝 Environment Variables

See `.env.example` for all available options:

**Required**
- `MONGODB_URI` - Database connection
- `CLERK_SECRET_KEY` - Authentication
- `CLOUDINARY_*` - Image hosting

**Optional**
- `OPENAI_API_KEY` - OpenAI Vision (falls back to local)
- `ANTHROPIC_API_KEY` - Claude Vision (falls back to local)
- `RAZORPAY_*` - Payment processing

## 🚢 Deployment

Ready to deploy to:
- Vercel (serverless)
- Render (PaaS)
- Heroku (classic)
- AWS (EC2/Lambda)
- DigitalOcean (VPS)

See [SETUP_GUIDE.md#-deployment](./SETUP_GUIDE.md#-deployment) for details.

## 📊 Database Models

- **Spectacle**: 15 fields, indexed on category, style, faceShapes
- **User**: 12+ fields, indexed on clerkId, email
- **Order**: 20+ fields, indexed on userId, status
- **FaceAnalysis**: 12+ fields, indexed on userId, createdAt, faceShape
- **Cart**: 6 fields, indexed on userId

## 🔄 API Versioning

Current: v1 (implicit)

Future versions at `/api/v2/...`

## 💡 Tips & Tricks

1. **Face analysis performance**: Local fallback is fastest (~10ms)
2. **Image optimization**: Cloudinary handles all resizing
3. **Cart persistence**: Stored in MongoDB, loaded on login
4. **Order tracking**: Realtime status updates via order history
5. **Bulk operations**: Use Promise.all() for multiple requests

## 📞 Support

- **Issues**: Check error responses and logs
- **Debugging**: Enable verbose logging
- **Documentation**: Refer to API_DOCUMENTATION.md
- **Troubleshooting**: See SETUP_GUIDE.md#troubleshooting

## 📄 License

MIT License - Feel free to use and modify

## 👨‍💻 Development

**Contributing Guidelines**
1. Create feature branch
2. Make changes
3. Test locally
4. Submit PR

**Code Style**
- Consistent 2-space indentation
- Meaningful variable names
- Comments for complex logic
- Error handling on all endpoints

---

**Made with ❤️ for Vizrr Premium Eyewear**
