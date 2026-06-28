const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  trackOrder,
} = require('../controllers/orderController');
const { clerkMiddleware } = require('../middleware/clerkAuth');

// All order routes require authentication
router.use(clerkMiddleware);

router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:orderId', getOrder);
router.delete('/:orderId', cancelOrder);
router.get('/track/:orderIdOrNumber', trackOrder);

module.exports = router;
