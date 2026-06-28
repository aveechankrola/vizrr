const User = require('../models/User');
const FaceAnalysis = require('../models/FaceAnalysis');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateEmail, validatePhone } = require('../utils/helpers');
const mongoose = require('mongoose');

/**
 * Get or create user profile
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    // Create user from Clerk data
    user = new User({
      clerkId: userId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      imageUrl: req.user.imageUrl,
    });
    await user.save();
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Update user profile
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, preferences } = req.body;

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      ...(preferences && { preferences }),
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Add address
 */
const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  if (!addressLine1 || !city || !state || !postalCode) {
    return res.status(400).json({
      success: false,
      error: 'Missing required address fields',
    });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number',
    });
  }

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const addressId = new mongoose.Types.ObjectId();

  // If this is the first address or marked as default, set others as not default
  if (isDefault || user.addresses.length === 0) {
    user.addresses.forEach(addr => (addr.isDefault = false));
  }

  user.addresses.push({
    _id: addressId,
    name,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country: country || 'India',
    isDefault: isDefault || user.addresses.length === 0,
  });

  await user.save();

  res.json({
    success: true,
    message: 'Address added successfully',
    data: user.addresses,
  });
});

/**
 * Update address
 */
const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.params;
  const updateData = req.body;

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const address = user.addresses.find(
    addr => addr._id.toString() === addressId
  );

  if (!address) {
    return res.status(404).json({
      success: false,
      error: 'Address not found',
    });
  }

  // Update address fields
  Object.assign(address, updateData);

  // Handle default address
  if (updateData.isDefault) {
    user.addresses.forEach(addr => {
      if (addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }

  await user.save();

  res.json({
    success: true,
    message: 'Address updated successfully',
    data: user.addresses,
  });
});

/**
 * Delete address
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.params;

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const initialLength = user.addresses.length;
  user.addresses = user.addresses.filter(
    addr => addr._id.toString() !== addressId
  );

  if (user.addresses.length === initialLength) {
    return res.status(404).json({
      success: false,
      error: 'Address not found',
    });
  }

  // If deleted address was default, set first as default
  if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Address deleted successfully',
    data: user.addresses,
  });
});

/**
 * Get addresses
 */
const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user.addresses,
  });
});

/**
 * Get wallet
 */
const getWallet = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: {
      balance: user.wallet.balance,
      currency: user.wallet.currency,
      transactions: user.wallet.transactions,
    },
  });
});

/**
 * Add wallet balance
 */
const addWalletBalance = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid amount',
    });
  }

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  user.wallet.balance += amount;

  await user.save();

  res.json({
    success: true,
    message: 'Wallet balance updated',
    data: {
      newBalance: user.wallet.balance,
      addedAmount: amount,
    },
  });
});

/**
 * Get face analysis history
 */
const getFaceAnalysisHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;

  const analyses = await FaceAnalysis.find({ userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: analyses,
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  getWallet,
  addWalletBalance,
  getFaceAnalysisHistory,
};
