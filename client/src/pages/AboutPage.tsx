import { motion } from 'framer-motion'
import { pageVariants } from '../app/animations'

const FALLBACK_FRAME_IMAGE = '/images/fallback.svg'

const FRAME_STYLES = [
  { title: 'Classic acetate', shape: 'Oval faces', image: '/frames/classic-acetate.jpg', alt: 'Classic acetate eyeglasses on a purple display background' },
  { title: 'Slim metal', shape: 'Square faces', image: '/frames/slim-metal.jpg', alt: 'Slim metal eyeglasses in a modern retail-style shot' },
  { title: 'Round wire', shape: 'Heart faces', image: '/frames/round-wire.jpg', alt: 'Round wire frame glasses with a clean studio look' },
  { title: 'Soft browline', shape: 'Round faces', image: '/frames/soft-browline.jpg', alt: 'Soft browline eyeglasses presented in a premium frame card' },
  { title: 'Rimless light', shape: 'All-day wear', image: '/frames/rimless-light.jpg', alt: 'Lightweight rimless eyeglasses on a bright product backdrop' },
  { title: 'Bold rectangular', shape: 'Oval faces', image: '/frames/bold-rectangular.jpg', alt: 'Bold rectangular eyeglasses with a strong silhouette' },
  { title: 'Retro cat-eye', shape: 'Heart faces', image: '/frames/retro-cat-eye.jpg', alt: 'Retro cat-eye glasses with a fashion-forward look' },
  { title: 'Geometric edge', shape: 'Square faces', image: '/frames/geometric-edge.jpg', alt: 'Geometric edge glasses with a sharp modern frame shape' },
  { title: 'Transparent frame', shape: 'Minimalists', image: '/frames/transparent-frame.jpg', alt: 'Transparent frame glasses with a light minimal style' },
  { title: 'Tortoiseshell', shape: 'Most face shapes', image: '/frames/tortoiseshell.jpg', alt: 'Tortoiseshell eyeglasses styled as a premium product shot' },
] as const

const FRAME_ITEMS = Array.from({ length: 50 }, (_, index) => {
  const style = FRAME_STYLES[index % FRAME_STYLES.length]
  return {
    title: style.title,
    shape: style.shape,
    image: style.image,
    alt: style.alt,
  }
})

export function AboutPage() {
  return (
    <motion.div className="app-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <main className="about-page">
        <section className="about-hero">
          <div className="about-text">
            <p className="about-kicker">Frames section</p>
            <h2 className="about-heading">
              Discover frames that match
              <br />
              your face shape.
            </h2>
            <p className="about-body">
              Vizrr shows 50+ frames selected for different face structures, so you can quickly see which styles suit round, square, oval, heart, and other face shapes.
            </p>
            <p className="about-body">
              Use our AI-powered live chat or expert consultation to compare frame styles and choose the pair that fits your look best.
            </p>
            <motion.div
              className="about-stats"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="about-stat">
                <span className="about-stat-number">50+</span>
                <span className="about-stat-label">Frames to explore</span>
              </div>
              <motion.div className="about-stat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
                <span className="about-stat-number">5+</span>
                <span className="about-stat-label">Face shapes matched</span>
              </motion.div>
              <motion.div className="about-stat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }}>
                <span className="about-stat-number">98%</span>
                <span className="about-stat-label">Customer satisfaction</span>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="about-card"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="about-card-ring" />
            <div className="about-card-inner">
              <h3>How the frames section works</h3>
              <ul>
                <li>Browse 50+ frames and compare the styles side by side</li>
                <li>See which frames suit round, oval, square, and heart face shapes</li>
                <li>Use live AI chat for instant frame and face-shape guidance</li>
              </ul>
              <button type="button" className="btn btn-primary about-cta">
                Explore frames
              </button>
            </div>
          </motion.div>
        </section>

        <section className="frames-gallery-section" id="frames-gallery">
          <div className="frames-gallery-header">
            <p className="about-kicker">Frames gallery</p>
            <h3 className="frames-gallery-title">50 frame photos for different face structures</h3>
            <p className="frames-gallery-copy">
              Explore a wider mix of styles, from lightweight metal to bold acetate, and compare which shapes suit oval, round, square, and heart-shaped faces.
            </p>
          </div>

          <div className="frames-gallery-grid">
            {FRAME_ITEMS.map((frame, index) => (
              <motion.article
                key={`${frame.title}-${index}`}
                className="frame-gallery-card"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: (index % 10) * 0.03 }}
              >
                <div className="frame-gallery-image-wrap">
                  <img
                    className="frame-gallery-image"
                    src={frame.image}
                    alt={frame.alt || frame.title}
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.src !== window.location.origin + FALLBACK_FRAME_IMAGE) {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = FALLBACK_FRAME_IMAGE
                      }
                    }}
                  />
                </div>
                <div className="frame-gallery-meta">
                  <h4>{frame.title}</h4>
                  <p>{frame.shape}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  )
}
