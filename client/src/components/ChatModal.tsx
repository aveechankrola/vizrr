import { AnimatePresence, motion } from 'framer-motion'
import ChatBot from './VizrGodAI.jsx'
import { useAppUI } from '../context/AppUIContext'

export function ChatModal() {
  const { chatOpen, setChatOpen } = useAppUI()

  return (
    <AnimatePresence>
      {chatOpen && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(59,0,102,0.42)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 12000,
            padding: 16,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setChatOpen(false)}
        >
          <motion.div
            style={{ width: 'min(560px,96%)', maxHeight: '88vh', overflow: 'auto' }}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 999,
                  width: 36,
                  height: 36,
                  fontSize: 18,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </motion.div>
            <ChatBot open onToggleOpen={(v: boolean) => setChatOpen(v)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
