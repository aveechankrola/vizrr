import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserProfile, useUser, useAuth, useClerk } from '@clerk/react'
import {
  addAddress,
  cancelOrder,
  deleteAddress,
  fetchAddresses,
  fetchMyOrders,
  fetchWallet,
  type MyOrder,
  type SavedAddress,
  type WalletData,
} from '../api'
import { pageVariants } from '../app/animations'

export function AccountPage() {
  const navigate = useNavigate()
  const { user, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const { openSignIn, signOut } = useClerk()

  const [myOrders, setMyOrders] = useState<MyOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [accountTab, setAccountTab] = useState<'orders' | 'addresses' | 'wallet'>('orders')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [addAddrOpen, setAddAddrOpen] = useState(false)
  const [addAddrForm, setAddAddrForm] = useState({
    label: 'Home',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    lat: 0,
    lng: 0,
  })
  const [addAddrLoading, setAddAddrLoading] = useState(false)
  const [addAddrError, setAddAddrError] = useState('')
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, transactions: [] })

  useEffect(() => {
    if (!isSignedIn) {
      openSignIn()
    }
  }, [isSignedIn, openSignIn])

  useEffect(() => {
    if (!isSignedIn) {
      setSavedAddresses([])
      return
    }
    getToken().then((token) => {
      if (token) fetchAddresses(token).then(setSavedAddresses).catch(() => {})
    })
  }, [isSignedIn, getToken])

  useEffect(() => {
    if (!isSignedIn) return
    setOrdersLoading(true)
    getToken().then((token) => {
      if (!token) return
      fetchMyOrders(token)
        .then(setMyOrders)
        .catch(() => setMyOrders([]))
        .finally(() => setOrdersLoading(false))
      fetchWallet(token).then(setWallet).catch(() => {})
    })
  }, [isSignedIn, getToken])

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  async function handleDeleteAddress(id: number) {
    const token = await getToken()
    if (!token) return
    await deleteAddress(token, id)
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  function handleGetCurrentLocation() {
    if (!navigator.geolocation) {
      setAddAddrError('Geolocation is not supported in this browser.')
      return
    }
    setAddAddrError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddAddrForm((p) => ({
          ...p,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }))
      },
      () => setAddAddrError('Could not read your location. Check permissions and try again.'),
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault()
    const token = await getToken()
    if (!token) return
    setAddAddrLoading(true)
    setAddAddrError('')
    try {
      const created = await addAddress(token, addAddrForm)
      setSavedAddresses((prev) => [...prev, created])
      setAddAddrOpen(false)
      setAddAddrForm({
        label: 'Home',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        lat: 0,
        lng: 0,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address.'
      if (msg.toLowerCase().includes('authenticated') || msg.toLowerCase().includes('401')) {
        await handleLogout()
      } else {
        setAddAddrError(msg)
      }
    } finally {
      setAddAddrLoading(false)
    }
  }

  async function handleCancelOrder(orderId: string) {
    const token = await getToken()
    if (!token) return
    try {
      await cancelOrder(token, orderId)
      setMyOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not cancel order.')
    }
  }

  if (!isSignedIn || !user) {
    return (
      <motion.div className="app-page app-page--centered" variants={pageVariants} initial="initial" animate="animate">
        <p className="products-status">Sign in to view your account.</p>
      </motion.div>
    )
  }

  return (
    <motion.div className="app-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <main className="account-page page-content">
        <motion.section
          className="account-clerk-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="account-clerk-copy">
            <p className="account-clerk-kicker">Clerk account</p>
            <h2 className="account-clerk-title">Manage your profile and security</h2>
            <p className="account-clerk-description">
              Update your email, password, and connected devices from one place.
            </p>
          </div>
          <div className="account-clerk-profile">
            <UserProfile routing="path" path="/account" />
          </div>
        </motion.section>

        <div className="account-grid">
          <aside className="account-sidebar">
            <div className="account-avatar-lg">
              {(user.firstName ?? '?')[0]}
              {(user.lastName ?? '?')[0]}
            </div>
            <h2 className="account-display-name">
              {user.firstName} {user.lastName}
            </h2>
            <p className="account-email">{user.emailAddresses[0]?.emailAddress}</p>
            <motion.div className="account-info-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              <div className="account-info-row">
                <span className="account-info-label">Member since</span>
                <span className="account-info-value">
                  {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="account-info-row">
                <span className="account-info-label">Total orders</span>
                <span className="account-info-value">{myOrders.length}</span>
              </div>
            </motion.div>
            <button type="button" className="btn account-logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </aside>

          <section className="account-orders">
            <div className="account-tabs">
              {(['orders', 'addresses', 'wallet'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`account-tab-btn${accountTab === tab ? ' account-tab-btn--active' : ''}`}
                  onClick={() => setAccountTab(tab)}
                >
                  {tab === 'orders' ? 'My Orders' : tab === 'addresses' ? 'Saved Addresses' : 'Wallet'}
                </button>
              ))}
            </div>

            {accountTab === 'orders' && (
              <>
                {ordersLoading ? (
                  <p className="account-empty">Loading orders…</p>
                ) : myOrders.length === 0 ? (
                  <div className="account-empty-box">
                    <span className="account-empty-icon">🛍️</span>
                    <p>No orders yet.</p>
                    <button type="button" className="btn btn-primary" onClick={() => navigate('/ai-analyser')}>
                      Try AI Analyser
                    </button>
                  </div>
                ) : (
                  <div className="account-order-list">
                    {[...myOrders].reverse().map((order, index) => (
                      <motion.div
                        key={order.id}
                        className="account-order-card"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <div className="account-order-header">
                          <div>
                            <p className="account-order-id">{order.id}</p>
                            <p className="account-order-date">
                              {new Date(order.placedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="account-order-meta">
                            <span className={`account-order-status account-order-status--${order.status}`}>
                              {order.status}
                            </span>
                            <span className="account-order-total">₹{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <ul className="account-order-items">
                          {order.items.map((item, i) => (
                            <li key={i} className="account-order-item">
                              <span className="account-order-item-name">{item.name}</span>
                              <span className="account-order-item-qty">×{item.quantity}</span>
                              <span className="account-order-item-price">₹{item.lineTotal.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="account-order-footer">
                          <span>
                            Delivery:{' '}
                            {order.deliveryFee === 0 ? (
                              <span className="checkout-free">Free</span>
                            ) : (
                              `₹${order.deliveryFee}`
                            )}
                          </span>
                          <span>
                            Payment:{' '}
                            <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</strong>
                          </span>
                          {(order.status === 'confirmed' || order.status === 'pending') && (
                            <button
                              type="button"
                              className="order-cancel-btn"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {accountTab === 'addresses' && (
              <div className="account-addresses">
                {savedAddresses.length === 0 && (
                  <div className="account-empty-box">
                    <span className="account-empty-icon">📍</span>
                    <p>No saved addresses yet.</p>
                  </div>
                )}
                <div className="address-card-list">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} className="address-card">
                      <div className="address-card-top">
                        <span className="address-card-label">{addr.label}</span>
                        <button
                          type="button"
                          className="address-card-delete"
                          onClick={() => handleDeleteAddress(addr.id)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="address-card-line">
                        {addr.firstName} {addr.lastName}
                        {addr.phone ? ` · ${addr.phone}` : ''}
                      </p>
                      <p className="address-card-line">{addr.address}</p>
                      <p className="address-card-line">
                        {addr.city} — {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
                {addAddrOpen ? (
                  <form className="add-address-form" onSubmit={handleAddAddress}>
                    <h4 className="add-address-title">📍 Add New Delivery Location</h4>
                    {addAddrError && <motion.div className="contact-error">⚠ {addAddrError}</motion.div>}
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGetCurrentLocation}
                      style={{ width: '100%', marginBottom: '16px' }}
                    >
                      📍 Detect My Current Location
                    </button>
                    <motion.div className="contact-form-row" layout>
                      <div className="contact-field">
                        <label className="contact-label">Label</label>
                        <input
                          className="contact-input"
                          placeholder="Home / Office"
                          value={addAddrForm.label}
                          onChange={(e) => setAddAddrForm((p) => ({ ...p, label: e.target.value }))}
                        />
                      </div>
                      <div className="contact-field">
                        <label className="contact-label">Phone</label>
                        <input
                          className="contact-input"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={addAddrForm.phone}
                          onChange={(e) => setAddAddrForm((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                    </motion.div>
                    <div className="contact-form-row">
                      <motion.div className="contact-field" layout>
                        <label className="contact-label">First name</label>
                        <input
                          className="contact-input"
                          placeholder="Rahul"
                          value={addAddrForm.firstName}
                          onChange={(e) => setAddAddrForm((p) => ({ ...p, firstName: e.target.value }))}
                        />
                      </motion.div>
                      <div className="contact-field">
                        <label className="contact-label">Last name</label>
                        <input
                          className="contact-input"
                          placeholder="Doe"
                          value={addAddrForm.lastName}
                          onChange={(e) => setAddAddrForm((p) => ({ ...p, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="contact-field">
                      <label className="contact-label">Street Address</label>
                      <input
                        className="contact-input"
                        placeholder="House no., Street, Landmark"
                        value={addAddrForm.address}
                        onChange={(e) => setAddAddrForm((p) => ({ ...p, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="contact-form-row">
                      <div className="contact-field">
                        <label className="contact-label">City</label>
                        <input
                          className="contact-input"
                          placeholder="Shimla"
                          value={addAddrForm.city}
                          onChange={(e) => setAddAddrForm((p) => ({ ...p, city: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="contact-field">
                        <label className="contact-label">Pincode</label>
                        <input
                          className="contact-input"
                          placeholder="171001"
                          value={addAddrForm.pincode}
                          onChange={(e) => setAddAddrForm((p) => ({ ...p, pincode: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="add-address-actions">
                      <button type="button" className="btn account-logout-btn" onClick={() => setAddAddrOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={addAddrLoading}>
                        {addAddrLoading ? 'Saving…' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary add-address-btn"
                    onClick={() => {
                      setAddAddrOpen(true)
                      setAddAddrError('')
                    }}
                  >
                    + Add New Address
                  </button>
                )}
              </div>
            )}

            {accountTab === 'wallet' && (
              <div className="account-wallet">
                <motion.div
                  className="wallet-balance-card"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="wallet-balance-label">Available Balance</p>
                  <p className="wallet-balance-amount">₹{wallet.balance.toFixed(2)}</p>
                  <p className="wallet-balance-note">Earn 5% cashback on every order</p>
                </motion.div>
                <h4 className="wallet-history-title">Transaction History</h4>
                {wallet.transactions.length === 0 ? (
                  <motion.div className="account-empty-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <span className="account-empty-icon">💳</span>
                    <p>No transactions yet. Place an order to earn cashback!</p>
                  </motion.div>
                ) : (
                  <div className="wallet-transactions">
                    {[...wallet.transactions].reverse().map((tx) => (
                      <div key={tx.id} className="wallet-tx">
                        <div className="wallet-tx-info">
                          <p className="wallet-tx-desc">{tx.description}</p>
                          <p className="wallet-tx-date">
                            {new Date(tx.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className="wallet-tx-amount">+₹{tx.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </motion.div>
  )
}
