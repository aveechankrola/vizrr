const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup multer-cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vizrr/products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    resource_type: 'auto',
  },
});

// Multer middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Function to delete from cloudinary
async function deleteFromCloudinary(publicId) {
  try {
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
}

module.exports = {
  cloudinary,
  upload,
  deleteFromCloudinary,
};
