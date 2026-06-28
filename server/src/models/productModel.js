import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: undefined, min: 0 },
    onSale: { type: Boolean, default: false },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export default mongoose.models.Product || mongoose.model('Product', productSchema)