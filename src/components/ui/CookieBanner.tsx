'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, Check, X } from 'lucide-react'

const STORAGE_KEY = 'verdict-cookies-accepted'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY)
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'false')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="font-mono"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderTop: '3px solid #111111',
        borderTopColor: '#FF4336',
        padding: '14px 20px',
        zIndex: 99997,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        boxShadow: '0 -3px 0px #111111',
      }}
    >
      <div style={{ flex: 1, minWidth: '260px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Cookie className="w-4 h-4 text-brand-red shrink-0 mt-0.5" style={{ color: '#FF4336' }} />
        <p style={{ color: '#111111', fontSize: '12px', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
          VERDICT uses localStorage to remember your filters and preferences. We do not track you across
          other websites. All politician data is sourced from public government records.{' '}
          <Link href="/method" style={{ color: '#FF4336', textDecoration: 'underline' }}>
            Learn more
          </Link>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: '8px 14px',
            background: 'transparent',
            border: '2px solid #111111',
            color: '#555555',
            fontFamily: 'var(--font-jetbrains-mono, monospace)',
            fontSize: '11px',
            cursor: 'pointer',
            letterSpacing: '0.08em',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <X className="w-3 h-3 stroke-[2.5]" /> DECLINE
        </button>
        <button
          onClick={accept}
          style={{
            padding: '8px 16px',
            background: '#FF4336',
            border: '2px solid #111111',
            color: '#FFFFFF',
            fontFamily: 'var(--font-jetbrains-mono, monospace)',
            fontSize: '11px',
            cursor: 'pointer',
            letterSpacing: '0.08em',
            fontWeight: 800,
            boxShadow: '2px 2px 0px #111111',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Check className="w-3 h-3 stroke-[2.5]" /> ACCEPT
        </button>
      </div>
    </div>
  )
}
