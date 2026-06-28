import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  addToCart,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
  type CartItem,
} from '../api'

type CartContextValue = {
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  cartItems: CartItem[]
  cartTotal: number
  cartCount: number
  cartLoading: boolean
  addingId: string | null
  removingId: number | null
  refreshCart: () => Promise<void>
  openCart: () => Promise<void>
  addProduct: (productId: string) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  changeQty: (itemId: number, qty: number) => Promise<void>
  clearAll: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
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
    } catch {
      /* server may not be up */
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const openCart = useCallback(async () => {
    setCartOpen(true)
    setCartLoading(true)
    await refreshCart()
    setCartLoading(false)
  }, [refreshCart])

  const addProduct = useCallback(
    async (productId: string) => {
      setAddingId(productId)
      try {
        await addToCart(productId)
        await refreshCart()
      } catch {
        /* ignore */
      } finally {
        setAddingId(null)
      }
    },
    [refreshCart],
  )

  const removeItem = useCallback(
    async (itemId: number) => {
      setRemovingId(itemId)
      try {
        await removeCartItem(itemId)
        await refreshCart()
      } catch {
        /* ignore */
      } finally {
        setRemovingId(null)
      }
    },
    [refreshCart],
  )

  const changeQty = useCallback(
    async (itemId: number, qty: number) => {
      if (qty < 1) return
      try {
        await updateCartItem(itemId, qty)
        await refreshCart()
      } catch {
        /* ignore */
      }
    },
    [refreshCart],
  )

  const clearAll = useCallback(async () => {
    try {
      await clearCart()
      await refreshCart()
    } catch {
      /* ignore */
    }
  }, [refreshCart])

  const value = useMemo(
    () => ({
      cartOpen,
      setCartOpen,
      cartItems,
      cartTotal,
      cartCount,
      cartLoading,
      addingId,
      removingId,
      refreshCart,
      openCart,
      addProduct,
      removeItem,
      changeQty,
      clearAll,
    }),
    [
      cartOpen,
      cartItems,
      cartTotal,
      cartCount,
      cartLoading,
      addingId,
      removingId,
      refreshCart,
      openCart,
      addProduct,
      removeItem,
      changeQty,
      clearAll,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
