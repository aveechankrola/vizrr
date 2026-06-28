import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth, useClerk } from '@clerk/react'
import {
  clearCart,
  createPaymentLink,
  fetchAddresses,
  placeOrder,
  type CheckoutCustomer,
  type OrderResult,
  type SavedAddress,
} from '../api'
import { useCart } from '../context/CartContext'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const { openSignIn } = useClerk()
  const { cartItems, cartTotal, refreshCart, setCartOpen } = useCart()

  const [checkoutForm, setCheckoutForm] = useState<CheckoutCustomer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [checkoutError, setCheckoutError] = useState('')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])

  useEffect(() => {
    if (!isSignedIn) {
      openSignIn()
      return
    }
    getToken().then((token) => {
      if (token) fetchAddresses(token).then(setSavedAddresses).catch(() => {})
    })
  }, [isSignedIn, getToken, openSignIn])

  useEffect(() => {
    if (!isSignedIn || !user) return
    setCheckoutForm((prev) => ({
      ...prev,
      firstName: prev.firstName || (user.firstName ?? ''),
      lastName: prev.lastName || (user.lastName ?? ''),
      email: user.emailAddresses[0]?.emailAddress ?? '',
    }))
  }, [isSignedIn, user])

  function handleCheckoutChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckoutForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    setCheckoutStatus('loading')
    setCheckoutError('')
    try {
      const token = await getToken()
      const items = cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      const result = await placeOrder(checkoutForm, items, paymentMethod, token)

      if (paymentMethod === 'online') {
        try {
          const finalAmount = cartTotal >= 50 ? cartTotal : cartTotal + 5
          const paymentData = await createPaymentLink(
            result.orderId,
            finalAmount,
            `${checkoutForm.firstName} ${checkoutForm.lastName}`,
            checkoutForm.email,
            checkoutForm.phone,
          )
          window.location.href = paymentData.paymentUrl
          return
        } catch {
          setOrderResult(result)
          setCheckoutStatus('success')
        }
      } else {
        setOrderResult(result)
        setCheckoutStatus('success')
      }

      await clearCart()
      await refreshCart()
    } catch (err: unknown) {
      setCheckoutStatus('error')
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (!isSignedIn) {
    return (
      <div className="app-page app-page--centered">
        <p className="products-status">Sign in to complete checkout.</p>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        key="checkout"
        className="checkout-overlay checkout-overlay--inline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="checkout-panel"
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {checkoutStatus === 'success' && orderResult ? (
            <motion.div className="checkout-success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div className="checkout-success-icon">🎉</motion.div>
              <h2>Order Confirmed!</h2>
              <p className="checkout-success-id">
                Order ID: <strong>{orderResult.orderId}</strong>
              </p>
              <p className="checkout-success-sub">
                Estimated delivery: <strong>{orderResult.estimatedDelivery}</strong>
              </p>
              <p className="checkout-success-total">
                Total paid: <strong>₹{orderResult.total.toFixed(2)}</strong>
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  navigate('/')
                  setCheckoutForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    pincode: '',
                  })
                }}
              >
                Back to Home
              </button>
            </motion.div>
          ) : (
            <div className="checkout-layout">
              <div className="checkout-summary">
                <div className="checkout-summary-header">
                  <button
                    type="button"
                    className="checkout-back"
                    onClick={() => {
                      setCartOpen(true)
                      navigate('/ai-analyser')
                    }}
                  >
                    ← Back to cart
                  </button>
                  <h2 className="checkout-heading">Order Summary</h2>
                </div>
                <ul className="checkout-item-list">
                  {cartItems.map((item) => (
                    <li key={item.id} className="checkout-item">
                      <img src={item.product.image} alt={item.product.name} className="checkout-item-img" />
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">{item.product.name}</p>
                        <p className="checkout-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="checkout-item-price">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="checkout-totals">
                  <div className="checkout-total-row">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="checkout-total-row">
                    <span>Delivery</span>
                    <span>
                      {cartTotal >= 50 ? <span className="checkout-free">Free</span> : '₹5.00'}
                    </span>
                  </div>
                  <div className="checkout-total-row checkout-total-row--final">
                    <span>Total</span>
                    <span>₹{(cartTotal >= 50 ? cartTotal : cartTotal + 5).toFixed(2)}</span>
                  </div>
                </div>
                {cartTotal < 50 && (
                  <p className="checkout-free-tip">
                    🚚 Add ₹{(50 - cartTotal).toFixed(2)} more for free delivery!
                  </p>
                )}
              </div>

              <div className="checkout-form-wrap">
                <h2 className="checkout-heading">Delivery Details</h2>
                {checkoutStatus === 'error' && <motion.div className="contact-error">⚠ {checkoutError}</motion.div>}
                {savedAddresses.length > 0 && (
                  <div className="checkout-saved-addresses">
                    <p className="checkout-saved-label">Use a saved address</p>
                    <div className="checkout-address-pills">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          className="checkout-address-pill"
                          onClick={() =>
                            setCheckoutForm((prev) => ({
                              ...prev,
                              firstName: addr.firstName || prev.firstName,
                              lastName: addr.lastName || prev.lastName,
                              phone: addr.phone || prev.phone,
                              address: addr.address,
                              city: addr.city,
                              pincode: addr.pincode,
                            }))
                          }
                        >
                          📍 {addr.label} — {addr.city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <form className="checkout-form" onSubmit={handlePlaceOrder}>
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label className="contact-label">First name</label>
                      <input
                        className="contact-input"
                        name="firstName"
                        placeholder="Rahul"
                        value={checkoutForm.firstName}
                        onChange={handleCheckoutChange}
                        required
                      />
                    </div>
                    <div className="contact-field">
                      <label className="contact-label">Last name</label>
                      <input
                        className="contact-input"
                        name="lastName"
                        placeholder="Doe"
                        value={checkoutForm.lastName}
                        onChange={handleCheckoutChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label className="contact-label">Email</label>
                      <input
                        className="contact-input"
                        name="email"
                        type="email"
                        placeholder="rahul@example.com"
                        value={checkoutForm.email}
                        onChange={handleCheckoutChange}
                        required
                      />
                    </div>
                    <div className="contact-field">
                      <label className="contact-label">Phone</label>
                      <input
                        className="contact-input"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={checkoutForm.phone}
                        onChange={handleCheckoutChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="contact-field">
                    <label className="contact-label">Address</label>
                    <input
                      className="contact-input"
                      name="address"
                      placeholder="House no., Street, Landmark"
                      value={checkoutForm.address}
                      onChange={handleCheckoutChange}
                      required
                    />
                  </div>
                  <motion.div className="contact-form-row" layout>
                    <div className="contact-field">
                      <label className="contact-label">City</label>
                      <input
                        className="contact-input"
                        name="city"
                        placeholder="Shimla"
                        value={checkoutForm.city}
                        onChange={handleCheckoutChange}
                        required
                      />
                    </div>
                    <motion.div className="contact-field" layout>
                      <label className="contact-label">Pincode</label>
                      <input
                        className="contact-input"
                        name="pincode"
                        placeholder="171001"
                        value={checkoutForm.pincode}
                        onChange={handleCheckoutChange}
                        required
                      />
                    </motion.div>
                  </motion.div>
                  <div className="checkout-payment">
                    <p className="contact-label">Payment Method</p>
                    <div className="checkout-payment-options">
                      <label
                        className={`checkout-payment-opt${paymentMethod === 'cod' ? ' checkout-payment-opt--active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                        />
                        💵 Cash on Delivery
                      </label>
                      <label
                        className={`checkout-payment-opt${paymentMethod === 'online' ? ' checkout-payment-opt--active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                        />
                        📱 Online Payment
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary checkout-submit"
                    disabled={checkoutStatus === 'loading'}
                  >
                    {checkoutStatus === 'loading'
                      ? 'Placing order…'
                      : `Place Order • ₹${(cartTotal >= 50 ? cartTotal : cartTotal + 5).toFixed(2)}`}
                  </button>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
