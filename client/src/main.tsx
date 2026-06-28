import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import App from './App'
import { initNativeShell } from './lib/native'
import './style.css'

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk publishable key. Set VITE_CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.')
}

void initNativeShell()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#240046',
          colorBackground: '#fffdf6',
          colorText: '#10002b',
          colorTextSecondary: '#8b4f73',
          colorInputBackground: '#ffffff',
          colorInputText: '#2a1430',
          colorDanger: '#f0e6ff',
          borderRadius: '0.75rem',
          fontFamily: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        elements: {
          card: { boxShadow: '0 8px 40px rgba(255, 63, 150, 0.12)', border: '1px solid #ffe0f0' },
          formButtonPrimary: { background: 'linear-gradient(90deg, #e0aaff, #240046)', boxShadow: 'none' },
          socialButtonsBlockButton: { border: '1.5px solid #ffd0e8', color: '#2a1430' },
          dividerLine: { background: '#b298cc' },
          dividerText: { color: '#b27a9d' },
          footerActionLink: { color: '#240046' },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
