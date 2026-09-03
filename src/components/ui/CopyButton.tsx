'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useToast } from './Toast'

interface CopyButtonProps {
  text: string
  label?: string
  successLabel?: string
  className?: string
}

export function CopyButton({
  text,
  label = 'Copy Link',
  successLabel = 'Copied!',
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for older browsers / non-HTTPS
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      } catch {
        showToast('Could not copy. Please copy the URL manually.', 'error')
        return
      }
    }
    setCopied(true)
    showToast('Link copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`brutal-btn-press inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink text-xs font-mono font-bold uppercase tracking-wider transition-all ${
        copied
          ? 'bg-brand-green text-black'
          : 'bg-surface text-ink hover:bg-surface-muted'
      } ${className}`}
      style={{ boxShadow: '2px 2px 0px #111111' }}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
      ) : (
        <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
      )}
      {copied ? successLabel : label}
    </button>
  )
}
