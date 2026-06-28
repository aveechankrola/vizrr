const { Cart } = require('../models/Order');
const Spectacle = require('../models/Spectacle');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user's cart
 */
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart) {
    return res.json({
      success: true,
      data: [],
      total: 0,
      count: 0,
    });
  }

  res.json({
    success: true,
    data: cart.items,
    total: cart.totalPrice,
    count: cart.totalItems,
  });
});

/**
 * Add item to cart
 */
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  if (!productId || quantity < 1) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID or quantity',
    });
  }

  // Verify product exists
  const product = await Spectacle.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found',
    });
  }

  // Check stock
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      error: `Insufficient stock. Available: ${product.stock}`,
    });
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      items: [{ productId, quantity, price: product.price }],
    });
  } else {
    // Check if item already in cart
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }
  }

  // Update totals
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  await cart.save();
  await cart.populate('items.productId');

  res.json({
    success: true,
    data: cart.items,
    total: cart.totalPrice,
    count: cart.totalItems,
  });
});

/**
 * Update cart item quantity
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || quantity < 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID or quantity',
    });
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({
      success: false,
      error: 'Cart not found',
    });
  }

  const item = cart.items.find(
    item => item.productId.toString() === productId
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found in cart',
    });
  }

  if (quantity === 0) {
    // Remove item if quantity is 0
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );
  } else {
    // Check stock
    const product = await Spectacle.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${product.stock}`,
      });
    }
    item.quantity = quantity;
  }

  // Update totals
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  await cart.save();
  await cart.populate('items.productId');

  res.json({
    success: true,
    data: cart.items,
    total: cart.totalPrice,
    count: cart.totalItems,
  });
});

/**
 * Remove item from cart
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      error: 'Product ID required',
    });
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).json({
      success: false,
      error: 'Cart not found',
    });
  }

  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId
  );

  // Update totals
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  await cart.save();
  await cart.populate('items.productId');

  res.json({
    success: true,
    data: cart.items,
    total: cart.totalPrice,
    count: cart.totalItems,
  });
});

/**
 * Clear entire cart
 */
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Cart.findOneAndUpdate(
    { userId },
    {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    }
  );

  res.json({
    success: true,
    message: 'Cart cleared',
    data: [],
    total: 0,
    count: 0,
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
