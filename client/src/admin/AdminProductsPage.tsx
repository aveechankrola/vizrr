import { motion } from 'framer-motion'
import { useAdmin } from './AdminProvider'

export function AdminProductsPage() {
  const {
    adminProducts,
    newProductForm,
    setNewProductForm,
    newProductOpen,
    setNewProductOpen,
    newProductLoading,
    newProductError,
    handleAdminAddProduct,
    handleAdminDeleteProduct,
  } = useAdmin()

  return (
    <motion.div className="admin-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-list-header">
        <h2 className="admin-page-title" style={{ margin: 0 }}>
          Products
        </h2>
        <span>{adminProducts.length} products</span>
        <button
          type="button"
          className="btn btn-primary admin-add-btn"
          onClick={() => {
            setNewProductOpen(true)
          }}
        >
          + Add Product
        </button>
      </div>

      {newProductOpen && (
        <form className="admin-product-form" onSubmit={handleAdminAddProduct}>
          <h4 className="admin-form-title">New Product</h4>
          {newProductError && <div className="contact-error">⚠ {newProductError}</div>}
          <motion.div className="contact-form-row" layout>
            <div className="contact-field">
              <label className="contact-label">Name</label>
              <input
                className="contact-input"
                value={newProductForm.name}
                onChange={(e) => setNewProductForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="contact-field">
              <label className="contact-label">Category</label>
              <select
                className="contact-input"
                value={newProductForm.category}
                onChange={(e) => setNewProductForm((p) => ({ ...p, category: e.target.value }))}
              >
                <option value="sunglasses">Sunglasses</option>
                <option value="eyeglasses">Eyeglasses</option>
              </select>
            </div>
          </motion.div>
          <div className="contact-form-row">
            <div className="contact-field">
              <label className="contact-label">Price (₹)</label>
              <input
                className="contact-input"
                type="number"
                min="1"
                value={newProductForm.price}
                onChange={(e) => setNewProductForm((p) => ({ ...p, price: e.target.value }))}
                required
              />
            </div>
            <div className="contact-field">
              <label className="contact-label">Original Price</label>
              <input
                className="contact-input"
                type="number"
                min="1"
                value={newProductForm.originalPrice}
                onChange={(e) => setNewProductForm((p) => ({ ...p, originalPrice: e.target.value }))}
              />
            </div>
          </div>
          <motion.div className="contact-field" layout>
            <label className="contact-label">Image (URL or upload)</label>
            <input
              className="contact-input"
              value={newProductForm.image}
              onChange={(e) => setNewProductForm((p) => ({ ...p, image: e.target.value }))}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewProductForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))
              }
            />
          </motion.div>
          <div className="add-address-actions">
            <button type="button" className="btn account-logout-btn" onClick={() => setNewProductOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={newProductLoading}>
              {newProductLoading ? 'Adding…' : 'Add Product'}
            </button>
          </div>
        </form>
      )}

      {adminProducts.map((p) => (
        <div key={p.id} className="admin-product-row">
          <img src={p.image} alt={p.name} className="admin-product-img" />
          <div className="admin-product-info">
            <span className="admin-product-name">{p.name}</span>
            <span className="admin-product-meta">
              {p.category} · ₹{p.price} · ★{p.rating}
            </span>
          </div>
          <button type="button" className="admin-delete-btn" onClick={() => handleAdminDeleteProduct(p.id)}>
            🗑
          </button>
        </div>
      ))}
    </motion.div>
  )
}
