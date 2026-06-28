# 🚀 Vizrr Setup - Next Steps

## ✅ Status
- ✅ **Backend**: Running on `http://localhost:5000`
- ✅ **Frontend**: Running on `http://localhost:5174`
- ✅ **Unused files**: Deleted (counter.ts, custom.d.ts, etc.)
- ✅ **Environment files**: Created

## 🔧 Configuration Required

### 1. **Client Configuration** (`client/.env`)
```env
# Get from https://dashboard.clerk.com/
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_key_here

# Already set to backend
VITE_API_BASE_URL=http://localhost:5000/api

# Get from https://cloud.google.com/maps-platform
VITE_GOOGLE_MAPS_API_KEY=AIzaSy_your_actual_key_here
```

### 2. **Server Configuration** (`server/.env`)
Update these with your actual credentials:

```env
# ✅ Already configured (leave as is)
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://your_actual_connection_string
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5174

# Add these from services:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLERK_SECRET_KEY=sk_live_your_actual_key_here

# Optional AI providers (works without these):
OPENAI_API_KEY=sk-your_key_here
ANTHROPIC_API_KEY=your_key_here

# Optional Razorpay (for payments):
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🧪 Testing

### Test Backend API
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"Server is running","timestamp":"..."}
```

### Test Frontend
Open browser: `http://localhost:5174`
- Should show Vizrr homepage
- No black screen (if still black, check browser console for errors)

## 📋 Database Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod --dbpath C:\data\db

# Update server/.env
MONGODB_URI=mongodb://localhost:27017/vizrr
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/vizrr`
4. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/vizrr
   ```

## ⚠️ Common Issues

### **Black Screen on Frontend**
- Check browser console (F12) for errors
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set in `client/.env`
- Check that backend is running at `http://localhost:5000`

### **Backend Won't Start**
- Check MongoDB is running
- Verify `MONGODB_URI` in `server/.env` is correct
- Run `npm install` in server folder if modules are missing

### **Black Screen + API Errors**
- Make sure `VITE_API_BASE_URL` points to correct backend URL
- Check CORS is enabled in backend
- Verify Clerk key is valid

## ✨ Features Available

✅ Product browsing with filters  
✅ Face shape detection (local AI - always works)  
✅ Shopping cart  
✅ User authentication  
✅ Order management  

## 🎯 Next Steps

1. **Update server/.env** with your actual MongoDB URI
2. **Update client/.env** with your Clerk publishable key
3. **Refresh browser** if showing black screen
4. **Test**: Visit http://localhost:5174

That's it! Your system should be working.

---

**Need Help?**
- Backend logs: Check terminal where `npm run dev` is running
- Frontend logs: Open browser console (F12)
- API Docs: Check `server/API_DOCUMENTATION.md`
