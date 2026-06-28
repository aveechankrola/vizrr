import { motion } from 'framer-motion'
import { fadeInUp, pageVariants, staggerContainer } from '../app/animations'
import { useAppUI } from '../context/AppUIContext'

export function ContactPage() {
  const { setChatOpen, chatRef } = useAppUI()

  return (
    <motion.div className="app-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <main className="contact-page">
        <section className="contact-hero">
          <motion.div
            className="contact-text"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="contact-kicker" variants={fadeInUp}>
              Get in touch
            </motion.p>
            <motion.h2 className="contact-heading" variants={fadeInUp}>
              We&apos;d love to hear
              <br />
              <span className="contact-heading-accent">from you.</span>
            </motion.h2>
            <motion.p className="contact-body" variants={fadeInUp}>
              Whether you need eyewear consultation, style advice or just want to say hello — our
              team is always here to help.
            </motion.p>
            <motion.div className="contact-info-cards" variants={fadeInUp}>
              <motion.div className="contact-info-card" whileHover={{ y: -4 }}>
                <span className="contact-info-icon">✉️</span>
                <div>
                  <p className="contact-info-label">Email us</p>
                  <a href="mailto:support@vizrr.in" className="contact-info-value contact-info-mail">
                    support@vizrr.in
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="contact-cards-wrapper">
            <motion.div
              className="contact-form-card"
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ padding: 8 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#3b0066' }}>Get in touch</p>
                <p style={{ marginTop: 8, color: '#6f4fb1' }}>
                  Prefer quick help? Use our Live AI Support, or email us at{' '}
                  <a href="mailto:support@vizrr.in">support@vizrr.in</a>.
                </p>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setChatOpen(true)
                      chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                  >
                    Open Live Chat
                  </button>
                </div>
              </div>
            </motion.div>
            <motion.div ref={chatRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          </div>
        </section>
      </main>
    </motion.div>
  )
}
