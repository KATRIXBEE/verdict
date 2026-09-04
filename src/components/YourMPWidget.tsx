'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, MapPin, X, ChevronRight } from 'lucide-react'

const STATE_LIST = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh",
]

export function YourMPWidget() {
  const [myMP, setMyMP] = useState<any>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [constituencies, setConstituencies] = useState<any[]>([])
  const [selectedState, setSelectedState] = useState('')
  const [loading, setLoading] = useState(true)
  const [fetchingConsts, setFetchingConsts] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('verdict-my-mp')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Refresh their MP's current data
        fetch(`/api/politicians/${parsed.slug}`)
          .then(r => r.json())
          .then(fresh => {
            const mpData = fresh.data || fresh
            setMyMP(mpData)
            localStorage.setItem('verdict-my-mp', JSON.stringify({
              slug: mpData.slug, 
              name: mpData.fullName || mpData.name
            }))
            setLoading(false)
          })
          .catch(() => setLoading(false))
      } catch {
        setLoading(false)
      }
    } else {
      setLoading(false)
      // Try IP-based geolocation as a soft suggestion (non-blocking)
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(geo => {
          if (geo.region && STATE_LIST.includes(geo.region)) {
            setSelectedState(geo.region)
          }
        })
        .catch(() => {})
    }
  }, [])

  const loadConstituencies = async (state: string) => {
    setSelectedState(state)
    if (!state) { 
      setConstituencies([])
      return 
    }
    setFetchingConsts(true)
    try {
      const res = await fetch(
        `/api/politicians?state=${encodeURIComponent(state)}&limit=100`
      )
      const data = await res.json()
      const list = data.politicians || data.data || []
      setConstituencies(list)
    } catch {
      setConstituencies([])
    } finally {
      setFetchingConsts(false)
    }
  }

  const selectMP = (p: any) => {
    setMyMP(p)
    localStorage.setItem('verdict-my-mp', JSON.stringify({
      slug: p.slug, 
      name: p.name || p.fullName
    }))
    setShowPicker(false)
  }

  const clearMP = () => {
    localStorage.removeItem('verdict-my-mp')
    setMyMP(null)
    setShowPicker(true)
  }

  if (loading) return null

  if (!myMP && !showPicker) {
    return (
      <div 
        style={{
          background: '#001A1A', 
          border: '2px solid #00C8FF',
          padding: '16px 20px', 
          margin: '16px 0',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '16px'
        }}
        className="shadow-[4px_4px_0px_0px_#000] font-mono flex-wrap"
      >
        <div>
          <div style={{ color: '#00C8FF', fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace' }} className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#00C8FF]" />
            <span>FIND YOUR MP</span>
          </div>
          <div style={{ color: '#AAAAAA', fontSize: '11px', marginTop: 2 }}>
            See your representative&apos;s score every time you visit
          </div>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          style={{
            background: '#00C8FF', color: '#000', border: 'none',
            padding: '8px 16px', fontFamily: 'monospace', fontSize: '11px',
            fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.05em',
          }}
          className="hover:bg-white transition-colors"
        >
          SELECT MY MP
        </button>
      </div>
    )
  }

  if (showPicker) {
    return (
      <div 
        style={{
          background: '#1A1A1A', 
          border: '2px solid #00C8FF',
          padding: '16px 20px', 
          margin: '16px 0',
        }}
        className="shadow-[4px_4px_0px_0px_#000] font-mono space-y-3"
      >
        <div className="flex items-center justify-between">
          <div style={{ color: '#00C8FF', fontSize: '13px', fontWeight: 'bold' }}>
            SELECT YOUR STATE AND CONSTITUENCY
          </div>
          <button
            onClick={() => setShowPicker(false)}
            className="text-gray-400 hover:text-white p-1"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <select
          value={selectedState}
          onChange={e => loadConstituencies(e.target.value)}
          style={{
            width: '100%', padding: '8px', background: '#0D0D0D',
            border: '1px solid #2E2E2E', color: '#FFF', marginBottom: 10,
            fontFamily: 'monospace', fontSize: '12px',
          }}
        >
          <option value="">-- Choose State ({STATE_LIST.length} States &amp; UTs) --</option>
          {STATE_LIST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {fetchingConsts && (
          <div className="text-xs text-gray-400 py-2">Loading representatives...</div>
        )}

        {!fetchingConsts && constituencies.length > 0 && (
          <div style={{ maxHeight: 220, overflowY: 'auto' }} className="border border-[#2E2E2E]">
            {constituencies.map((p: any) => {
              const pName = p.name || p.fullName
              const pConst = p.constituency || p.currentConstituency?.name || 'Constituency'
              const pParty = p.current_party || p.currentParty || 'Party N/A'
              return (
                <div
                  key={p.id || p.slug}
                  onClick={() => selectMP(p)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer',
                    borderBottom: '1px solid #2E2E2E', fontSize: '12px',
                    color: '#FFF', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  className="hover:bg-[#2E2E2E] transition-colors"
                >
                  <span className="font-bold">{pName} — <span className="text-gray-300 font-normal">{pConst}</span></span>
                  <span style={{ color: '#888' }} className="text-xs flex items-center gap-1">
                    <span>{pParty}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={() => setShowPicker(false)}
          style={{
            marginTop: 10, background: 'none', border: '1px solid #555',
            color: '#888', padding: '6px 12px', fontSize: '11px', cursor: 'pointer',
          }}
          className="hover:text-white hover:border-white transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  const mpScore = Number(myMP.verdict_score ?? myMP.calculatedVerdictScore ?? myMP.verdictScore ?? 5.0)
  const scoreColor = mpScore >= 7 ? '#00C853'
    : mpScore >= 5 ? '#FFB800'
    : mpScore >= 3 ? '#FF9800' : '#FF4545'

  const mpName = myMP.fullName || myMP.name || 'Your MP'
  const mpPhoto = myMP.photo_url || myMP.photoUrl
  const mpCases = myMP.criminal_case_count ?? myMP.criminalCases?.length ?? '0'
  const mpAttendance = myMP.attendance_percent ?? myMP.attendancePercentage ?? '—'
  const mpParty = myMP.current_party || myMP.currentParty || 'Party'
  const mpConst = myMP.constituency || myMP.currentConstituency?.name || 'Constituency'

  return (
    <div 
      style={{
        background: '#001A1A', 
        border: '2px solid #00C8FF',
        padding: '16px 20px', 
        margin: '16px 0',
        display: 'flex', 
        alignItems: 'center', 
        gap: 16,
      }}
      className="shadow-[4px_4px_0px_0px_#000] font-mono flex-wrap sm:flex-nowrap"
    >
      <div style={{
        background: '#00C8FF', color: '#000', padding: '3px 8px',
        fontSize: '9px', fontFamily: 'monospace', fontWeight: 'bold',
        flexShrink: 0,
      }}>
        YOUR MP
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mpPhoto
          ? (mpPhoto.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(mpPhoto)}` : mpPhoto)
          : '/icons/icon-192x192.png'}
        alt={mpName}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/icons/icon-192x192.png'
        }}
        style={{ width: 48, height: 48, objectFit: 'cover', flexShrink: 0, border: '1px solid #00C8FF' }}
      />

      <Link href={`/politician/${myMP.slug}`} style={{ flex: 1, textDecoration: 'none' }} className="min-w-0 group">
        <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '14px' }} className="truncate group-hover:text-[#00C8FF] transition-colors">
          {mpName} ({mpParty} · {mpConst})
        </div>
        <div style={{ color: '#AAAAAA', fontSize: '11px' }}>
          {mpCases} pending cases · {mpAttendance}% attendance
        </div>
      </Link>

      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: scoreColor, fontFamily: 'monospace' }}>
          {mpScore.toFixed(1)}
        </div>
        <div style={{ fontSize: '8px', color: '#888' }}>/10</div>
      </div>

      <button
        onClick={clearMP}
        title="Change MP"
        style={{
          background: 'none', border: '1px solid #555', color: '#888',
          padding: '4px 8px', fontSize: '10px', cursor: 'pointer', flexShrink: 0,
        }}
        className="hover:text-white hover:border-white transition-colors"
      >
        Change
      </button>
    </div>
  )
}
