import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MOCK_POLITICIANS } from '@/data/mock-politicians'
import fs from 'fs'
import path from 'path'

export const revalidate = 3600 // refresh hourly

export async function GET() {
  try {
    // Get score snapshots from 7 days ago to compute change
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    let oldSnapshots: any[] = []
    let politicians: any[] = []

    try {
      const { data: sbSnapshots } = await db
        .from('score_snapshots')
        .select('politician_id, verdict_score')
        .eq('snapshot_date', sevenDaysAgoStr)
      if (sbSnapshots && sbSnapshots.length > 0) {
        oldSnapshots = sbSnapshots
      }
    } catch {
      // Supabase unavailable
    }

    // Try reading local snapshots if empty
    if (oldSnapshots.length === 0) {
      try {
        const localPath = path.join(process.cwd(), 'scripts', 'data', 'score_snapshots.json')
        if (fs.existsSync(localPath)) {
          const fileData = JSON.parse(fs.readFileSync(localPath, 'utf-8'))
          oldSnapshots = fileData.filter((s: any) => s.snapshot_date === sevenDaysAgoStr)
        }
      } catch {}
    }

    try {
      const { data: sbPoliticians } = await db
        .from('politicians')
        .select('id, name, slug, photo_url, verdict_score, current_party, constituency, criminal_case_count, worst_case_severity')
      if (sbPoliticians && sbPoliticians.length > 0) {
        politicians = sbPoliticians
      }
    } catch {
      // Supabase unavailable
    }

    // Fallback to MOCK_POLITICIANS
    if (politicians.length === 0) {
      politicians = MOCK_POLITICIANS.map(p => ({
        id: p.id,
        name: p.fullName,
        slug: p.slug,
        photo_url: p.photoUrl,
        verdict_score: p.calculatedVerdictScore,
        current_party: p.currentParty,
        constituency: p.currentConstituency?.name || '',
        criminal_case_count: p.criminalCases?.length || 0,
        worst_case_severity: p.worstCaseSeverity || 'None',
      }))
    }

    if (!politicians || politicians.length === 0) {
      return NextResponse.json({ error: 'No data' }, { status: 404 })
    }

    const oldScoreMap = new Map(
      (oldSnapshots || []).map(s => [s.politician_id, s.verdict_score])
    )

    // Calculate score change for each politician
    const withChanges = politicians.map(p => {
      const oldScore = oldScoreMap.get(p.id)
      const change = oldScore != null ? p.verdict_score - oldScore : 0
      return { ...p, score_change_7d: change }
    })

    // Get upcoming court hearings (next 3 days)
    const threeDaysOut = new Date()
    threeDaysOut.setDate(threeDaysOut.getDate() + 3)

    let upcomingCases: any[] = []
    try {
      const { data: cases } = await db
        .from('criminal_cases')
        .select('politician_id, next_hearing_date, case_number, ipc_plain_english')
        .gte('next_hearing_date', new Date().toISOString().split('T')[0])
        .lte('next_hearing_date', threeDaysOut.toISOString().split('T')[0])
        .order('next_hearing_date', { ascending: true })
        .limit(1)
      if (cases) upcomingCases = cases
    } catch {}

    // Get most recent controversy
    let recentControversy: any[] = []
    try {
      const { data: controversies } = await db
        .from('controversies')
        .select('politician_slug, title, date_reported, severity')
        .order('date_reported', { ascending: false })
        .limit(1)
      if (controversies) recentControversy = controversies
    } catch {}

    // PRIORITY LOGIC for picking today's spotlight:
    // 1. Politician with hearing in next 3 days
    // 2. Politician with biggest negative score change this week
    // 3. Politician with most recent controversy
    // 4. Fallback: deterministic daily rotation based on day-of-year

    let spotlight: any = null
    let reason = ''

    if (upcomingCases && upcomingCases.length > 0) {
      const caseInfo = upcomingCases[0]
      spotlight = withChanges.find(p => p.id === caseInfo.politician_id)
      if (spotlight) {
        reason = `Court hearing on ${caseInfo.next_hearing_date} — ${caseInfo.ipc_plain_english?.[0] || 'Case pending'}`
      }
    }

    if (!spotlight) {
      const biggestFaller = withChanges
        .filter(p => p.score_change_7d < 0)
        .sort((a, b) => a.score_change_7d - b.score_change_7d)[0]

      if (biggestFaller && biggestFaller.score_change_7d <= -1.0) {
        spotlight = biggestFaller
        const oldScore = (biggestFaller.verdict_score - biggestFaller.score_change_7d).toFixed(1)
        reason = `Score dropped from ${oldScore} to ${biggestFaller.verdict_score} this week`
      }
    }

    if (!spotlight && recentControversy && recentControversy.length > 0) {
      const c = recentControversy[0]
      spotlight = withChanges.find(p => p.slug === c.politician_slug)
      if (spotlight) {
        reason = c.title
      }
    }

    if (!spotlight) {
      // Deterministic daily rotation fallback — same politician
      // shows all day, changes at midnight, based on day-of-year
      const validPoliticians = withChanges.filter(
        p => p.photo_url && p.verdict_score != null
      )
      const pool = validPoliticians.length > 0 ? validPoliticians : withChanges
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime())
        / 86400000
      )
      spotlight = pool[dayOfYear % pool.length]
      reason = `Featured today — VERDICT Score: ${spotlight?.verdict_score}/10`
    }

    return NextResponse.json({
      spotlight,
      reason,
      generated_at: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[API_ERROR] spotlight:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 }
    )
  }
}
