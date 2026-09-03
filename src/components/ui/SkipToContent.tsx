'use client'

import { useCallback } from 'react'

export function SkipToContent() {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.top = '16px'
  }, [])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.top = '-100px'
  }, [])

  return (
    <a
      href="#main-content"
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        position: 'absolute',
        top: '-100px',
        left: '16px',
        background: '#FF4336',
        color: '#FFFFFF',
        padding: '8px 16px',
        fontFamily: 'var(--font-jetbrains-mono, monospace)',
        fontSize: '12px',
        fontWeight: 800,
        zIndex: 99999,
        textDecoration: 'none',
        letterSpacing: '0.1em',
        border: '2px solid #111111',
        boxShadow: '3px 3px 0px #111111',
        transition: 'top 0.15s ease',
        textTransform: 'uppercase',
      }}
    >
      SKIP TO CONTENT
    </a>
  )
}
