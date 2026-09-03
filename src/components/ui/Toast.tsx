'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
  success: { bg: '#F0FFF4', border: '#00C853', icon: CheckCircle2, iconColor: '#00A843' },
  error:   { bg: '#FFF5F5', border: '#FF4336', icon: XCircle,      iconColor: '#E53E3E' },
  info:    { bg: '#EBF8FF', border: '#3182CE', icon: Info,          iconColor: '#2B6CB0' },
  warning: { bg: '#FFFBEB', border: '#D97706', icon: AlertTriangle, iconColor: '#B45309' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((
    message: string,
    type: ToastType = 'success',
    duration: number = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type, duration }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — bottom right, above back-to-top */}
      <div
        style={{
          position: 'fixed',
          bottom: '76px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(toast => {
          const styles = TOAST_STYLES[toast.type]
          const Icon = styles.icon
          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                background: styles.bg,
                border: `2px solid #111111`,
                borderLeft: `4px solid ${styles.border}`,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '260px',
                maxWidth: '380px',
                pointerEvents: 'auto',
                boxShadow: '3px 3px 0px #111111',
                animation: 'toastSlideIn 0.25s ease-out',
              }}
            >
              <style>{`
                @keyframes toastSlideIn {
                  from { opacity: 0; transform: translateX(110%); }
                  to { opacity: 1; transform: translateX(0); }
                }
              `}</style>
              <Icon
                style={{ color: styles.iconColor, flexShrink: 0 }}
                className="w-4 h-4 stroke-[2.5]"
              />
              <span
                style={{
                  color: '#111111',
                  fontSize: '12px',
                  fontFamily: 'var(--font-jetbrains-mono, monospace)',
                  fontWeight: 700,
                  flex: 1,
                  lineHeight: 1.4,
                }}
              >
                {toast.message}
              </span>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666666',
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: '2px',
                  display: 'flex',
                }}
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
