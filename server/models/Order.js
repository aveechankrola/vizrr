const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Spectacle',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: Number,
      addedAt: { type: Date, default: Date.now },
    }],
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      unique: true,
    },
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Spectacle',
      },
      productName: String,
      quantity: Number,
      price: Number,
      total: Number,
    }],
    customerDetails: {
      name: String,
      email: String,
      phone: String,
    },
    shippingAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    billingAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'bank_transfer'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    
    // Order Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    orderStatus: {
      current: String,
      history: [{
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
      }],
    },
    
    // Pricing
    subtotal: Number,
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: Number,
    
    // Tracking
    trackingNumber: String,
    estimatedDelivery: Date,
    
    // Payment Link
    paymentLinkId: String,
    
    notes: String,
  },
  { timestamps: true }
);

module.exports = {
  Cart: mongoose.model('Cart', cartSchema),
  Order: mongoose.model('Order', orderSchema),
};
