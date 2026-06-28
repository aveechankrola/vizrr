import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import cloudinary from 'cloudinary'
import mongoose from 'mongoose'
import Product from '../models/productModel.js'

const DATA_FILE = path.resolve(process.cwd(), 'server', 'data', 'products.json')
const UPLOAD_DIR = path.resolve(process.cwd(), 'server', 'public', 'uploads')

// configure cloudinary if env present
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

function useMongo() {
  return mongoose.connection.readyState === 1
}

function normalizeProduct(product) {
  if (!product) return product
  const plain = typeof product.toObject === 'function' ? product.toObject() : product
  return {
    ...plain,
    id: plain.id || plain._id?.toString(),
  }
}

function readProducts() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (err) {
    return []
  }
}

function writeProducts(arr) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2))
}

async function readProductsFromStore() {
  if (useMongo()) {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean()
    return products.map(normalizeProduct)
  }

  return readProducts()
}

async function writeProductToStore(product) {
  if (useMongo()) {
    const created = await Product.create(product)
    return normalizeProduct(created)
  }

  const products = readProducts()
  products.push(product)
  writeProducts(products)
  return product
}

async function deleteProductFromStore(id) {
  if (useMongo()) {
    const deleted = await Product.findOneAndDelete({ id })
    return Boolean(deleted)
  }

  const products = readProducts()
  const updatedProducts = products.filter((product) => product.id !== id)
  writeProducts(updatedProducts)
  return updatedProducts.length !== products.length
}

export async function listProducts(req, res) {
  const products = await readProductsFromStore()
  res.json({ success: true, data: products })
}

export async function adminListProducts(req, res) {
  const products = await readProductsFromStore()
  res.json({ success: true, data: products })
}

export async function adminAddProduct(req, res) {
  try {
    const payload = req.body || {}

    if (!payload.name || !payload.category || !payload.price) {
      return res.status(400).json({ success: false, message: 'Invalid product payload' })
    }

    let imageUrl = payload.image || 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600'

    if (req.file && req.file.buffer) {
      if (cloudinary.v2.config().cloud_name) {
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
        const uploadRes = await cloudinary.v2.uploader.upload(dataUri, { folder: 'vizrr/products' })
        imageUrl = uploadRes.secure_url || uploadRes.url || imageUrl
      } else {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
        const ext = path.extname(req.file.originalname) || '.jpg'
        const filename = `${Date.now()}-${uuidv4()}${ext}`
        const outPath = path.join(UPLOAD_DIR, filename)
        fs.writeFileSync(outPath, req.file.buffer)
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`
      }
    }

    const newProduct = {
      id: uuidv4(),
      name: payload.name,
      category: payload.category,
      price: Number(payload.price) || 0,
      originalPrice: payload.originalPrice ? Number(payload.originalPrice) : undefined,
      onSale: payload.onSale === 'true' || payload.onSale === true || payload.onSale === '1',
      image: imageUrl,
      description: payload.description || '',
      rating: payload.rating ? Number(payload.rating) : 4.5,
    }

    const savedProduct = await writeProductToStore(newProduct)
    res.json({ success: true, data: savedProduct })
  } catch (err) {
    console.error('adminAddProduct', err)
    res.status(500).json({ success: false, message: 'Failed to add product' })
  }
}

export async function adminDeleteProduct(req, res) {
  try {
    const id = req.params.id
    await deleteProductFromStore(id)
    res.json({ success: true })
  } catch (err) {
    console.error('adminDeleteProduct', err)
    res.status(500).json({ success: false, message: 'Failed to delete product' })
  }
}
