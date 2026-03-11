import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import App from './App'
import './style.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#ff3f96',
          colorBackground: '#fffdf6',
          colorText: '#2a1430',
          colorTextSecondary: '#8b4f73',
          colorInputBackground: '#ffffff',
          colorInputText: '#2a1430',
          colorDanger: '#ff315c',
          borderRadius: '0.75rem',
          fontFamily: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        elements: {
          card: { boxShadow: '0 8px 40px rgba(255, 63, 150, 0.12)', border: '1px solid #ffe0f0' },
          formButtonPrimary: { background: 'linear-gradient(90deg, #ff8ec3, #ff3f96)', boxShadow: 'none' },
          socialButtonsBlockButton: { border: '1.5px solid #ffd0e8', color: '#2a1430' },
          dividerLine: { background: '#ffd0e8' },
          dividerText: { color: '#b27a9d' },
          footerActionLink: { color: '#ff3f96' },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
