import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MOCK_POLITICIANS } from '@/data/mock-politicians'
import fs from 'fs'
import path from 'path'

export const revalidate = 3600

export async function GET() {
  try {
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
    } catch {}

    // Check local snapshot file if empty
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
        .select('id, name, slug, photo_url, verdict_score, current_party, constituency, criminal_case_count')
        .not('verdict_score', 'is', null)
      if (sbPoliticians && sbPoliticians.length > 0) {
        politicians = sbPoliticians
      }
    } catch {}

    // Fallback to MOCK_POLITICIANS if Supabase has no data
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
      }))
    }

    if (!politicians || politicians.length === 0) {
      return NextResponse.json({ error: 'No data' }, { status: 404 })
    }

    const oldScoreMap = new Map(
      (oldSnapshots || []).map(s => [s.politician_id, s.verdict_score])
    )

    const withChanges = politicians
      .map(p => {
        const oldScore = oldScoreMap.get(p.id)
        const change = oldScore != null
          ? Math.round((p.verdict_score - oldScore) * 10) / 10
          : null
        return { ...p, score_change_7d: change }
      })

    const topScorers = [...politicians]
      .sort((a, b) => b.verdict_score - a.verdict_score)
      .slice(0, 5)

    const bottomScorers = [...politicians]
      .sort((a, b) => a.verdict_score - b.verdict_score)
      .slice(0, 5)

    const withRealChange = withChanges.filter(p => p.score_change_7d !== null)

    const biggestFallers = [...withRealChange]
      .filter(p => p.score_change_7d! < 0)
      .sort((a, b) => a.score_change_7d! - b.score_change_7d!)
      .slice(0, 5)

    const biggestRisers = [...withRealChange]
      .filter(p => p.score_change_7d! > 0)
      .sort((a, b) => b.score_change_7d! - a.score_change_7d!)
      .slice(0, 5)

    return NextResponse.json({
      week_ending: new Date().toISOString().split('T')[0],
      top_scorers: topScorers,
      bottom_scorers: bottomScorers,
      biggest_fallers: biggestFallers,
      biggest_risers: biggestRisers,
      has_change_data: withRealChange.length > 0,
    })

  } catch (error) {
    console.error('[API_ERROR] leaderboard:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' } },
      { status: 500 }
    )
  }
}
