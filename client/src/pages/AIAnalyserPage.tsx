import { motion } from 'framer-motion'
import FaceAnalyzer from '../components/FaceAnalyzer.jsx'
import { pageVariants } from '../app/animations'
import { useCart } from '../context/CartContext'
import { useShop } from '../context/ShopContext'

export function AIAnalyserPage() {
  const { addingId, addProduct } = useCart()
  const { recommendedProducts, applyAnalyzerRecommendations, productsError } = useShop()

  function handleAnalyzerResult(analysis: string) {
    applyAnalyzerRecommendations(analysis)
  }

  return (
    <motion.div className="app-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <main className="product-page ai-analyser-page">
        <section className="product-header ai-analyser-header">
          <div>
            <p className="product-kicker">Vizrr AI</p>
            <h2 className="product-heading">AI Analyser</h2>
            <p className="product-subtitle">
              Scan your face shape and get frame styles matched to you — powered by Vizrr intelligence.
            </p>
          </div>
        </section>

        <section className="product-ai-section ai-analyser-main">
          <FaceAnalyzer onAnalyze={handleAnalyzerResult} />
        </section>

        {productsError && (
          <p className="products-status products-status--error">⚠ {productsError}</p>
        )}

        {recommendedProducts.length > 0 && (
          <motion.section
            className="ai-analyser-recommendations"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="ai-analyser-recommendations-title">Recommended for you</h3>
            <p className="ai-analyser-recommendations-sub">
              Based on your face analysis, these frames may suit you.
            </p>
            <motion.div className="ai-analyser-recommendations-row" layout>
              {recommendedProducts.map((p) => (
                <article key={p.id} className="ai-analyser-recommendation-card">
                  <img src={p.image} alt={p.name} />
                  <div className="ai-analyser-recommendation-body">
                    <h4>{p.name}</h4>
                    <p>₹{p.price.toFixed(2)}</p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={addingId === p.id}
                      onClick={() => addProduct(p.id)}
                    >
                      {addingId === p.id ? 'Adding…' : 'Add to cart'}
                    </button>
                  </div>
                </article>
              ))}
            </motion.div>
          </motion.section>
        )}
      </main>
    </motion.div>
  )
}
