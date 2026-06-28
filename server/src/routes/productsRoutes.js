import express from 'express'
import multer from 'multer'
import {
  listProducts,
  adminListProducts,
  adminAddProduct,
  adminDeleteProduct,
} from '../controllers/productController.js'
import adminModel from '../models/adminModel.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Public products
router.get('/products', listProducts)

// Admin product endpoints (require admin token)
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token || !adminModel.isValidToken(token)) return res.status(401).json({ success: false, message: 'Unauthorized' })
  return next()
}

router.get('/admin/products', requireAdmin, adminListProducts)
router.post('/admin/products', requireAdmin, upload.single('image'), adminAddProduct)
router.delete('/admin/products/:id', requireAdmin, adminDeleteProduct)

export default router
