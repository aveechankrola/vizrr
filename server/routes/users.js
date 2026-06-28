const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  getWallet,
  addWalletBalance,
  getFaceAnalysisHistory,
} = require('../controllers/userController');
const { clerkMiddleware } = require('../middleware/clerkAuth');

// All user routes require authentication
router.use(clerkMiddleware);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Wallet routes
router.get('/wallet', getWallet);
router.post('/wallet/add', addWalletBalance);

// Face analysis history
router.get('/face-analysis/history', getFaceAnalysisHistory);

module.exports = router;
