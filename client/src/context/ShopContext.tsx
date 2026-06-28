import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { fetchProducts, type Product } from '../api'

type ShopContextValue = {
  products: Product[]
  productsLoading: boolean
  productsError: string | null
  recommendedProducts: Product[]
  setRecommendedProducts: (p: Product[]) => void
  applyAnalyzerRecommendations: (analysis: string) => void
}

const ShopContext = createContext<ShopContextValue | null>(null)

const AI_ANALYSER_PATH = '/ai-analyser'

export function ShopProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])

  const isAnalyserRoute =
    location.pathname === AI_ANALYSER_PATH ||
    location.pathname === '/shop' ||
    location.pathname.startsWith('/ai-analyser')

  useEffect(() => {
    if (!isAnalyserRoute) return
    setProductsLoading(true)
    setProductsError(null)
    fetchProducts({ sort: 'featured' })
      .then(setProducts)
      .catch((e: Error) => setProductsError(e.message))
      .finally(() => setProductsLoading(false))
  }, [isAnalyserRoute])

  const applyAnalyzerRecommendations = useCallback(
    (analysis: string) => {
      if (!analysis) return
      const lines = analysis.split('\n')
      const styles: string[] = []
      for (const l of lines) {
        const t = l.trim()
        if (t.startsWith('•')) {
          const raw = t.replace(/^•\s*/, '')
          const first = raw.split(':')[0].split(',')[0].split(' ')[0]
          if (first) styles.push(first.toLowerCase())
        }
      }
      const matches = products.filter((p) => {
        const hay = (p.name + ' ' + (p.description || '')).toLowerCase()
        return styles.some((s) => hay.includes(s))
      })
      setRecommendedProducts(matches.length ? matches : products.slice(0, 6))
    },
    [products],
  )

  const value = useMemo(
    () => ({
      products,
      productsLoading,
      productsError,
      recommendedProducts,
      setRecommendedProducts,
      applyAnalyzerRecommendations,
    }),
    [products, productsLoading, productsError, recommendedProducts, applyAnalyzerRecommendations],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
