const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api'

export type ProductCategory = 'chocolate-cake' | 'chocolate'

export type Product = {
  id: string
  name: string
  category: ProductCategory
  price: number
  originalPrice?: number
  onSale: boolean
  image: string
  description: string
  rating: number
}

export type CartItem = {
  id: number
  productId: string
  quantity: number
  product: Product
}

export type CartResponse = {
  success: boolean
  data: CartItem[]
  total: number
  count: number
}

export type ContactPayload = {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}

// ── Products ────────────────────────────────────────────────────────────────

export async function fetchProducts(params?: {
  category?: ProductCategory
  sale?: boolean
  sort?: 'featured' | 'priceLow' | 'priceHigh'
}): Promise<Product[]> {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.sale) query.set('sale', 'true')
  if (params?.sort && params.sort !== 'featured') query.set('sort', params.sort)

  const res = await fetch(`${BASE}/products?${query}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

// ── Cart ────────────────────────────────────────────────────────────────────

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch(`${BASE}/cart`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json
}

export async function addToCart(productId: string, quantity = 1): Promise<{ count: number }> {
  const res = await fetch(`${BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return { count: json.count }
}

export async function updateCartItem(itemId: number, quantity: number): Promise<void> {
  const res = await fetch(`${BASE}/cart/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
}

export async function removeCartItem(itemId: number): Promise<{ count: number }> {
  const res = await fetch(`${BASE}/cart/${itemId}`, { method: 'DELETE' })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return { count: json.count }
}

export async function clearCart(): Promise<void> {
  const res = await fetch(`${BASE}/cart`, { method: 'DELETE' })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export type AuthResult = {
  token: string
  user: AuthUser
  message: string
}

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phone?: string,
): Promise<AuthResult> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, phone }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json
}

export async function logoutUser(token: string): Promise<void> {
  await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type CheckoutCustomer = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  pincode: string
}

export type OrderItem = { productId: number; quantity: number }

export type OrderResult = {
  orderId: string
  total: number
  placedAt: string
  estimatedDelivery: string
}

export async function placeOrder(
  customer: CheckoutCustomer,
  items: OrderItem[],
  paymentMethod: string,
  token?: string | null,
): Promise<OrderResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ customer, items, paymentMethod }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

export type MyOrderItem = {
  productId: number
  name: string
  category: string
  price: number
  quantity: number
  lineTotal: number
}

export type MyOrder = {
  id: string
  customer: CheckoutCustomer & { phone: string }
  items: MyOrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: string
  status: string
  placedAt: string
}

export async function cancelOrder(token: string, orderId: string): Promise<void> {
  const res = await fetch(`${BASE}/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
}

export async function fetchMyOrders(token: string): Promise<MyOrder[]> {
  const res = await fetch(`${BASE}/orders/my`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}


// ── Addresses ───────────────────────────────────────────────────────────────

export type SavedAddress = {
  id: number
  label: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  pincode: string
}

export async function fetchAddresses(token: string): Promise<SavedAddress[]> {
  const res = await fetch(`${BASE}/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

export async function addAddress(
  token: string,
  payload: Omit<SavedAddress, 'id'>,
): Promise<SavedAddress> {
  const res = await fetch(`${BASE}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

export async function deleteAddress(token: string, id: number): Promise<void> {
  await fetch(`${BASE}/addresses/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── Wallet ──────────────────────────────────────────────────────────────────

export type WalletTransaction = {
  id: number
  type: string
  amount: number
  description: string
  date: string
}

export type WalletData = {
  balance: number
  transactions: WalletTransaction[]
}

export async function fetchWallet(token: string): Promise<WalletData> {
  const res = await fetch(`${BASE}/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

// ── Admin ──────────────────────────────────────────────────────────────────

export type AdminStats = {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalProducts: number
  pendingOrders: number
  confirmedOrders: number
  cancelledOrders: number
  deliveredOrders: number
}

export type AdminUser = {
  id: number
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.token
}

export async function adminLogout(token: string): Promise<void> {
  await fetch(`${BASE}/admin/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

export async function fetchAdminOrders(token: string): Promise<MyOrder[]> {
  const res = await fetch(`${BASE}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

export async function adminUpdateOrderStatus(token: string, orderId: string, status: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
}

export async function fetchAdminProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${BASE}/admin/products`, { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

export async function adminAddProduct(token: string, product: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch(`${BASE}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(product),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

export async function adminDeleteProduct(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
}

export async function fetchAdminUsers(token: string): Promise<AdminUser[]> {
  const res = await fetch(`${BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

// ── Contact ─────────────────────────────────────────────────────────────────

export async function submitContact(payload: ContactPayload): Promise<string> {
  const res = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.message
}
