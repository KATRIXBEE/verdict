'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Target, TrendingUp, TrendingDown, Award, AlertTriangle, Scale, ArrowLeft } from 'lucide-react'

function LeaderboardColumn({ 
  title, 
  subtitle, 
  items, 
  valueKey,
  valueSuffix, 
  valueColor, 
  showChange = false,
  icon: Icon
}: any) {
  return (
    <div 
      style={{
        background: '#1A1A1A', 
        border: '2px solid #2E2E2E',
        padding: '20px', 
        flex: 1, 
        minWidth: '280px',
      }}
      className="shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div style={{
            fontFamily: 'monospace', fontSize: '13px', color: valueColor,
            fontWeight: 'bold', letterSpacing: '0.08em',
          }} className="flex items-center gap-1.5">
            {Icon && <Icon className="w-4 h-4" style={{ color: valueColor }} />}
            <span>{title}</span>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#888888', marginBottom: 16 }}>
          {subtitle}
        </div>

        {(!items || items.length === 0) && (
          <div style={{ color: '#666', fontSize: '12px', padding: '32px 0', textAlign: 'center', fontFamily: 'monospace' }}>
            No data yet — check back after 7 days of tracking
          </div>
        )}

        {items?.map((p: any, i: number) => {
          const val = p[valueKey]
          const displayVal = val != null ? `${showChange && val > 0 ? '+' : ''}${val}${valueSuffix || ''}` : '—'
          return (
            <Link key={p.id || p.slug || i} href={`/politician/${p.slug}`}
              style={{ textDecoration: 'none' }} className="group block">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid #2E2E2E',
              }}>
                <div style={{
                  color: '#777', fontFamily: 'monospace', fontSize: '14px',
                  fontWeight: 'bold', width: 24, flexShrink: 0,
                }}>
                  #{i + 1}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.photo_url
                    ? (p.photo_url.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(p.photo_url)}` : p.photo_url)
                    : '/icons/icon-192x192.png'}
                  alt={p.name || 'Politician'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icons/icon-192x192.png'
                  }}
                  style={{ width: 36, height: 36, objectFit: 'cover', flexShrink: 0, border: '1px solid #333' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: '#FFFFFF', fontSize: '13px', fontWeight: 'bold',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }} className="group-hover:text-[#FFD028] transition-colors">
                    {p.name}
                  </div>
                  <div style={{ color: '#888', fontSize: '11px' }} className="truncate">
                    {p.current_party} · {p.constituency}
                  </div>
                </div>
                <div style={{
                  color: valueColor, fontFamily: 'monospace',
                  fontWeight: 'bold', fontSize: '15px', flexShrink: 0,
                }}>
                  {displayVal}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500 font-mono">
        <div className="inline-block p-4 border-2 border-ink bg-surface shadow-hard-md">
          <Scale className="w-8 h-8 animate-spin mx-auto text-brand-red mb-2" />
          <p className="font-bold">CALCULATING VERDICT LEADERBOARD...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 font-mono space-y-6">
      {/* Header */}
      <div className="border-3 border-ink bg-[#111111] text-[#F5F3EF] p-6 sm:p-8 shadow-hard-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center space-x-2 bg-brand-red text-white px-3 py-1 text-xs font-black uppercase shadow-hard-xs">
            <Target className="w-4 h-4" />
            <span>CIVIC ACCOUNTABILITY RANKINGS</span>
          </div>
          <Link 
            href="/" 
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-brand-yellow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO DIRECTORY</span>
          </Link>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
          MOST WANTED — WEEKLY LEADERBOARD
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Rankings refresh weekly · Week ending {data?.week_ending || new Date().toISOString().split('T')[0]}
        </p>
      </div>

      {!data?.has_change_data && (
        <div style={{
          background: '#1A1500', 
          border: '2px solid #FFD028',
          padding: 16, 
          fontSize: 13, 
          color: '#FFD028',
        }} className="shadow-hard-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-brand-yellow" />
          <div>
            <strong>Score change tracking initialized:</strong> &ldquo;Biggest Fallers&rdquo; and
            &ldquo;Biggest Risers&rdquo; will populate automatically as 7+ days of daily snapshots are accumulated.
          </div>
        </div>
      )}

      {/* Row 1: Top & Bottom Scorers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LeaderboardColumn
          title="TOP SCORERS" 
          subtitle="Highest VERDICT Score this week (Minimum criminal cases & high attendance)"
          items={data?.top_scorers} 
          valueKey="verdict_score"
          valueSuffix="/10" 
          valueColor="#00C853"
          icon={Award}
        />
        <LeaderboardColumn
          title="BOTTOM SCORERS" 
          subtitle="Lowest VERDICT Score this week (Severe IPC cases, low attendance, rapid asset spikes)"
          items={data?.bottom_scorers} 
          valueKey="verdict_score"
          valueSuffix="/10" 
          valueColor="#FF4545"
          icon={AlertTriangle}
        />
      </div>

      {/* Row 2: Biggest Fallers & Risers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LeaderboardColumn
          title="BIGGEST FALLERS" 
          subtitle="Largest negative score drop in the past 7 days"
          items={data?.biggest_fallers} 
          valueKey="score_change_7d"
          valueSuffix=" pts" 
          valueColor="#FF4545" 
          showChange
          icon={TrendingDown}
        />
        <LeaderboardColumn
          title="BIGGEST RISERS" 
          subtitle="Largest positive score gain in the past 7 days"
          items={data?.biggest_risers} 
          valueKey="score_change_7d"
          valueSuffix=" pts" 
          valueColor="#00C853" 
          showChange
          icon={TrendingUp}
        />
      </div>
    </div>
  )
}
