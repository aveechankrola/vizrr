const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { clerkMiddleware } = require('../middleware/clerkAuth');

/**
 * Webhook for Clerk user events
 * Clerk will send POST requests to this endpoint when user events occur
 */
router.post('/webhook/clerk', asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  // Verify webhook signature (in production, verify with Clerk's webhook secret)
  
  switch (type) {
    case 'user.created':
      // Create user in database
      const newUser = new User({
        clerkId: data.id,
        email: data.email_addresses[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        imageUrl: data.image_url,
      });
      await newUser.save();
      console.log('✓ User created:', newUser._id);
      break;

    case 'user.updated':
      // Update user in database
      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        }
      );
      console.log('✓ User updated:', data.id);
      break;

    case 'user.deleted':
      // Delete user from database
      await User.findOneAndDelete({ clerkId: data.id });
      console.log('✓ User deleted:', data.id);
      break;

    default:
      console.log('Unhandled event type:', type);
  }

  res.json({ success: true });
}));

/**
 * Login endpoint - saves Clerk user to database if not exists
 */
router.post('/login', clerkMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    user = new User({
      clerkId: userId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      imageUrl: req.user.imageUrl,
    });
    await user.save();
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    user: {
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
}));

/**
 * Verify token endpoint
 */
router.post('/verify-token', clerkMiddleware, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
}));

/**
 * Logout endpoint (client-side Clerk logout is still needed)
 */
router.post('/logout', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

module.exports = router;
