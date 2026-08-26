import { NextResponse } from 'next/server'
import { checkDbHealth } from '@/lib/db'
import os from 'os'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  timestamp: string
  uptime_seconds: number
  environment: string
  checks: {
    database: {
      status: 'connected' | 'disconnected' | 'not_configured'
      provider: string
      region: string
      latency_ms: number | null
      politician_count: number | null
    }
    memory: {
      rss_mb: number
      heap_used_mb: number
      heap_total_mb: number
      external_mb: number
    }
    system: {
      platform: string
      node_version: string
      cpu_count: number
      load_average: number[]
    }
    storage: {
      ratings_file_accessible: boolean
    }
  }
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const memUsage = process.memoryUsage()

  // 1. Check live database connectivity
  const dbHealth = await checkDbHealth()

  // 2. Check local fallback storage accessibility
  let ratingsFileAccessible = false
  try {
    const ratingsPath = path.join(
      process.cwd(),
      'scripts',
      'data',
      'citizen_ratings.json'
    )
    if (fs.existsSync(ratingsPath)) {
      fs.accessSync(ratingsPath, fs.constants.R_OK | fs.constants.W_OK)
      ratingsFileAccessible = true
    } else {
      const dir = path.dirname(ratingsPath)
      fs.mkdirSync(dir, { recursive: true })
      ratingsFileAccessible = true
    }
  } catch {
    ratingsFileAccessible = false
  }

  const dbStatus = dbHealth.connected
    ? 'connected'
    : process.env.NEXT_PUBLIC_SUPABASE_URL
    ? 'disconnected'
    : 'not_configured'

  const overallStatus: 'healthy' | 'degraded' | 'unhealthy' =
    !ratingsFileAccessible && dbStatus === 'disconnected'
      ? 'unhealthy'
      : dbStatus === 'disconnected'
      ? 'degraded'
      : 'healthy'

  const response: HealthResponse = {
    status: overallStatus,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: dbStatus,
        provider: 'Supabase PostgreSQL',
        region: 'ap-northeast-2 (Seoul)',
        latency_ms: dbHealth.latencyMs,
        politician_count: dbHealth.politicianCount,
      },
      memory: {
        rss_mb: Math.round(memUsage.rss / 1024 / 1024),
        heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
        external_mb: Math.round(memUsage.external / 1024 / 1024),
      },
      system: {
        platform: os.platform(),
        node_version: process.version,
        cpu_count: os.cpus().length,
        load_average: os.loadavg(),
      },
      storage: {
        ratings_file_accessible: ratingsFileAccessible,
      },
    },
  }

  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  })
}
