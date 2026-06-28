import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type AppUIContextValue = {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  analyzerOpen: boolean
  setAnalyzerOpen: (open: boolean) => void
  chatRef: React.RefObject<HTMLDivElement | null>
}

const AppUIContext = createContext<AppUIContextValue | null>(null)

export function AppUIProvider({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [analyzerOpen, setAnalyzerOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement | null>(null)

  const value = useMemo(
    () => ({
      mobileMenuOpen,
      setMobileMenuOpen,
      chatOpen,
      setChatOpen,
      analyzerOpen,
      setAnalyzerOpen,
      chatRef,
    }),
    [mobileMenuOpen, chatOpen, analyzerOpen],
  )

  return <AppUIContext.Provider value={value}>{children}</AppUIContext.Provider>
}

export function useAppUI() {
  const ctx = useContext(AppUIContext)
  if (!ctx) throw new Error('useAppUI must be used within AppUIProvider')
  return ctx
}
