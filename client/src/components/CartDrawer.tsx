import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/react'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'

export function CartDrawer() {
  const navigate = useNavigate()
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const {
    cartOpen,
    setCartOpen,
    cartItems,
    cartTotal,
    cartCount,
    cartLoading,
    removingId,
    removeItem,
    changeQty,
    clearAll,
  } = useCart()
  const [pendingCheckout, setPendingCheckout] = useState(false)

  useEffect(() => {
    if (isSignedIn && pendingCheckout) {
      setPendingCheckout(false)
      setCartOpen(false)
      navigate('/checkout')
    }
  }, [isSignedIn, pendingCheckout, navigate, setCartOpen])

  function proceedToCheckout() {
    if (!isSignedIn) {
      setPendingCheckout(true)
      openSignIn()
      return
    }
    setCartOpen(false)
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="cart-drawer-header"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <motion.div className="cart-drawer-title" layout>
                <h2>Your Cart</h2>
                {cartCount > 0 && <span className="cart-drawer-count">{cartCount}</span>}
              </motion.div>
              <button
                type="button"
                className="cart-close"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                ✕
              </button>
            </motion.div>

            <div className="cart-drawer-body">
              {cartLoading ? (
                <motion.div className="cart-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p>Loading your cart…</p>
                </motion.div>
              ) : cartItems.length === 0 ? (
                <motion.div className="cart-empty" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                  <span className="cart-empty-icon">🕶️</span>
                  <p>Your cart is empty.</p>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setCartOpen(false)
                      navigate('/ai-analyser')
                    }}
                  >
                    Open AI Analyser
                  </button>
                </motion.div>
              ) : (
                <ul className="cart-list">
                  {cartItems.map((item, index) => (
                    <motion.li
                      key={item.id}
                      className={`cart-item${removingId === item.id ? ' cart-item--removing' : ''}`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                      <motion.div className="cart-item-info" layout>
                        <p className="cart-item-name">{item.product.name}</p>
                        <p className="cart-item-cat">
                          {item.product.category === 'sunglasses' ? 'Sunglasses' : 'Eyeglasses'}
                        </p>
                        <p className="cart-item-price">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </motion.div>
                      <div className="cart-item-controls">
                        <motion.div className="cart-qty" layout>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => changeQty(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="cart-qty-val">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => changeQty(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </motion.div>
                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove"
                          disabled={removingId === item.id}
                        >
                          🗑
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {cartItems.length > 0 && (
              <motion.div
                className="cart-drawer-footer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="cart-subtotal">
                  <span>Subtotal</span>
                  <span className="cart-subtotal-val">₹{cartTotal.toFixed(2)}</span>
                </div>
                <button type="button" className="btn btn-primary cart-checkout" onClick={proceedToCheckout}>
                  Proceed to Checkout
                </button>
                <button type="button" className="cart-clear" onClick={clearAll}>
                  Clear cart
                </button>
              </motion.div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
