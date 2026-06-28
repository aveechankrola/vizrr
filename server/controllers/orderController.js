const { Order, Cart } = require('../models/Order');
const User = require('../models/User');
const Spectacle = require('../models/Spectacle');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  generateOrderId,
  calculateShippingFee,
  calculateTax,
  calculateTotal,
  validateEmail,
  validatePhone,
} = require('../utils/helpers');
const axios = require('axios');

/**
 * Place an order
 */
const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    customerDetails,
    shippingAddress,
    billingAddress,
    paymentMethod,
  } = req.body;

  // Validate inputs
  if (!customerDetails || !shippingAddress) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
    });
  }

  if (!validateEmail(customerDetails.email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address',
    });
  }

  if (!validatePhone(customerDetails.phone)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number',
    });
  }

  // Get user's cart
  const cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Cart is empty',
    });
  }

  // Create order
  const orderId = generateOrderId();
  const subtotal = cart.totalPrice;
  const shippingFee = calculateShippingFee(
    shippingAddress.state,
    subtotal
  );
  const tax = calculateTax(subtotal);
  const totalAmount = calculateTotal(subtotal, shippingFee, 0);

  const order = new Order({
    userId,
    orderId,
    items: cart.items.map(item => ({
      productId: item.productId._id,
      productName: item.productId.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
    customerDetails,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod: paymentMethod || 'card',
    paymentStatus: 'pending',
    status: 'pending',
    orderStatus: {
      current: 'pending',
      history: [
        {
          status: 'pending',
          date: new Date(),
          note: 'Order created, awaiting payment',
        },
      ],
    },
    subtotal,
    shippingFee,
    tax,
    totalAmount,
  });

  await order.save();

  // Create payment link using Razorpay (if API key available)
  if (process.env.RAZORPAY_KEY_ID) {
    try {
      const paymentLink = await createPaymentLink({
        orderId: order._id,
        amount: totalAmount,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
      });
      order.paymentLinkId = paymentLink;
      await order.save();
    } catch (error) {
      console.error('Payment link creation failed:', error);
    }
  }

  // Clear cart
  await Cart.findOneAndUpdate(
    { userId },
    {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    }
  );

  res.status(201).json({
    success: true,
    data: {
      orderId: order.orderId,
      orderDBId: order._id,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentLinkId: order.paymentLinkId,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    },
  });
});

/**
 * Get user's orders
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10, page = 1 } = req.query;

  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Order.countDocuments({ userId });

  res.json({
    success: true,
    data: orders,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    },
  });
});

/**
 * Get single order
 */
const getOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;

  const order = await Order.findOne({
    _id: orderId,
    userId,
  }).populate('items.productId');

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  res.json({
    success: true,
    data: order,
  });
});

/**
 * Cancel order
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    userId,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      error: `Cannot cancel order in ${order.status} status`,
    });
  }

  order.status = 'cancelled';
  order.orderStatus.current = 'cancelled';
  order.orderStatus.history.push({
    status: 'cancelled',
    date: new Date(),
    note: reason || 'Cancelled by user',
  });

  await order.save();

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

/**
 * Track order
 */
const trackOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { orderIdOrNumber } = req.params;

  const order = await Order.findOne({
    $or: [
      { _id: orderIdOrNumber },
      { orderId: orderIdOrNumber },
    ],
    userId,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
    });
  }

  res.json({
    success: true,
    data: {
      orderId: order.orderId,
      status: order.status,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      orderStatus: order.orderStatus,
    },
  });
});

/**
 * Create payment link (Razorpay)
 */
async function createPaymentLink({ orderId, amount, customerEmail, customerPhone }) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/payment_links',
      {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        accept_partial: false,
        first_min_partial_amount: Math.round(amount * 100),
        reference_id: orderId.toString(),
        description: `Vizrr Order ${orderId}`,
        customer: {
          email: customerEmail,
          contact: customerPhone,
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        notes: {
          orderId: orderId.toString(),
        },
        callback_url: `${process.env.FRONTEND_URL}/payment-success`,
        callback_method: 'get',
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    return response.data.id;
  } catch (error) {
    console.error('Razorpay error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  trackOrder,
};
