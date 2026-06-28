const mongoose = require('mongoose');

const faceAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    
    // Face Detection Results
    faceShape: {
      type: String,
      enum: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong/rectangular'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    
    // Image Analysis
    imageUrl: String,
    imagePublicId: String, // for Cloudinary deletion
    imageMetadata: {
      width: Number,
      height: Number,
      size: Number,
      format: String,
    },
    
    // Face Measurements
    faceMeasurements: {
      width: Number,
      height: Number,
      ratio: Number,
      coverage: Number,
    },
    
    // AI Recommendations
    recommendations: {
      frameStyles: [String],
      frameWidth: { min: Number, max: Number },
      lensWidth: { min: Number, max: Number },
      bridgeWidth: { min: Number, max: Number },
      templeLength: { min: Number, max: Number },
      materials: [String],
      colors: [String],
    },
    
    // Analysis Details
    analysis: {
      provider: String, // 'openai', 'anthropic', 'local', 'backend'
      model: String,
      prompt: String,
      response: String,
      processingTime: Number, // in ms
    },
    
    // Analysis History
    isLatest: { type: Boolean, default: true },
    previousAnalysisId: mongoose.Schema.Types.ObjectId,
    
    // Match with Products
    matchedProducts: [{
      productId: mongoose.Schema.Types.ObjectId,
      matchScore: Number,
      reason: String,
    }],
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for quick lookups
faceAnalysisSchema.index({ userId: 1, createdAt: -1 });
faceAnalysisSchema.index({ faceShape: 1 });

module.exports = mongoose.model('FaceAnalysis', faceAnalysisSchema);
