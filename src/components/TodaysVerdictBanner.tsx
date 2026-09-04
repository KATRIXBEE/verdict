'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function TodaysVerdictBanner() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/spotlight')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div 
        aria-label="Loading Today's Verdict"
        className="w-full bg-[#1A1A1A] border border-[#2E2E2E] h-[120px] my-4 animate-pulse" 
      />
    )
  }

  if (!data?.spotlight) return null

  const p = data.spotlight
  const score = Number(p.verdict_score ?? 5.0)
  const scoreColor = score >= 7 ? '#00C853'
    : score >= 5 ? '#FFB800'
    : score >= 3 ? '#FF9800'
    : '#FF4545'

  return (
    <Link
      href={`/politician/${p.slug}`}
      className="block no-underline group"
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, #1A0000 0%, #1A1A1A 100%)',
          border: '2px solid #FF4545',
          padding: '20px 24px',
          margin: '16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          cursor: 'pointer',
        }}
        className="shadow-[4px_4px_0px_0px_#000] hover:border-[#FFD028] transition-colors"
      >
        <div style={{
          background: '#FF4545', color: '#FFFFFF',
          padding: '4px 10px', fontSize: '10px',
          fontFamily: 'monospace', fontWeight: 'bold',
          letterSpacing: '0.1em', flexShrink: 0,
          writingMode: 'horizontal-tb',
        }}>
          TODAY&apos;S VERDICT
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.photo_url
            ? (p.photo_url.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(p.photo_url)}` : p.photo_url)
            : '/images/default-politician.svg'}
          alt={p.name || 'Politician'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/icon-192x192.png'
          }}
          style={{
            width: 64, height: 64, objectFit: 'cover',
            border: '2px solid #FF4545', flexShrink: 0,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: '#FFFFFF', fontSize: '18px', fontWeight: 'bold',
            fontFamily: 'monospace',
          }} className="truncate">
            {p.name}
          </div>
          <div style={{ color: '#AAAAAA', fontSize: '12px', marginBottom: 4 }}>
            {p.current_party || 'Party N/A'} · {p.constituency || 'Constituency N/A'}
          </div>
          <div style={{
            color: '#FFD028', fontSize: '13px',
            fontFamily: 'monospace',
          }} className="line-clamp-1">
            {data.reason}
          </div>
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            fontSize: '32px', fontWeight: 'bold', color: scoreColor,
            fontFamily: 'monospace',
          }}>
            {score.toFixed(1)}
          </div>
          <div style={{ fontSize: '9px', color: '#888888' }}>/ 10</div>
        </div>
      </div>
    </Link>
  )
}
