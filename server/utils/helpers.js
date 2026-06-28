/**
 * Generate unique order ID
 */
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `VZR-${timestamp}-${random}`;
}

/**
 * Generate SKU for product
 */
function generateSKU(productName, category) {
  const categoryCode = category === 'sunglasses' ? 'SUN' : 'EYE';
  const nameCode = productName
    .split(' ')
    .slice(0, 2)
    .map(word => word.substr(0, 2).toUpperCase())
    .join('');
  const randomNum = Math.floor(Math.random() * 10000);
  return `${categoryCode}-${nameCode}-${randomNum}`;
}

/**
 * Validate email
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number (Indian format)
 */
function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 12;
}

/**
 * Calculate discount percentage
 */
function calculateDiscount(originalPrice, salePrice) {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Format price with currency
 */
function formatPrice(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Calculate shipping fee based on location
 */
function calculateShippingFee(state, subtotal) {
  // Free shipping for orders above 2000
  if (subtotal >= 2000) return 0;

  // Base charges by state
  const stateCharges = {
    'Delhi': 50,
    'Maharashtra': 60,
    'Karnataka': 70,
    'Tamil Nadu': 70,
    'Telangana': 70,
    'West Bengal': 70,
    'Uttar Pradesh': 60,
    'Rajasthan': 60,
    'Gujarat': 60,
    'Punjab': 60,
  };

  return stateCharges[state] || 80; // Default 80 for other states
}

/**
 * Calculate tax (GST 18% on eyewear)
 */
function calculateTax(amount) {
  return Math.round(amount * 0.18 * 100) / 100;
}

/**
 * Calculate total order amount
 */
function calculateTotal(subtotal, shippingFee = 0, discount = 0) {
  const taxAmount = calculateTax(subtotal);
  const total = subtotal + shippingFee + taxAmount - discount;
  return Math.round(total * 100) / 100;
}

/**
 * Get recommended products for a face shape
 */
function getProductsForFaceShape(faceShape, products) {
  return products.filter(product => 
    product.suitableFaceShapes && 
    product.suitableFaceShapes.includes(faceShape)
  );
}

/**
 * Sanitize user input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '');
}

/**
 * Paginate array
 */
function paginate(array, pageNumber, pageSize) {
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    data: array.slice(startIndex, endIndex),
    totalPages: Math.ceil(array.length / pageSize),
    currentPage: pageNumber,
    totalItems: array.length,
  };
}

module.exports = {
  generateOrderId,
  generateSKU,
  validateEmail,
  validatePhone,
  calculateDiscount,
  formatPrice,
  calculateShippingFee,
  calculateTax,
  calculateTotal,
  getProductsForFaceShape,
  sanitizeInput,
  paginate,
};
