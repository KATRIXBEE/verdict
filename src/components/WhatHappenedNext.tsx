'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Scale, 
  ArrowRight, 
  Megaphone,
  CheckCircle,
  ExternalLink
} from 'lucide-react'

export interface UnsolvedStory {
  id: string
  slug?: string
  title: string
  summary: string
  source_name: string
  source_url: string
  category?: string
  unsolved_status: 'under_investigation' | 'chargesheeted' | 'hearing_scheduled' | 'no_action_taken' | 'closed'
  days_since_first_reported: number
  last_checked_at?: string
  case_reference?: string
  demands_count: number
}

interface WhatHappenedNextProps {
  storyId?: string
  compact?: boolean
}

export function WhatHappenedNext({ storyId, compact = false }: WhatHappenedNextProps) {
  const [stories, setStories] = useState<UnsolvedStory[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [demandedIds, setDemandedIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let url = '/api/ground-truth/unsolved'
    if (statusFilter !== 'ALL') {
      url += `?status=${statusFilter}`
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStories(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [statusFilter])

  const handleDemandUpdate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (demandedIds[id]) return

    setDemandedIds((prev) => ({ ...prev, [id]: true }))
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, demands_count: s.demands_count + 1 } : s))
    )

    try {
      await fetch('/api/ground-truth/unsolved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: id }),
      })
    } catch {
      // Optimistic update retained locally
    }
  }

  const getStatusBadge = (status: UnsolvedStory['unsolved_status']) => {
    switch (status) {
      case 'no_action_taken':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase bg-[#2A0808] text-[#FF4545] border border-[#FF4545] shadow-[2px_2px_0px_#FF4545]">
            <span className="w-2 h-2 rounded-full bg-[#FF4545] animate-pulse" />
            NO ACTION TAKEN
          </span>
        )
      case 'under_investigation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase bg-[#2E2405] text-[#FFD700] border border-[#FFD700] shadow-[2px_2px_0px_#FFD700]">
            <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
            UNDER INVESTIGATION
          </span>
        )
      case 'chargesheeted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase bg-[#08182B] text-[#00E5FF] border border-[#00E5FF] shadow-[2px_2px_0px_#00E5FF]">
            <FileText className="w-3 h-3 text-[#00E5FF]" />
            CHARGESHEET FILED
          </span>
        )
      case 'hearing_scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase bg-[#092212] text-[#00E676] border border-[#00E676] shadow-[2px_2px_0px_#00E676]">
            <Scale className="w-3 h-3 text-[#00E676]" />
            HEARING SCHEDULED
          </span>
        )
      case 'closed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase bg-[#1F1F1F] text-gray-400 border border-gray-600">
            <CheckCircle className="w-3 h-3" />
            CASE RESOLVED / CLOSED
          </span>
        )
    }
  }

  // Mini / Compact mode for single story page
  if (compact || storyId) {
    const singleStory = stories.find((s) => s.id === storyId || s.slug === storyId)
    const status = singleStory?.unsolved_status || 'under_investigation'
    const days = singleStory?.days_since_first_reported || 35
    const caseRef = singleStory?.case_reference || 'OFFICIAL DOCKET PENDING'
    const demands = singleStory?.demands_count || 320
    const hasDemanded = storyId ? demandedIds[storyId] : false

    return (
      <div className="bg-[#141414] border-2 border-[#FF4545] p-5 shadow-[4px_4px_0px_#000] font-mono space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2E2E2E] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FF4545]" />
            <span className="font-display font-black text-sm uppercase tracking-wide text-white">
              WHAT HAPPENED NEXT: POST-INVESTIGATION DOCKET
            </span>
          </div>
          {getStatusBadge(status)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-3">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">CASE DURATION</span>
            <span className="font-display font-black text-lg text-white">DAY {days}</span>
            <span className="text-[10px] text-gray-500 block">since public disclosure</span>
          </div>

          <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-3">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">FORMAL REFERENCE</span>
            <span className="font-bold text-xs text-[#00E5FF] truncate block mt-1">{caseRef}</span>
            <span className="text-[10px] text-gray-500 block">Judicial / Police Record</span>
          </div>

          <div className="bg-[#1C1C1C] border border-[#2E2E2E] p-3">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">CITIZEN PRESSURE</span>
            <span className="font-display font-black text-lg text-[#FFD700]">{demands.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-gray-500 block">demands for prosecution</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-gray-300">
            {status === 'no_action_taken' && '⚠️ Authorities have taken zero punitive action despite statutory deadlines.'}
            {status === 'under_investigation' && '🔍 Departmental enquiry initiated. Preliminary chargesheet pending.'}
            {status === 'chargesheeted' && '⚖️ Chargesheet officially registered in special magistrate court.'}
            {status === 'hearing_scheduled' && '🏛️ Next hearing date fixed before designated judicial bench.'}
          </p>

          <button
            onClick={(e) => storyId && handleDemandUpdate(storyId, e)}
            disabled={hasDemanded}
            className={`shrink-0 px-4 py-2 border-2 border-black font-display font-black text-xs uppercase transition-all shadow-[2px_2px_0px_#000] ${
              hasDemanded
                ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                : 'bg-[#FF4545] text-white hover:bg-[#FFD700] hover:text-black cursor-pointer'
            }`}
          >
            {hasDemanded ? '✓ DEMAND REGISTERED' : `DEMAND UPDATE (${demands})`}
          </button>
        </div>
      </div>
    )
  }

  // Full Tracker on Ground Truth Landing Page
  const filterTabs = [
    { key: 'ALL', label: 'ALL TRACKED CASES' },
    { key: 'no_action_taken', label: '🔴 NO ACTION TAKEN' },
    { key: 'under_investigation', label: '🟡 UNDER INVESTIGATION' },
    { key: 'chargesheeted', label: '🔵 CHARGESHEET FILED' },
    { key: 'hearing_scheduled', label: '🟢 HEARING SCHEDULED' },
  ]

  return (
    <section className="bg-[#111111] border-3 border-ink p-5 sm:p-7 shadow-hard-xl space-y-5 font-mono text-[#F5F3EF]">
      {/* Tracker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-[#2E2E2E] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-[#FF4545] text-white px-2.5 py-0.5 border border-ink text-xs font-black uppercase shadow-hard-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>ACCOUNTABILITY MONITOR</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
            WHAT HAPPENED NEXT? <span className="text-[#FFD700]">UNSOLVED CASE TRACKER</span>
          </h2>
          <p className="text-xs text-gray-400 font-semibold max-w-2xl">
            When headlines fade, corruption thrives. VERDICT tracks the judicial and administrative outcomes of investigative reports until a final verdict is delivered.
          </p>
        </div>

        <div className="bg-[#1C1C1C] border-2 border-black p-3 text-right shrink-0">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">TRACKED CASES</span>
          <span className="font-display font-black text-2xl text-[#00E5FF]">{stories.length} ACTIVE</span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-bold border-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF4545] text-white border-black shadow-hard-xs -translate-y-0.5 font-black'
                  : 'bg-[#1C1C1C] text-gray-300 border-[#333] hover:border-white hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-[#1C1C1C] border border-[#2E2E2E] animate-pulse" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-[#181818] border border-[#333] p-8 text-center text-gray-400 text-xs">
          No tracked cases currently match this status filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {stories.slice(0, 6).map((story) => {
            const hasDemanded = demandedIds[story.id]
            const isNoAction = story.unsolved_status === 'no_action_taken'

            return (
              <div
                key={story.id}
                className={`bg-[#181818] border-2 p-4 flex flex-col justify-between space-y-3 transition-all ${
                  isNoAction
                    ? 'border-[#FF4545]/70 shadow-[3px_3px_0px_#FF4545]'
                    : 'border-[#333] shadow-[3px_3px_0px_#000] hover:border-gray-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-[#2A2A2A] pb-2">
                    {getStatusBadge(story.unsolved_status)}
                    <span className="text-[10px] font-black text-gray-400">
                      DAY {story.days_since_first_reported}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-sm uppercase text-white leading-snug line-clamp-2">
                    {story.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {story.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 bg-[#121212] p-2 border border-[#252525]">
                    <span className="truncate">Ref: <strong className="text-gray-200">{story.case_reference || 'PENDING'}</strong></span>
                    <span className="text-[#FFD700] shrink-0">{story.source_name}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => handleDemandUpdate(story.id, e)}
                    disabled={hasDemanded}
                    className={`px-2.5 py-1.5 text-[11px] font-black border uppercase transition-all flex items-center gap-1.5 ${
                      hasDemanded
                        ? 'bg-gray-800 text-gray-400 border-gray-700 cursor-not-allowed'
                        : 'bg-[#FF4545] text-white border-black hover:bg-[#FFD700] hover:text-black cursor-pointer shadow-hard-xs'
                    }`}
                  >
                    <Megaphone className="w-3 h-3" />
                    <span>{hasDemanded ? 'DEMANDED' : `DEMAND (${story.demands_count})`}</span>
                  </button>

                  <Link
                    href={story.slug ? `/ground-truth/${story.slug}` : (story.source_url || '#')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    <span>DETAILS</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
