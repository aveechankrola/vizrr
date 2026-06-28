# Vizrr API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require Clerk authentication token:
```
Authorization: Bearer <clerk_token>
```

---

## 🎨 Products API

### Get All Products
```http
GET /products
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 12)
- `category` - 'sunglasses' or 'eyeglasses'
- `style` - 'aviator', 'round', 'square', 'cat-eye', etc.
- `material` - 'acetate', 'titanium', etc.
- `minPrice`, `maxPrice`
- `onSale` - 'true' or 'false'
- `faceShape` - Face shape to filter by
- `sortBy` - 'price_asc', 'price_desc', 'newest', 'rating'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Aviator Sunglasses",
      "price": 2500,
      "image": { "url": "...", "publicId": "..." },
      "category": "sunglasses",
      "style": "aviator",
      "suitableFaceShapes": ["round", "oblong"],
      "stock": 15,
      "rating": 4.5
    }
  ],
  "pagination": {
    "total": 45,
    "pages": 4,
    "currentPage": 1,
    "limit": 12
  }
}
```

### Get Single Product
```http
GET /products/:id
```

### Search Products
```http
GET /products/search?q=aviator
```

### Get Products by Face Shape
```http
GET /products/by-face-shape/:faceShape
```

**Face Shapes:** `oval`, `round`, `square`, `heart`, `diamond`, `oblong/rectangular`

### Get Sale Products
```http
GET /products/sale
```

### Create Product (Admin)
```http
POST /products
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Aviator Sunglasses",
  "description": "Classic aviator style",
  "category": "sunglasses",
  "price": 2500,
  "originalPrice": 3500,
  "material": "acetate",
  "color": "black",
  "style": "aviator",
  "frameWidth": 140,
  "lensWidth": 55,
  "bridgeWidth": 18,
  "templeLength": 145,
  "suitableFaceShapes": ["round", "oblong"],
  "lensType": "UV Protection",
  "stock": 20,
  "image": <file>
}
```

### Update Product (Admin)
```http
PUT /products/:id
Authorization: Bearer <token>
```

### Delete Product (Admin)
```http
DELETE /products/:id
Authorization: Bearer <token>
```

---

## 🧠 AI Face Analyzer API

### Analyze Face
```http
POST /ai/analyze
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "imageData": "base64_encoded_image",
  "width": 640,
  "height": 480,
  "source": "camera"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "...",
    "faceShape": "round",
    "confidence": 0.85,
    "recommendations": {
      "frameStyles": ["Rectangular", "Geometric", "Browline"],
      "frameWidth": { "min": 124, "max": 130 },
      "lensWidth": { "min": 56, "max": 60 },
      "bridgeWidth": { "min": 16, "max": 18 },
      "why": "add angles and structure to your face"
    },
    "reasoning": "Fuller cheeks with rounded forehead and chin",
    "processingTime": 1250,
    "recommendedProducts": [
      {
        "id": "...",
        "name": "Classic Rectangular Frames",
        "price": 2499,
        "image": { "url": "..." }
      }
    ]
  }
}
```

### Get Latest Analysis
```http
GET /ai/latest-analysis
Authorization: Bearer <token>
```

### Get Analysis History
```http
GET /ai/history?limit=10&page=1
Authorization: Bearer <token>
```

### Get Supported Face Shapes
```http
GET /ai/shapes
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "oval",
      "details": {
        "frameStyles": ["Aviator", "Square", "Cat-eye"],
        "why": "preserve your natural balance"
      }
    }
  ]
}
```

### Get Recommendations for Face Shape
```http
GET /ai/recommendations/:faceShape
Authorization: Bearer <token>
```

**Face Shapes:** `oval`, `round`, `square`, `heart`, `diamond`, `oblong/rectangular`

### Compare Face Shapes
```http
POST /ai/compare-shapes
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "shapes": ["round", "square", "oval"]
}
```

---

## 🛒 Cart API

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "...",
      "quantity": 2,
      "price": 2500,
      "product": { "name": "...", "image": "..." }
    }
  ],
  "total": 5000,
  "count": 2
}
```

### Add to Cart
```http
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

### Update Cart Item
```http
PUT /cart/update
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "productId": "product_id",
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /cart/remove
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "productId": "product_id"
}
```

### Clear Cart
```http
DELETE /cart/clear
Authorization: Bearer <token>
```

---

## 📦 Order API

### Place Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "customerDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "shippingAddress": {
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "Delhi",
    "state": "Delhi",
    "postalCode": "110001",
    "country": "India"
  },
  "billingAddress": { "...": "..." },
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "VZR-ABC123-XYZ",
    "orderDBId": "...",
    "totalAmount": 5000,
    "paymentStatus": "pending",
    "paymentLinkId": "...",
    "estimatedDelivery": "2024-05-20"
  }
}
```

### Get Orders
```http
GET /orders?limit=10&page=1
Authorization: Bearer <token>
```

### Get Single Order
```http
GET /orders/:orderId
Authorization: Bearer <token>
```

### Cancel Order
```http
DELETE /orders/:orderId
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Changed mind"
}
```

### Track Order
```http
GET /orders/track/:orderIdOrNumber
Authorization: Bearer <token>
```

---

## 👤 User API

### Get Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "clerkId": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "faceAnalysis": {
      "detectedShape": "round",
      "confidence": 0.85,
      "analysisDate": "2024-05-10"
    },
    "addresses": [...],
    "wallet": { "balance": 0 }
  }
}
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "preferences": {
    "favoriteStyles": ["aviator", "cat-eye"],
    "favoriteColors": ["black", "gold"]
  }
}
```

### Get Addresses
```http
GET /users/addresses
Authorization: Bearer <token>
```

### Add Address
```http
POST /users/addresses
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Home",
  "phone": "9876543210",
  "addressLine1": "123 Main Street",
  "city": "Delhi",
  "state": "Delhi",
  "postalCode": "110001",
  "country": "India",
  "isDefault": true
}
```

### Update Address
```http
PUT /users/addresses/:addressId
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Address
```http
DELETE /users/addresses/:addressId
Authorization: Bearer <token>
```

### Get Wallet
```http
GET /users/wallet
Authorization: Bearer <token>
```

### Add Wallet Balance
```http
POST /users/wallet/add
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 1000,
  "description": "Referral bonus"
}
```

### Get Face Analysis History
```http
GET /users/face-analysis/history?limit=10
Authorization: Bearer <token>
```

---

## 🔐 Authentication API

### Login (Create/Get User)
```http
POST /auth/login
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "clerkId": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Verify Token
```http
POST /auth/verify-token
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
```

### Clerk Webhook (For Clerk Events)
```http
POST /auth/webhook/clerk
Content-Type: application/json
```

**Note:** Configured automatically by Clerk

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Invalid product ID or quantity"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Admin access required"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "stack": "..." // Only in development
}
```

---

## Rate Limiting

Currently no rate limiting. Recommended to add for production:
- 100 requests per 15 minutes per IP for public endpoints
- 500 requests per 15 minutes per user for protected endpoints

## CORS

Default CORS origin: `http://localhost:5173`

Configure in `.env`: `CORS_ORIGIN=https://yourdomain.com`
