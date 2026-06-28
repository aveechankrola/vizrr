import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { pageVariants } from '../app/animations'
import {
  getAppShareUrl,
  isIOSDevice,
  isIOSSafari,
  isSecureContext,
  isStandaloneApp,
} from '../lib/platform'

export function GetAppPage() {
  const [copied, setCopied] = useState(false)
  const appUrl = useMemo(() => getAppShareUrl(), [])
  const installed = isStandaloneApp()
  const onIOS = isIOSDevice()
  const onSafari = isIOSSafari()
  const secure = isSecureContext()

  const qrUrl = appUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(appUrl)}&bgcolor=f0e6ff&color=240046`
    : ''

  async function copyLink() {
    if (!appUrl) return
    try {
      await navigator.clipboard.writeText(appUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.div className="app-page get-app-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <main className="get-app-main">
        <div className="get-app-hero">
          <div className="get-app-icon-wrap">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="get-app-icon" />
          </div>
          <h1 className="get-app-title">Get Vizrr on iPhone</h1>
          <p className="get-app-tagline">Discover clarity — install in under 30 seconds</p>
        </div>

        {installed ? (
          <motion.section className="get-app-card get-app-card--success" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
            <span className="get-app-success-emoji">✅</span>
            <h2>You&apos;re using the app!</h2>
            <p>Vizrr is installed and running from your Home Screen.</p>
          </motion.section>
        ) : !secure ? (
          <section className="get-app-card get-app-card--warn">
            <h2>HTTPS required</h2>
            <p>
              iPhone installs only work on a secure <strong>https://</strong> link. Deploy Vizrr first
              (see <code>IPHONE_INSTALL.md</code>), then open that URL in Safari.
            </p>
          </section>
        ) : onIOS && !onSafari ? (
          <section className="get-app-card get-app-card--warn">
            <h2>Open in Safari</h2>
            <p>
              Tap the <strong>⋯</strong> menu in your browser and choose <strong>Open in Safari</strong>,
              then follow the steps below.
            </p>
          </section>
        ) : (
          <>
            <section className="get-app-card">
              <h2 className="get-app-steps-title">Install on iPhone (3 taps)</h2>
              <ol className="get-app-steps">
                <li>
                  <span className="get-app-step-num">1</span>
                  <div>
                    <strong>Open this page in Safari</strong>
                    <p>Use Safari — not Chrome or in-app browsers.</p>
                  </div>
                </li>
                <li>
                  <span className="get-app-step-num">2</span>
                  <div>
                    <strong>Tap Share</strong>
                    <p>
                      The <span className="get-app-share-icon">⎙</span> Share button at the bottom of Safari.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="get-app-step-num">3</span>
                  <div>
                    <strong>Add to Home Screen</strong>
                    <p>Scroll the menu, tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</p>
                  </div>
                </li>
              </ol>
              <p className="get-app-note">
                The Vizrr icon appears on your Home Screen like any other app — full screen, no browser bar.
              </p>
            </section>

            {appUrl && (
              <section className="get-app-card get-app-share">
                <h2>Share this link</h2>
                <p className="get-app-url">{appUrl}</p>
                <div className="get-app-share-actions">
                  <button type="button" className="btn btn-primary" onClick={copyLink}>
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
                {qrUrl && (
                  <div className="get-app-qr">
                    <img src={qrUrl} alt="QR code to open Vizrr" width={220} height={220} />
                    <p>Scan with iPhone camera to open</p>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        <section className="get-app-card get-app-card--muted">
          <h2>App Store version</h2>
          <p>
            A native App Store build requires a Mac with Xcode. For now, the Home Screen install above is the
            fastest way to use Vizrr on iPhone.
          </p>
        </section>
      </main>
    </motion.div>
  )
}
