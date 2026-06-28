import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HeroSpectacleCarousel } from '../HeroSpectacleCarousel'
import { fadeInUp, pageVariants, staggerContainer } from '../app/animations'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <motion.div
      key="home"
      className="app-page"
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
            See the world in <span className="hero-kicker-accent">clarity</span>
          </motion.p>
          <motion.h1 className="hero-heading" variants={fadeInUp}>
            Frames that fit
            <br />
            <span className="hero-highlight">your face — and your story.</span>
          </motion.h1>
          <motion.p className="hero-description" variants={fadeInUp}>
            Handpicked designer frames with smart fit and personalized styling — eyewear that feels
            custom made every day.
          </motion.p>
          <motion.div className="hero-buttons" variants={fadeInUp}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/about#frames-gallery')}
            >
              Order Now
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/ai-analyser')}>
              AI Face Analyser
            </button>
          </motion.div>
        </motion.section>

        <motion.section
          className="hero-image-wrapper"
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="hero-card">
            <motion.div className="hero-decor" aria-hidden initial={{ scale: 0.8 }} animate={{ scale: 1 }} />
            <HeroSpectacleCarousel />
          </div>
        </motion.section>
      </main>
    </motion.div>
  )
}
