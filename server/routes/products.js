const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { optionalClerkMiddleware, clerkMiddleware } = require('../middleware/clerkAuth');
const {
  getProducts,
  getProduct,
  getProductsByFaceShape,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSaleProducts,
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/sale', getSaleProducts);
router.get('/by-face-shape/:faceShape', getProductsByFaceShape);
router.get('/:id', getProduct);

// Admin routes (protected)
router.post('/', clerkMiddleware, upload.single('image'), createProduct);
router.put('/:id', clerkMiddleware, upload.single('image'), updateProduct);
router.delete('/:id', clerkMiddleware, deleteProduct);

module.exports = router;
