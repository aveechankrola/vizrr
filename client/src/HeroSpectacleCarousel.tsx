import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const FALLBACK_IMAGE = '/images/fallback.svg'

const PRODUCTS = [
  {
    image: '/images/frame1.jpg',
    alt: 'Model wearing clear acetate eyeglasses in a natural studio setting',
    tag: 'New arrival',
    title: 'Clear acetate frame',
   
  },
  {
    image: '/images/frame2.jpg',
    alt: 'Premium sunglasses shown as a retail product close-up',
    tag: 'Best seller',
    title: 'Tortoiseshell sunglasses',
    
  },
  {
    image: '/images/frame3.jpg',
    alt: 'Minimal metal eyeglasses styled like a premium shop display',
    tag: 'Editor pick',
    title: 'Lightweight metal frame',
   
  },
] as const

const ROTATE_MS = 5000
const CROSSFADE_S = 0.85
const EASE = [0.22, 1, 0.36, 1] as const

export function HeroSpectacleCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    ;[...PRODUCTS, { image: FALLBACK_IMAGE }].forEach(({ image }) => {
      const img = new Image()
      img.src = image
    })
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((n) => (n + 1) % PRODUCTS.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className="hero-image-circle" aria-hidden />
      <div className="hero-image-carousel">
        <div className="hero-image-frame">
          <AnimatePresence initial={false} mode="sync">
            <motion.img
              key={PRODUCTS[index].image}
              className="hero-image hero-image--rotating"
              src={PRODUCTS[index].image}
              alt={PRODUCTS[index].alt}
              initial={false}
              animate={{ opacity: 1, transition: { duration: CROSSFADE_S, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: CROSSFADE_S, ease: EASE } }}
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
              onError={(event) => {
                if (event.currentTarget.src !== window.location.origin + FALLBACK_IMAGE) {
                  event.currentTarget.onerror = null
                  event.currentTarget.src = FALLBACK_IMAGE
                }
              }}
            />
          </AnimatePresence>
          <div className="hero-badge" aria-hidden>
            <div className="hero-badge-inner">
              <span>{PRODUCTS[index].tag}</span>
              <span className="hero-badge-main">{PRODUCTS[index].title}</span>
            </div>
          </div>
          <div className="hero-rating" aria-hidden>
            <span className="hero-rating-label">{PRODUCTS[index].title}</span>
            <span className="hero-rating-score">4.9 / 5</span>
          </div>
          <div className="hero-image-purple-wash" aria-hidden />
        </div>
        <div className="hero-carousel-dots" role="tablist" aria-label="Spectacle highlights">
          {PRODUCTS.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show image ${i + 1}`}
              className={`hero-carousel-dot${i === index ? ' hero-carousel-dot--active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
