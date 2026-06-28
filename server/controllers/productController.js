const Spectacle = require('../models/Spectacle');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateSKU, calculateDiscount, paginate } = require('../utils/helpers');

// Get all products with filtering and pagination
const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    style,
    material,
    minPrice,
    maxPrice,
    onSale,
    faceShape,
    sortBy = 'createdAt',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (style) filter.style = style;
  if (material) filter.material = material;
  if (onSale === 'true') filter.onSale = true;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (faceShape) {
    filter.suitableFaceShapes = { $in: [faceShape] };
  }

  const sortOptions = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
  };

  const sortObj = sortOptions[sortBy] || { createdAt: -1 };

  const products = await Spectacle.find(filter)
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Spectacle.countDocuments(filter);

  res.json({
    success: true,
    data: products,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    },
  });
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Spectacle.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  res.json({ success: true, data: product });
});

// Get products by face shape
const getProductsByFaceShape = asyncHandler(async (req, res) => {
  const { faceShape } = req.params;
  const { limit = 12 } = req.query;

  const products = await Spectacle.find({
    suitableFaceShapes: { $in: [faceShape] },
    isActive: true,
  }).limit(parseInt(limit));

  res.json({
    success: true,
    faceShape,
    count: products.length,
    data: products,
  });
});

// Search products
const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 12 } = req.query;

  if (!q || q.length < 2) {
    return res.json({ success: true, data: [] });
  }

  const products = await Spectacle.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { style: { $regex: q, $options: 'i' } },
      { material: { $regex: q, $options: 'i' } },
    ],
    isActive: true,
  }).limit(parseInt(limit));

  res.json({ success: true, data: products });
});

// Admin: Create product
const createProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const {
    name,
    description,
    category,
    price,
    originalPrice,
    material,
    color,
    style,
    frameWidth,
    lensWidth,
    bridgeWidth,
    templeLength,
    suitableFaceShapes,
    lensType,
    lensColor,
    stock,
  } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, category, price',
    });
  }

  const sku = generateSKU(name, category);

  const product = new Spectacle({
    name,
    description,
    category,
    price,
    originalPrice: originalPrice || price,
    onSale: originalPrice && originalPrice > price,
    material,
    color,
    style,
    frameWidth,
    lensWidth,
    bridgeWidth,
    templeLength,
    suitableFaceShapes: suitableFaceShapes || ['oval', 'round', 'square'],
    lensType,
    lensColor,
    stock: stock || 0,
    sku,
    image: req.file
      ? {
          url: req.file.path,
          publicId: req.file.filename,
        }
      : null,
  });

  await product.save();
  res.status(201).json({ success: true, data: product });
});

// Admin: Update product
const updateProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const product = await Spectacle.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  // Update allowed fields
  const updateFields = [
    'name',
    'description',
    'price',
    'originalPrice',
    'material',
    'color',
    'style',
    'frameWidth',
    'lensWidth',
    'bridgeWidth',
    'templeLength',
    'suitableFaceShapes',
    'lensType',
    'lensColor',
    'stock',
    'isActive',
  ];

  updateFields.forEach(field => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  // Update image if provided
  if (req.file) {
    if (product.image?.publicId) {
      await deleteFromCloudinary(product.image.publicId);
    }
    product.image = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  // Update onSale status
  if (product.originalPrice && product.price < product.originalPrice) {
    product.onSale = true;
  } else {
    product.onSale = false;
  }

  await product.save();
  res.json({ success: true, data: product });
});

// Admin: Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const product = await Spectacle.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  // Delete image from Cloudinary
  if (product.image?.publicId) {
    await deleteFromCloudinary(product.image.publicId);
  }

  await Spectacle.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Product deleted successfully' });
});

// Get products on sale
const getSaleProducts = asyncHandler(async (req, res) => {
  const products = await Spectacle.find({ onSale: true, isActive: true }).limit(20);

  res.json({
    success: true,
    count: products.length,
    data: products,
  });
});

module.exports = {
  getProducts,
  getProduct,
  getProductsByFaceShape,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSaleProducts,
};
