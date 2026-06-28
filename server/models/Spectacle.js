const mongoose = require('mongoose');

const spectacleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['sunglasses', 'eyeglasses'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: Number,
    onSale: {
      type: Boolean,
      default: false,
    },
    discount: Number,
    
    // Images from Cloudinary
    image: {
      url: String,
      publicId: String,
    },
    images: [{
      url: String,
      publicId: String,
    }],
    
    // Product details
    material: String, // acetate, titanium, stainless steel, wood, bio-plastic
    color: String,
    style: String, // aviator, round, square, cat-eye, browline, geometric, oval, rectangular, rimless
    
    // Frame sizing
    frameWidth: Number, // total width in mm
    lensWidth: Number, // in mm
    bridgeWidth: Number, // in mm
    templeLength: Number, // in mm
    
    // Face shape recommendations
    suitableFaceShapes: {
      type: [String],
      enum: ['oval', 'round', 'square', 'heart', 'diamond', 'oblong/rectangular'],
    },
    
    // Lens type
    lensType: String, // single vision, progressive, blue-light, photochromic, polarized
    lensColor: String,
    
    // Inventory
    stock: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // Rating
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [{
      userId: String,
      userName: String,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now },
    }],
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Spectacle', spectacleSchema);
