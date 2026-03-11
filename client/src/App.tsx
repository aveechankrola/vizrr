import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './style.css'
import heroImg1 from './assets/1.jpeg'
import heroImg2 from './assets/2.jpeg'
import heroImg3 from './assets/3.jpeg'
import heroImg4 from './assets/4.jpeg'
import heroImg5 from './assets/5.jpeg'
import {
  fetchProducts,
  addToCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
  clearCart,
  submitContact,
  placeOrder,
  registerUser,
  loginUser,
  logoutUser,
  fetchMyOrders,
  cancelOrder,
  fetchAddresses,
  addAddress,
  deleteAddress,
  fetchWallet,
  adminLogin,
  adminLogout,
  fetchAdminStats,
  fetchAdminOrders,
  adminUpdateOrderStatus,
  fetchAdminProducts,
  adminAddProduct,
  adminDeleteProduct,
  fetchAdminUsers,
  type Product,
  type CartItem,
  type ContactPayload,
  type CheckoutCustomer,
  type OrderResult,
  type AuthUser,
  type MyOrder,
  type SavedAddress,
  type WalletData,
  type AdminStats,
  type AdminUser,
} from './api'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const pageVariants = {
  initial: { opacity: 0, y: 32, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 0.6] as [number, number, number, number] },
  },
}

function App() {
  const [activePage, setActivePage] = useState<'home' | 'about' | 'product' | 'contact' | 'checkout' | 'account'>('home')

  // ── Admin state ────────────────────────────────────────────
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('keprates_admin_token'))

  // ── Hero slider ────────────────────────────────────────────
  const heroImages = [heroImg1, heroImg2, heroImg3, heroImg4, heroImg5]
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const heroPrev = () => setHeroSlideIndex(i => (i - 1 + heroImages.length) % heroImages.length)
  const heroNext = () => setHeroSlideIndex(i => (i + 1) % heroImages.length)
  const [adminPageOpen, setAdminPageOpen] = useState(false)
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'products' | 'users'>('dashboard')
  const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' })
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoginLoading, setAdminLoginLoading] = useState(false)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [adminOrders, setAdminOrders] = useState<MyOrder[]>([])
  const [adminProducts, setAdminProducts] = useState<Product[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [newProductForm, setNewProductForm] = useState({ name: '', category: 'chocolate-cake', price: '', originalPrice: '', onSale: false, image: '', description: '', rating: '4.5' })
  const [newProductOpen, setNewProductOpen] = useState(false)
  const [newProductLoading, setNewProductLoading] = useState(false)
  const [newProductError, setNewProductError] = useState('')

  useEffect(() => {
    if (!adminPageOpen || !adminToken) return
    setAdminLoading(true)
    Promise.all([
      fetchAdminStats(adminToken),
      fetchAdminOrders(adminToken),
      fetchAdminProducts(adminToken),
      fetchAdminUsers(adminToken),
    ]).then(([stats, orders, products, users]) => {
      setAdminStats(stats)
      setAdminOrders(orders)
      setAdminProducts(products)
      setAdminUsers(users)
    }).catch(() => {}).finally(() => setAdminLoading(false))
  }, [adminPageOpen, adminToken, adminTab])

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setAdminLoginLoading(true)
    setAdminLoginError('')
    try {
      const token = await adminLogin(adminLoginForm.email, adminLoginForm.password)
      localStorage.setItem('keprates_admin_token', token)
      setAdminToken(token)
    } catch (err: unknown) {
      setAdminLoginError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setAdminLoginLoading(false)
    }
  }

  async function handleAdminLogout() {
    if (adminToken) await adminLogout(adminToken).catch(() => {})
    localStorage.removeItem('keprates_admin_token')
    setAdminToken(null)
  }

  async function handleAdminOrderStatus(orderId: string, status: string) {
    if (!adminToken) return
    await adminUpdateOrderStatus(adminToken, orderId, status)
    setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  async function handleAdminDeleteProduct(id: string) {
    if (!adminToken) return
    await adminDeleteProduct(adminToken, id)
    setAdminProducts(prev => prev.filter(p => p.id !== id))
  }

  async function handleAdminAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!adminToken) return
    setNewProductLoading(true)
    setNewProductError('')
    try {
      const created = await adminAddProduct(adminToken, {
        name: newProductForm.name,
        category: newProductForm.category as 'chocolate-cake' | 'chocolate',
        price: Number(newProductForm.price),
        originalPrice: newProductForm.originalPrice ? Number(newProductForm.originalPrice) : undefined,
        onSale: newProductForm.onSale,
        image: newProductForm.image || 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600',
        description: newProductForm.description,
        rating: Number(newProductForm.rating),
      })
      setAdminProducts(prev => [...prev, created])
      setNewProductOpen(false)
      setNewProductForm({ name: '', category: 'chocolate-cake', price: '', originalPrice: '', onSale: false, image: '', description: '', rating: '4.5' })
    } catch (err: unknown) {
      setNewProductError(err instanceof Error ? err.message : 'Failed to add product.')
    } finally {
      setNewProductLoading(false)
    }
  }

  // ── Products state ──────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'cakes' | 'chocolates' | 'sale'>('all')
  const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh'>('featured')

  // ── Cart state ──────────────────────────────────────────────
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [cartLoading, setCartLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const refreshCart = useCallback(async () => {
    try {
      const c = await fetchCart()
      setCartItems(c.data)
      setCartTotal(c.total)
      setCartCount(c.count)
    } catch { /* server may not be up */ }
  }, [])

  // ── Auth state ──────────────────────────────────────────────
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const s = localStorage.getItem('keprates_user')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('keprates_token'))
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [pendingCheckout, setPendingCheckout] = useState(false)
  const [authForm, setAuthForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [authError, setAuthError] = useState('')

  function handleAuthChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAuthForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthStatus('loading')
    setAuthError('')
    try {
      // ── Admin credential intercept ──────────────────────────
      if (authMode === 'login' && authForm.email === 'admin@keprates.com') {
        const token = await adminLogin(authForm.email, authForm.password)
        localStorage.setItem('keprates_admin_token', token)
        setAdminToken(token)
        setAuthStatus('idle')
        setAuthModalOpen(false)
        setAuthForm({ firstName: '', lastName: '', email: '', password: '', phone: '' })
        setAdminPageOpen(true)
        return
      }
      const result = authMode === 'register'
        ? await registerUser(authForm.firstName, authForm.lastName, authForm.email, authForm.password, authForm.phone)
        : await loginUser(authForm.email, authForm.password)
      localStorage.setItem('keprates_token', result.token)
      localStorage.setItem('keprates_user', JSON.stringify(result.user))
      setAuthToken(result.token)
      setAuthUser(result.user)
      setAuthStatus('idle')
      setAuthModalOpen(false)
      setAuthForm({ firstName: '', lastName: '', email: '', password: '', phone: '' })
      if (pendingCheckout) {
        setPendingCheckout(false)
        setCartOpen(false)
        setActivePage('checkout')
        setCheckoutStatus('idle')
        setOrderResult(null)
      }
    } catch (err: unknown) {
      setAuthStatus('error')
      setAuthError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  async function handleLogout() {
    if (authToken) await logoutUser(authToken).catch(() => {})
    localStorage.removeItem('keprates_token')
    localStorage.removeItem('keprates_user')
    setAuthToken(null)
    setAuthUser(null)
    if (activePage === 'checkout' || activePage === 'account') setActivePage('home')
  }

  // ── Account / orders state ─────────────────────────────────────
  const [myOrders, setMyOrders] = useState<MyOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [accountTab, setAccountTab] = useState<'orders' | 'addresses' | 'wallet'>('orders')

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [addAddrOpen, setAddAddrOpen] = useState(false)
  const [addAddrForm, setAddAddrForm] = useState({ label: 'Home', firstName: '', lastName: '', phone: '', address: '', city: '', pincode: '' })
  const [addAddrLoading, setAddAddrLoading] = useState(false)
  const [addAddrError, setAddAddrError] = useState('')

  // Wallet
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, transactions: [] })

  // Fetch addresses whenever user is logged in (needed for checkout pre-fill too)
  useEffect(() => {
    if (!authToken) { setSavedAddresses([]); return }
    fetchAddresses(authToken).then(setSavedAddresses).catch(() => {})
  }, [authToken])

  useEffect(() => {
    if (activePage !== 'account' || !authToken) return
    setOrdersLoading(true)
    fetchMyOrders(authToken)
      .then(setMyOrders)
      .catch(() => setMyOrders([]))
      .finally(() => setOrdersLoading(false))
    fetchWallet(authToken).then(setWallet).catch(() => {})
  }, [activePage, authToken])

  // ── Checkout state ─────────────────────────────────────────
  const [checkoutForm, setCheckoutForm] = useState<CheckoutCustomer>({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', pincode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [checkoutError, setCheckoutError] = useState('')

  function handleCheckoutChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckoutForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    setCheckoutStatus('loading')
    setCheckoutError('')
    try {
      const items = cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      const result = await placeOrder(checkoutForm, items, paymentMethod, authToken)
      setOrderResult(result)
      setCheckoutStatus('success')
      await clearCart()
      await refreshCart()
    } catch (err: unknown) {
      setCheckoutStatus('error')
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  // ── Address handlers ────────────────────────────────────────
  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!authToken) return
    setAddAddrLoading(true)
    setAddAddrError('')
    try {
      const created = await addAddress(authToken, addAddrForm)
      setSavedAddresses((prev) => [...prev, created])
      setAddAddrOpen(false)
      setAddAddrForm({ label: 'Home', firstName: '', lastName: '', phone: '', address: '', city: '', pincode: '' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save address.'
      if (msg.toLowerCase().includes('authenticated') || msg.toLowerCase().includes('401')) {
        // Session expired — force re-login
        handleLogout()
      } else {
        setAddAddrError(msg)
      }
    } finally {
      setAddAddrLoading(false)
    }
  }

  async function handleDeleteAddress(id: number) {
    if (!authToken) return
    await deleteAddress(authToken, id)
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleCancelOrder(orderId: string) {
    if (!authToken) return
    try {
      await cancelOrder(authToken, orderId)
      setMyOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'cancelled' } : o))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not cancel order.')
    }
  }

  // Auto-fill checkout form from logged-in user when checkout opens
  useEffect(() => {
    if (activePage !== 'checkout' || !authUser) return
    setCheckoutForm((prev) => ({
      ...prev,
      firstName: prev.firstName || authUser.firstName,
      lastName: prev.lastName || authUser.lastName,
      email: authUser.email,
    }))
  }, [activePage, authUser])

  // ── Contact state ───────────────────────────────────────────
  const [contactForm, setContactForm] = useState<ContactPayload>({
    firstName: '', lastName: '', email: '', subject: '', message: '',
  })
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [contactMsg, setContactMsg] = useState('')

  // Load cart count on mount
  useEffect(() => { refreshCart() }, [refreshCart])

  // Fetch products whenever filter or sort changes and we're on the product page
  useEffect(() => {
    if (activePage !== 'product') return
    setProductsLoading(true)
    setProductsError(null)

    const category = filter === 'cakes' ? 'chocolate-cake' : filter === 'chocolates' ? 'chocolate' : undefined
    const sale = filter === 'sale' ? true : undefined

    fetchProducts({ category, sale, sort: sortBy })
      .then(setProducts)
      .catch((e) => setProductsError(e.message))
      .finally(() => setProductsLoading(false))
  }, [activePage, filter, sortBy])

  async function handleAddToCart(productId: string) {
    setAddingId(productId)
    try {
      await addToCart(productId)
      await refreshCart()
    } catch { /* silently ignore */ } finally {
      setAddingId(null)
    }
  }

  async function handleOpenCart() {
    setCartOpen(true)
    setCartLoading(true)
    await refreshCart()
    setCartLoading(false)
  }

  async function handleRemoveItem(itemId: number) {
    setRemovingId(itemId)
    try {
      await removeCartItem(itemId)
      await refreshCart()
    } catch { /* ignore */ } finally {
      setRemovingId(null)
    }
  }

  async function handleQtyChange(itemId: number, qty: number) {
    if (qty < 1) return
    try {
      await updateCartItem(itemId, qty)
      await refreshCart()
    } catch { /* ignore */ }
  }

  async function handleClearCart() {
    try {
      await clearCart()
      await refreshCart()
    } catch { /* ignore */ }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    setContactStatus('loading')
    try {
      const msg = await submitContact(contactForm)
      setContactStatus('success')
      setContactMsg(msg)
      setContactForm({ firstName: '', lastName: '', email: '', subject: '', message: '' })
    } catch (e: unknown) {
      setContactStatus('error')
      setContactMsg(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  function handleContactChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <>
    <div className="page">
      <header className="header">
        <motion.div
          className="logo"
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="brand-name">Keprates</span>
        </motion.div>

        <motion.nav
          className="nav"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
        >
          <a
            href="#"
            className={`nav-link${activePage === 'home' ? ' nav-link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('home')
            }}
          >
            Home
          </a>
          <a
            href="#"
            className={`nav-link${activePage === 'about' ? ' nav-link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('about')
            }}
          >
            About
          </a>
          <a
            href="#"
            className={`nav-link${activePage === 'product' ? ' nav-link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('product')
            }}
          >
            Product
          </a>
          <a
            href="#"
            className={`nav-link${activePage === 'contact' ? ' nav-link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('contact')
            }}
          >
            Contact
          </a>
          <a
            href="#"
            className={`nav-link${activePage === 'account' ? ' nav-link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              if (authUser) {
                setActivePage('account')
              } else {
                setAuthModalOpen(true)
              }
            }}
          >
            Account
          </a>
        </motion.nav>

        <motion.div
          className="header-actions"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <button
            className="icon-button icon-button--cart"
            aria-label="Cart"
            onClick={handleOpenCart}
          >
            <span className="icon-cart" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </motion.div>
      </header>

      <div className="rail rail-left">
        <div className="rail-line">
          <span className="rail-line-fill" />
        </div>
      </div>

      <div className="rail rail-right">
        <div className="rail-line">
          <span className="rail-line-fill" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activePage === 'home' && (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <main className="hero">
            <motion.section
              className="hero-text"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.p className="hero-kicker" variants={fadeInUp}>
                Every One <span className="hero-kicker-accent">Love&apos;s</span> __
              </motion.p>

              <motion.h1 className="hero-heading" variants={fadeInUp}>
                Natural and
                <br />
                <span className="hero-highlight">rich Chocolates.</span>
              </motion.h1>

              <motion.p className="hero-description" variants={fadeInUp}>
                We provide the finest quality chocolates, crafted fresh with premium
                ingredients so every bite feels like a celebration.
              </motion.p>

              <motion.div className="hero-buttons" variants={fadeInUp}>
                <button className="btn btn-primary">Order Now</button>
                <button className="btn btn-outline">Explore More</button>
              </motion.div>
            </motion.section>

            <motion.section
              className="hero-image-wrapper"
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="hero-card">
                <div className="hero-image-circle" />
                <img
                  src={heroImages[heroSlideIndex]}
                  alt="Indulgent chocolate"
                  className="hero-image"
                />

                <motion.div
                  className="hero-badge"
                  initial={{ opacity: 0, y: -16, rotate: -6 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  <div className="hero-badge-inner">
                    <span className="hero-badge-small">WE CARE ABOUT</span>
                    <span className="hero-badge-main">YOUR CHOCOLATE!</span>
                  </div>
                </motion.div>

                <motion.div
                  className="hero-rating"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <span className="hero-rating-label">Rich Chocolates</span>
                  <div className="hero-stars">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span className="hero-star-dim">★</span>
                  </div>
                  <span className="hero-rating-score">4.5</span>
                </motion.div>

                <motion.div
                  className="hero-slider"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                >
                  <button className="slider-arrow" aria-label="Previous" onClick={heroPrev}>
                    ←
                  </button>
                  <button className="slider-arrow slider-arrow--primary" aria-label="Next" onClick={heroNext}>
                    →
                  </button>
                </motion.div>
              </div>
            </motion.section>
            </main>
          </motion.div>
        )}

        {activePage === 'product' && (
          <motion.div
            key="product"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <main className="product-page">
          <section className="product-header">
            <div>
              <p className="product-kicker">Keprates Collection</p>
              <h2 className="product-heading">Chocolates you&apos;ll love.</h2>
              <p className="product-subtitle">
                Choose from our indulgent chocolates and chocolate cakes, then sort by price or pick
                from our specials on sale.
              </p>
            </div>
            <div className="product-filters">
              <div className="filter-group">
                <button
                  type="button"
                  className={`filter-pill${filter === 'all' ? ' filter-pill--active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`filter-pill${filter === 'cakes' ? ' filter-pill--active' : ''}`}
                  onClick={() => setFilter('cakes')}
                >
                  Chocolate Cakes
                </button>
                <button
                  type="button"
                  className={`filter-pill${filter === 'chocolates' ? ' filter-pill--active' : ''}`}
                  onClick={() => setFilter('chocolates')}
                >
                  Chocolates
                </button>
                <button
                  type="button"
                  className={`filter-pill${filter === 'sale' ? ' filter-pill--active' : ''}`}
                  onClick={() => setFilter('sale')}
                >
                  On sale
                </button>
              </div>
              <label className="sort-select">
                <span>Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'featured' | 'priceLow' | 'priceHigh')
                  }
                >
                  <option value="featured">Featured</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </label>
            </div>
          </section>

          <section className="product-grid">
            {productsLoading && (
              <p className="products-status">Loading products…</p>
            )}
            {productsError && (
              <p className="products-status products-status--error">⚠ {productsError}</p>
            )}
            <AnimatePresence mode="popLayout">
            {!productsLoading && products.map((product) => (
              <motion.article
                key={product.id}
                layout
                className="product-card"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, boxShadow: '0 22px 38px rgba(193, 82, 132, 0.35)' }}
              >
                <div className="product-media">
                  <div className={`product-image-circle product-image-circle--${product.category}`} />
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                  {product.onSale && <span className="product-sale-badge">On sale</span>}
                </div>
                <div className="product-body">
                  <div className="product-tag-row">
                    <span className="product-tag">
                      {product.category === 'chocolate-cake' ? 'Chocolate Cake' : 'Chocolate'}
                    </span>
                    <span className="product-rating">★ {product.rating}</span>
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price-row">
                    <span className="product-price">₹{product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="product-price-old">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="product-meta">
                    <span>Fresh · Same-day delivery</span>
                    <button
                      type="button"
                      className="btn btn-primary product-cta"
                      disabled={addingId === product.id}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      {addingId === product.id ? 'Adding…' : 'Add to cart'}
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
            </AnimatePresence>
          </section>
            </main>
          </motion.div>
        )}

        {activePage === 'about' && (
          <motion.div
            key="about"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <main className="about-page">
              <section className="about-hero">
                <div className="about-text">
                  <p className="about-kicker">About Keprates</p>
                  <h2 className="about-heading">
                    Freshly prepared treats
                    <br />
                    from the heart of Shimla.
                  </h2>
                  <p className="about-body">
                    Keprates is a Shimla-based cake and chocolate studio, handcrafting small-batch
                    cakes, desserts and chocolates that are baked and tempered fresh every single
                    day.
                  </p>
                  <p className="about-body">
                    From hillside mornings to late-night celebrations, our focus is simple: warm
                    service, clean ingredients and flavours that feel like home.
                  </p>
                  <div className="about-stats">
                    <div className="about-stat">
                      <span className="about-stat-number">10+</span>
                      <span className="about-stat-label">Signature cakes</span>
                    </div>
                    <div className="about-stat">
                      <span className="about-stat-number">15+</span>
                      <span className="about-stat-label">Artisan chocolates</span>
                    </div>
                    <div className="about-stat">
                      <span className="about-stat-number">365</span>
                      <span className="about-stat-label">Fresh prep days</span>
                    </div>
                  </div>
                </div>

                <div className="about-card">
                  <div className="about-card-ring" />
                  <div className="about-card-inner">
                    <h3>Why people choose us</h3>
                    <ul>
                      <li>Freshly baked and tempered on the same day</li>
                      <li>Seasonal flavours inspired by Shimla&apos;s orchards</li>
                      <li>Custom cakes and gifting boxes for every occasion</li>
                    </ul>
                    <button type="button" className="btn btn-primary about-cta">
                      Talk to our kitchen
                    </button>
                  </div>
                </div>
              </section>
            </main>
          </motion.div>
        )}
        {activePage === 'contact' && (
          <motion.div
            key="contact"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <main className="contact-page">
              <section className="contact-hero">
                <motion.div
                  className="contact-text"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.p className="contact-kicker" variants={fadeInUp}>Get in touch</motion.p>
                  <motion.h2 className="contact-heading" variants={fadeInUp}>
                    We'd love to hear<br />
                    <span className="contact-heading-accent">from you.</span>
                  </motion.h2>
                  <motion.p className="contact-body" variants={fadeInUp}>
                    Whether you need a custom cake, a gifting box or just want to say hello — our
                    kitchen is always happy to chat.
                  </motion.p>

                  <motion.div className="contact-info-cards" variants={fadeInUp}>
                    <div className="contact-info-card">
                      <span className="contact-info-icon">📍</span>
                      <div>
                        <p className="contact-info-label">Visit us</p>
                        <p className="contact-info-value">Mall Road, Shimla, HP 171001</p>
                      </div>
                    </div>
                    <div className="contact-info-card">
                      <span className="contact-info-icon">📞</span>
                      <div>
                        <p className="contact-info-label">Call us</p>
                        <p className="contact-info-value">+91 98765 43210</p>
                      </div>
                    </div>
                    <div className="contact-info-card">
                      <span className="contact-info-icon">✉️</span>
                      <div>
                        <p className="contact-info-label">Email us</p>
                        <p className="contact-info-value">hello@keprates.com</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="contact-form-card"
                  initial={{ opacity: 0, x: 60, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="contact-form-title">Send us a message</h3>
                  {contactStatus === 'success' && (
                    <motion.div
                      className="contact-success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      ✅ {contactMsg}
                    </motion.div>
                  )}
                  {contactStatus === 'error' && (
                    <motion.div
                      className="contact-error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      ⚠ {contactMsg}
                    </motion.div>
                  )}
                  <form className="contact-form" onSubmit={handleContactSubmit}>
                    <div className="contact-form-row">
                      <div className="contact-field">
                        <label className="contact-label">First name</label>
                        <input className="contact-input" type="text" name="firstName" placeholder="Rahul" value={contactForm.firstName} onChange={handleContactChange} required />
                      </div>
                      <div className="contact-field">
                        <label className="contact-label">Last name</label>
                        <input className="contact-input" type="text" name="lastName" placeholder="Doe" value={contactForm.lastName} onChange={handleContactChange} required />
                      </div>
                    </div>
                    <div className="contact-field">
                      <label className="contact-label">Email</label>
                      <input className="contact-input" type="email" name="email" placeholder="rahul@example.com" value={contactForm.email} onChange={handleContactChange} required />
                    </div>
                    <div className="contact-field">
                      <label className="contact-label">Subject</label>
                      <input className="contact-input" type="text" name="subject" placeholder="Custom birthday cake" value={contactForm.subject} onChange={handleContactChange} required />
                    </div>
                    <div className="contact-field">
                      <label className="contact-label">Message</label>
                      <textarea className="contact-input contact-textarea" name="message" placeholder="Tell us what you have in mind…" rows={4} value={contactForm.message} onChange={handleContactChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary contact-submit" disabled={contactStatus === 'loading'}>
                      {contactStatus === 'loading' ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                </motion.div>
              </section>
            </main>
          </motion.div>
        )}

        {/* ── Account Page ──────────────────────────────────── */}
        {activePage === 'account' && authUser && (
          <motion.div
            key="account"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <main className="account-page page-content">
              <div className="account-grid">

                {/* Left — profile card */}
                <aside className="account-sidebar">
                  <div className="account-avatar-lg">
                    {authUser.firstName[0]}{authUser.lastName[0]}
                  </div>
                  <h2 className="account-display-name">{authUser.firstName} {authUser.lastName}</h2>
                  <p className="account-email">{authUser.email}</p>
                  <div className="account-info-list">
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
                  </div>
                  <button className="btn account-logout-btn" onClick={handleLogout}>
                    Sign Out
                  </button>
                </aside>

                {/* Right — tabbed content */}
                <section className="account-orders">
                  {/* Tab nav */}
                  <div className="account-tabs">
                    <button className={`account-tab-btn${accountTab === 'orders' ? ' account-tab-btn--active' : ''}`} onClick={() => setAccountTab('orders')}>My Orders</button>
                    <button className={`account-tab-btn${accountTab === 'addresses' ? ' account-tab-btn--active' : ''}`} onClick={() => setAccountTab('addresses')}>Saved Addresses</button>
                    <button className={`account-tab-btn${accountTab === 'wallet' ? ' account-tab-btn--active' : ''}`} onClick={() => setAccountTab('wallet')}>Wallet</button>
                  </div>

                  {/* ── My Orders tab ───────────────────── */}
                  {accountTab === 'orders' && (
                    <>
                      {ordersLoading ? (
                        <p className="account-empty">Loading orders…</p>
                      ) : myOrders.length === 0 ? (
                        <div className="account-empty-box">
                          <span className="account-empty-icon">🛍️</span>
                          <p>No orders yet.</p>
                          <button className="btn btn-primary" onClick={() => setActivePage('product')}>
                            Shop Now
                          </button>
                        </div>
                      ) : (
                        <div className="account-order-list">
                          {[...myOrders].reverse().map((order) => (
                            <div key={order.id} className="account-order-card">
                              <div className="account-order-header">
                                <div>
                                  <p className="account-order-id">{order.id}</p>
                                  <p className="account-order-date">
                                    {new Date(order.placedAt).toLocaleDateString('en-IN', {
                                      day: 'numeric', month: 'short', year: 'numeric',
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
                                <span>Delivery: {order.deliveryFee === 0 ? <span className="checkout-free">Free</span> : `₹${order.deliveryFee}`}</span>
                                <span>Payment: <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</strong></span>
                                {(order.status === 'confirmed' || order.status === 'pending') && (
                                  <button
                                    className="order-cancel-btn"
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Saved Addresses tab ─────────────── */}
                  {accountTab === 'addresses' && (
                    <div className="account-addresses">
                      {savedAddresses.length === 0 && !addAddrOpen && (
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
                              <button className="address-card-delete" onClick={() => handleDeleteAddress(addr.id)} title="Remove">✕</button>
                            </div>
                            <p className="address-card-line">{addr.firstName} {addr.lastName}{addr.phone ? ` · ${addr.phone}` : ''}</p>
                            <p className="address-card-line">{addr.address}</p>
                            <p className="address-card-line">{addr.city} — {addr.pincode}</p>
                          </div>
                        ))}
                      </div>

                      {addAddrOpen ? (
                        <form className="add-address-form" onSubmit={handleAddAddress}>
                          <h4 className="add-address-title">New Address</h4>
                          {addAddrError && (
                            <div className="contact-error">⚠ {addAddrError}</div>
                          )}
                          <div className="contact-form-row">
                            <div className="contact-field">
                              <label className="contact-label">Label</label>
                              <input className="contact-input" placeholder="Home / Office" value={addAddrForm.label} onChange={e => setAddAddrForm(p => ({ ...p, label: e.target.value }))} />
                            </div>
                            <div className="contact-field">
                              <label className="contact-label">Phone</label>
                              <input className="contact-input" type="tel" placeholder="+91 98765 43210" value={addAddrForm.phone} onChange={e => setAddAddrForm(p => ({ ...p, phone: e.target.value }))} />
                            </div>
                          </div>
                          <div className="contact-form-row">
                            <div className="contact-field">
                              <label className="contact-label">First name</label>
                              <input className="contact-input" placeholder="Rahul" value={addAddrForm.firstName} onChange={e => setAddAddrForm(p => ({ ...p, firstName: e.target.value }))} />
                            </div>
                            <div className="contact-field">
                              <label className="contact-label">Last name</label>
                              <input className="contact-input" placeholder="Doe" value={addAddrForm.lastName} onChange={e => setAddAddrForm(p => ({ ...p, lastName: e.target.value }))} />
                            </div>
                          </div>
                          <div className="contact-field">
                            <label className="contact-label">Street Address</label>
                            <input className="contact-input" placeholder="House no., Street, Landmark" value={addAddrForm.address} onChange={e => setAddAddrForm(p => ({ ...p, address: e.target.value }))} required />
                          </div>
                          <div className="contact-form-row">
                            <div className="contact-field">
                              <label className="contact-label">City</label>
                              <input className="contact-input" placeholder="Shimla" value={addAddrForm.city} onChange={e => setAddAddrForm(p => ({ ...p, city: e.target.value }))} required />
                            </div>
                            <div className="contact-field">
                              <label className="contact-label">Pincode</label>
                              <input className="contact-input" placeholder="171001" value={addAddrForm.pincode} onChange={e => setAddAddrForm(p => ({ ...p, pincode: e.target.value }))} required />
                            </div>
                          </div>
                          <div className="add-address-actions">
                            <button type="button" className="btn account-logout-btn" onClick={() => setAddAddrOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={addAddrLoading}>{addAddrLoading ? 'Saving…' : 'Save Address'}</button>
                          </div>
                        </form>
                      ) : (
                        <button className="btn btn-primary add-address-btn" onClick={() => { setAddAddrOpen(true); setAddAddrError('') }}>+ Add New Address</button>
                      )}
                    </div>
                  )}

                  {/* ── Wallet tab ──────────────────────── */}
                  {accountTab === 'wallet' && (
                    <div className="account-wallet">
                      <div className="wallet-balance-card">
                        <p className="wallet-balance-label">Available Balance</p>
                        <p className="wallet-balance-amount">₹{wallet.balance.toFixed(2)}</p>
                        <p className="wallet-balance-note">Earn 5% cashback on every order 🎂</p>
                      </div>
                      <h4 className="wallet-history-title">Transaction History</h4>
                      {wallet.transactions.length === 0 ? (
                        <div className="account-empty-box">
                          <span className="account-empty-icon">💳</span>
                          <p>No transactions yet. Place an order to earn cashback!</p>
                        </div>
                      ) : (
                        <div className="wallet-transactions">
                          {[...wallet.transactions].reverse().map((tx) => (
                            <div key={tx.id} className="wallet-tx">
                              <div className="wallet-tx-info">
                                <p className="wallet-tx-desc">{tx.description}</p>
                                <p className="wallet-tx-date">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
        )}
      </AnimatePresence>

      {/* ── Checkout Page ───────────────────────────────────── */}
      <AnimatePresence>
        {activePage === 'checkout' && (
          <motion.div
            key="checkout-overlay"
            className="checkout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="checkout-panel"
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {checkoutStatus === 'success' && orderResult ? (
                /* ── Success screen ────────── */
                <motion.div className="checkout-success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="checkout-success-icon">🎉</div>
                  <h2>Order Confirmed!</h2>
                  <p className="checkout-success-id">Order ID: <strong>{orderResult.orderId}</strong></p>
                  <p className="checkout-success-sub">Estimated delivery: <strong>{orderResult.estimatedDelivery}</strong></p>
                  <p className="checkout-success-total">Total paid: <strong>₹{orderResult.total.toFixed(2)}</strong></p>
                  <button className="btn btn-primary" onClick={() => { setActivePage('home'); setCheckoutForm({ firstName:'',lastName:'',email:'',phone:'',address:'',city:'',pincode:'' }) }}>
                    Back to Home
                  </button>
                </motion.div>
              ) : (
                /* ── Checkout form ────────── */
                <div className="checkout-layout">
                  {/* Left — Order summary */}
                  <div className="checkout-summary">
                    <div className="checkout-summary-header">
                      <button className="checkout-back" onClick={() => { setCartOpen(true); setActivePage('home') }}>← Back to cart</button>
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
                          <p className="checkout-item-price">₹{(item.product.price * item.quantity).toFixed(2)}</p>
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
                        <span>{cartTotal >= 50 ? <span className="checkout-free">Free</span> : '₹5.00'}</span>
                      </div>
                      <div className="checkout-total-row checkout-total-row--final">
                        <span>Total</span>
                        <span>₹{(cartTotal >= 50 ? cartTotal : cartTotal + 5).toFixed(2)}</span>
                      </div>
                    </div>
                    {cartTotal < 50 && (
                      <p className="checkout-free-tip">🚚 Add ₹{(50 - cartTotal).toFixed(2)} more for free delivery!</p>
                    )}
                  </div>

                  {/* Right — Delivery form */}
                  <div className="checkout-form-wrap">
                    <h2 className="checkout-heading">Delivery Details</h2>
                    {checkoutStatus === 'error' && (
                      <div className="contact-error">⚠ {checkoutError}</div>
                    )}
                    {/* Saved address quick-fill */}
                    {authUser && savedAddresses.length > 0 && (
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
                          <input className="contact-input" name="firstName" placeholder="Rahul" value={checkoutForm.firstName} onChange={handleCheckoutChange} required />
                        </div>
                        <div className="contact-field">
                          <label className="contact-label">Last name</label>
                          <input className="contact-input" name="lastName" placeholder="Doe" value={checkoutForm.lastName} onChange={handleCheckoutChange} required />
                        </div>
                      </div>
                      <div className="contact-form-row">
                        <div className="contact-field">
                          <label className="contact-label">Email</label>
                          <input className="contact-input" name="email" type="email" placeholder="rahul@example.com" value={checkoutForm.email} onChange={handleCheckoutChange} required />
                        </div>
                        <div className="contact-field">
                          <label className="contact-label">Phone</label>
                          <input className="contact-input" name="phone" type="tel" placeholder="+91 98765 43210" value={checkoutForm.phone} onChange={handleCheckoutChange} required />
                        </div>
                      </div>
                      <div className="contact-field">
                        <label className="contact-label">Address</label>
                        <input className="contact-input" name="address" placeholder="House no., Street, Landmark" value={checkoutForm.address} onChange={handleCheckoutChange} required />
                      </div>
                      <div className="contact-form-row">
                        <div className="contact-field">
                          <label className="contact-label">City</label>
                          <input className="contact-input" name="city" placeholder="Shimla" value={checkoutForm.city} onChange={handleCheckoutChange} required />
                        </div>
                        <div className="contact-field">
                          <label className="contact-label">Pincode</label>
                          <input className="contact-input" name="pincode" placeholder="171001" value={checkoutForm.pincode} onChange={handleCheckoutChange} required />
                        </div>
                      </div>

                      {/* Payment method */}
                      <div className="checkout-payment">
                        <p className="contact-label">Payment Method</p>
                        <div className="checkout-payment-options">
                          <label className={`checkout-payment-opt${paymentMethod === 'cod' ? ' checkout-payment-opt--active' : ''}`}>
                            <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                            💵 Cash on Delivery
                          </label>
                          <label className={`checkout-payment-opt${paymentMethod === 'online' ? ' checkout-payment-opt--active' : ''}`}>
                            <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                            📱 Online Payment
                          </label>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary checkout-submit" disabled={checkoutStatus === 'loading'}>
                        {checkoutStatus === 'loading' ? 'Placing order…' : `Place Order • ₹${(cartTotal >= 50 ? cartTotal : cartTotal + 5).toFixed(2)}`}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Auth Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {authModalOpen && (
          <motion.div
            key="auth-overlay"
            className="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => { if (e.target === e.currentTarget) { setAuthModalOpen(false); setPendingCheckout(false) } }}
          >
            <motion.div
              className="auth-modal"
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className="auth-modal-close" onClick={() => { setAuthModalOpen(false); setPendingCheckout(false) }}>✕</button>

              <div className="auth-modal-brand">🎂</div>
              <h2 className="auth-modal-title">
                {authMode === 'login' ? 'Welcome back!' : 'Create account'}
              </h2>
              {pendingCheckout && (
                <p className="auth-modal-hint">
                  {authMode === 'login' ? 'Sign in to continue to checkout' : 'Create an account to continue to checkout'}
                </p>
              )}

              {authStatus === 'error' && (
                <div className="contact-error">⚠ {authError}</div>
              )}

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label className="contact-label">First name</label>
                      <input className="contact-input" name="firstName" placeholder="Rahul" value={authForm.firstName} onChange={handleAuthChange} required />
                    </div>
                    <div className="contact-field">
                      <label className="contact-label">Last name</label>
                      <input className="contact-input" name="lastName" placeholder="Doe" value={authForm.lastName} onChange={handleAuthChange} required />
                    </div>
                  </div>
                )}
                <div className="contact-field">
                  <label className="contact-label">Email</label>
                  <input className="contact-input" name="email" type="email" placeholder="rahul@keprates.com" value={authForm.email} onChange={handleAuthChange} required />
                </div>
                {authMode === 'register' && (
                  <div className="contact-field">
                    <label className="contact-label">Phone (optional)</label>
                    <input className="contact-input" name="phone" type="tel" placeholder="+91 98765 43210" value={authForm.phone} onChange={handleAuthChange} />
                  </div>
                )}
                <div className="contact-field">
                  <label className="contact-label">Password</label>
                  <input className="contact-input" name="password" type="password" placeholder={authMode === 'register' ? 'At least 6 characters' : '••••••••'} value={authForm.password} onChange={handleAuthChange} required />
                </div>
                <button type="submit" className="btn btn-primary auth-submit" disabled={authStatus === 'loading'}>
                  {authStatus === 'loading' ? 'Please wait…' : authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p className="auth-switch">
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  className="auth-switch-btn"
                  onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); setAuthStatus('idle') }}
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ────────────────────────────────────── */}
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
              {/* Header */}
              <div className="cart-drawer-header">
                <div className="cart-drawer-title">
                  <h2>Your Cart</h2>
                  {cartCount > 0 && <span className="cart-drawer-count">{cartCount}</span>}
                </div>
                <button className="cart-close" onClick={() => setCartOpen(false)} aria-label="Close cart">✕</button>
              </div>

              {/* Body */}
              <div className="cart-drawer-body">
                {cartLoading ? (
                  <div className="cart-empty"><p>Loading your cart…</p></div>
                ) : cartItems.length === 0 ? (
                  <div className="cart-empty">
                    <span className="cart-empty-icon">🍰</span>
                    <p>Your cart is empty.</p>
                    <button className="btn btn-outline" onClick={() => { setCartOpen(false); setActivePage('product') }}>Browse Products</button>
                  </div>
                ) : (
                  <ul className="cart-list">
                    {cartItems.map((item) => (
                      <li key={item.id} className={`cart-item${removingId === item.id ? ' cart-item--removing' : ''}`}>
                        <img src={item.product.image} alt={item.product.name} className="cart-item-img" />
                        <div className="cart-item-info">
                          <p className="cart-item-name">{item.product.name}</p>
                          <p className="cart-item-cat">{item.product.category === 'chocolate-cake' ? 'Chocolate Cake' : 'Chocolate'}</p>
                          <p className="cart-item-price">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="cart-item-controls">
                          <div className="cart-qty">
                            <button className="cart-qty-btn" onClick={() => handleQtyChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                            <span className="cart-qty-val">{item.quantity}</span>
                            <button className="cart-qty-btn" onClick={() => handleQtyChange(item.id, item.quantity + 1)}>+</button>
                          </div>
                          <button
                            className="cart-remove"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label="Remove"
                            disabled={removingId === item.id}
                          >
                            🗑
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="cart-drawer-footer">
                  <div className="cart-subtotal">
                    <span>Subtotal</span>
                    <span className="cart-subtotal-val">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    className="btn btn-primary cart-checkout"
                    onClick={() => {
                      if (!authUser) {
                        setPendingCheckout(true)
                        setAuthMode('login')
                        setAuthError('')
                        setAuthModalOpen(true)
                      } else {
                        setCartOpen(false)
                        setActivePage('checkout')
                        setCheckoutStatus('idle')
                        setOrderResult(null)
                      }
                    }}
                  >Proceed to Checkout</button>
                  <button className="cart-clear" onClick={handleClearCart}>Clear cart</button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>

      {/* ── Admin Panel ────────────────────────────────────── */}
      <AnimatePresence>
        {adminPageOpen && (
          <motion.div
            className="admin-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="admin-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="admin-header">
                <div className="admin-header-left">
                  <span className="admin-logo">🎂</span>
                  <div>
                    <h2 className="admin-title">Admin Panel</h2>
                    <p className="admin-subtitle">Keprates Dashboard</p>
                  </div>
                </div>
                <div className="admin-header-right">
                  {adminToken && (
                    <button className="admin-logout-btn" onClick={handleAdminLogout}>Sign Out</button>
                  )}
                  <button className="admin-close-btn" onClick={() => setAdminPageOpen(false)}>✕</button>
                </div>
              </div>

              {!adminToken ? (
                /* ── Admin Login ─────────────────────── */
                <div className="admin-login-wrap">
                  <div className="admin-login-card">
                    <h3 className="admin-login-title">Admin Access</h3>
                    <p className="admin-login-sub">Sign in with your admin credentials</p>
                    {adminLoginError && <div className="contact-error">⚠ {adminLoginError}</div>}
                    <form className="admin-login-form" onSubmit={handleAdminLogin}>
                      <div className="contact-field">
                        <label className="contact-label">Email</label>
                        <input className="contact-input" type="email" placeholder="admin@keprates.com" value={adminLoginForm.email} onChange={e => setAdminLoginForm(p => ({ ...p, email: e.target.value }))} required />
                      </div>
                      <div className="contact-field">
                        <label className="contact-label">Password</label>
                        <input className="contact-input" type="password" placeholder="••••••••" value={adminLoginForm.password} onChange={e => setAdminLoginForm(p => ({ ...p, password: e.target.value }))} required />
                      </div>
                      <button type="submit" className="btn btn-primary admin-login-submit" disabled={adminLoginLoading}>
                        {adminLoginLoading ? 'Signing in…' : 'Sign In as Admin'}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* ── Admin Dashboard ─────────────────── */
                <div className="admin-body">
                  {/* Tabs */}
                  <div className="admin-tabs">
                    {(['dashboard', 'orders', 'products', 'users'] as const).map(tab => (
                      <button key={tab} className={`admin-tab-btn${adminTab === tab ? ' admin-tab-btn--active' : ''}`} onClick={() => setAdminTab(tab)}>
                        {tab === 'dashboard' ? '📊 Dashboard' : tab === 'orders' ? '📦 Orders' : tab === 'products' ? '🍰 Products' : '👥 Users'}
                      </button>
                    ))}
                  </div>

                  {adminLoading && <p className="admin-loading">Loading…</p>}

                  {/* ── Dashboard tab ─── */}
                  {adminTab === 'dashboard' && adminStats && (
                    <div className="admin-dashboard">
                      <div className="admin-stat-grid">
                        <div className="admin-stat-card admin-stat-card--pink">
                          <span className="admin-stat-value">{adminStats.totalOrders}</span>
                          <span className="admin-stat-label">Total Orders</span>
                        </div>
                        <div className="admin-stat-card admin-stat-card--green">
                          <span className="admin-stat-value">₹{adminStats.totalRevenue.toFixed(2)}</span>
                          <span className="admin-stat-label">Revenue</span>
                        </div>
                        <div className="admin-stat-card admin-stat-card--blue">
                          <span className="admin-stat-value">{adminStats.totalUsers}</span>
                          <span className="admin-stat-label">Users</span>
                        </div>
                        <div className="admin-stat-card admin-stat-card--purple">
                          <span className="admin-stat-value">{adminStats.totalProducts}</span>
                          <span className="admin-stat-label">Products</span>
                        </div>
                      </div>
                      <div className="admin-stat-grid">
                        <div className="admin-mini-stat"><span className="admin-mini-dot admin-mini-dot--yellow" />{adminStats.pendingOrders} Pending</div>
                        <div className="admin-mini-stat"><span className="admin-mini-dot admin-mini-dot--pink" />{adminStats.confirmedOrders} Confirmed</div>
                        <div className="admin-mini-stat"><span className="admin-mini-dot admin-mini-dot--green" />{adminStats.deliveredOrders} Delivered</div>
                        <div className="admin-mini-stat"><span className="admin-mini-dot admin-mini-dot--red" />{adminStats.cancelledOrders} Cancelled</div>
                      </div>
                    </div>
                  )}

                  {/* ── Orders tab ─── */}
                  {adminTab === 'orders' && (
                    <div className="admin-list">
                      {adminOrders.length === 0 ? (
                        <p className="admin-empty">No orders yet.</p>
                      ) : adminOrders.map(order => (
                        <div key={order.id} className="admin-order-row">
                          <div className="admin-order-info">
                            <span className="admin-order-id">{order.id}</span>
                            <span className="admin-order-customer">{order.customer.firstName} {order.customer.lastName}</span>
                            <span className="admin-order-date">{new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="admin-order-total">₹{order.total.toFixed(2)}</span>
                          </div>
                          <div className="admin-order-actions">
                            <span className={`admin-status-badge admin-status--${order.status}`}>{order.status}</span>
                            <select className="admin-status-select" value={order.status} onChange={e => handleAdminOrderStatus(order.id, e.target.value)}>
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Products tab ─── */}
                  {adminTab === 'products' && (
                    <div className="admin-list">
                      <div className="admin-list-header">
                        <span>{adminProducts.length} products</span>
                        <button className="btn btn-primary admin-add-btn" onClick={() => { setNewProductOpen(true); setNewProductError('') }}>+ Add Product</button>
                      </div>

                      {newProductOpen && (
                        <form className="admin-product-form" onSubmit={handleAdminAddProduct}>
                          <h4 className="admin-form-title">New Product</h4>
                          {newProductError && <div className="contact-error">⚠ {newProductError}</div>}
                          <div className="contact-form-row">
                            <div className="contact-field">
                              <label className="contact-label">Name</label>
                              <input className="contact-input" placeholder="Chocolate Fudge Cake" value={newProductForm.name} onChange={e => setNewProductForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div className="contact-field">
                              <label className="contact-label">Category</label>
                              <select className="contact-input" value={newProductForm.category} onChange={e => setNewProductForm(p => ({ ...p, category: e.target.value }))}>
                                <option value="chocolate-cake">Chocolate Cake</option>
                                <option value="chocolate">Chocolate</option>
                              </select>
                            </div>
                          </div>
                          <div className="contact-form-row">
                            <div className="contact-field">
                              <label className="contact-label">Price ($)</label>
                              <input className="contact-input" type="number" min="1" step="0.01" placeholder="24.99" value={newProductForm.price} onChange={e => setNewProductForm(p => ({ ...p, price: e.target.value }))} required />
                            </div>
                            <div className="contact-field">
                              <label className="contact-label">Original Price (optional)</label>
                              <input className="contact-input" type="number" min="1" step="0.01" placeholder="29.99" value={newProductForm.originalPrice} onChange={e => setNewProductForm(p => ({ ...p, originalPrice: e.target.value }))} />
                            </div>
                          </div>
                          <div className="contact-form-row">
                            <div className="contact-field">
                              <label className="contact-label">Rating (1–5)</label>
                              <input className="contact-input" type="number" min="1" max="5" step="0.1" value={newProductForm.rating} onChange={e => setNewProductForm(p => ({ ...p, rating: e.target.value }))} />
                            </div>
                            <div className="contact-field" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'center', gap: 10 }}>
                              <label className="contact-label" style={{ margin: 0 }}>On Sale</label>
                              <input type="checkbox" checked={newProductForm.onSale} onChange={e => setNewProductForm(p => ({ ...p, onSale: e.target.checked }))} style={{ width: 20, height: 20, accentColor: '#ff3f96' }} />
                            </div>
                          </div>
                          <div className="contact-field">
                            <label className="contact-label">Image URL</label>
                            <input className="contact-input" placeholder="https://…" value={newProductForm.image} onChange={e => setNewProductForm(p => ({ ...p, image: e.target.value }))} />
                          </div>
                          <div className="contact-field">
                            <label className="contact-label">Description</label>
                            <input className="contact-input" placeholder="Short product description" value={newProductForm.description} onChange={e => setNewProductForm(p => ({ ...p, description: e.target.value }))} />
                          </div>
                          <div className="add-address-actions">
                            <button type="button" className="btn account-logout-btn" onClick={() => setNewProductOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={newProductLoading}>{newProductLoading ? 'Adding…' : 'Add Product'}</button>
                          </div>
                        </form>
                      )}

                      {adminProducts.map(p => (
                        <div key={p.id} className="admin-product-row">
                          <img src={p.image} alt={p.name} className="admin-product-img" />
                          <div className="admin-product-info">
                            <span className="admin-product-name">{p.name}</span>
                            <span className="admin-product-meta">{p.category} · ${p.price} · ★{p.rating}{p.onSale ? ' · On Sale' : ''}</span>
                          </div>
                          <button className="admin-delete-btn" onClick={() => handleAdminDeleteProduct(p.id)}>🗑</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Users tab ─── */}
                  {adminTab === 'users' && (
                    <div className="admin-list">
                      {adminUsers.length === 0 ? (
                        <p className="admin-empty">No registered users yet.</p>
                      ) : adminUsers.map(u => (
                        <div key={u.id} className="admin-user-row">
                          <div className="admin-user-avatar">{u.firstName[0]}{u.lastName[0]}</div>
                          <div className="admin-user-info">
                            <span className="admin-user-name">{u.firstName} {u.lastName}</span>
                            <span className="admin-user-email">{u.email}</span>
                          </div>
                          <span className="admin-user-since">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App

