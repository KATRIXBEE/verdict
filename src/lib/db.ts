import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ksdqughrmrburubgbtba.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZHF1Z2hybXJidXJ1YmdidGJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2ODU3MzcsImV4cCI6MjEwMzI2MTczN30.JKHDQr-_7k_xUKStjJJ_bk06GjT7DAEAtZZ6-VmCzSU'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZHF1Z2hybXJidXJ1YmdidGJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY4NTczNywiZXhwIjoyMTAzMjYxNzM3fQ.egQKQ3mCJR_iup3nuJhTkrRC6J9oviTggQ_h0i9U6pE'

// Server-side client — full access, bypasses RLS
// ONLY use in API routes (server-side), never in client components
export const db = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { persistSession: false },
  db: { schema: 'public' },
})

// Client-side client — limited anon access, respects RLS
// Use in React components and client-side code
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database health check used by /api/health endpoint
export async function checkDbHealth(): Promise<{
  connected: boolean
  latencyMs: number | null
  politicianCount: number | null
}> {
  const start = Date.now()
  try {
    const { error, count } = await db
      .from('politicians')
      .select('id', { count: 'exact', head: true })

    if (error) {
      console.warn('[DB] Supabase ping returned error:', error.message)
      return { connected: false, latencyMs: null, politicianCount: null }
    }

    return {
      connected: true,
      latencyMs: Date.now() - start,
      politicianCount: count ?? 0,
    }
  } catch (err) {
    console.warn('[DB] Health check exception:', err)
    return { connected: false, latencyMs: null, politicianCount: null }
  }
}
