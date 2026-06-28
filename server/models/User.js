const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    firstName: String,
    lastName: String,
    imageUrl: String,
    
    // Face Analysis Data
    faceAnalysis: {
      detectedShape: {
        type: String,
        enum: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong/rectangular'],
      },
      confidence: Number,
      recommendedStyles: [String],
      recommendedFrameWidth: {
        min: Number,
        max: Number,
      },
      recommendedLensWidth: {
        min: Number,
        max: Number,
      },
      recommendedBridgeWidth: {
        min: Number,
        max: Number,
      },
      analysisDate: Date,
      capturedImageUrl: String,
      capturedImagePublicId: String,
    },
    
    // Address Information
    addresses: [{
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      isDefault: Boolean,
      createdAt: { type: Date, default: Date.now },
    }],
    
    // Wallet
    wallet: {
      balance: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      }],
    },
    
    // Preferences
    preferences: {
      favoriteStyles: [String],
      favoriteColors: [String],
      notifications: { type: Boolean, default: true },
    },
    
    // Account Status
    isVerified: {
      type: Boolean,
      default: true, // Clerk handles verification
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'support'],
      default: 'customer',
    },
    
    lastLoginAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
