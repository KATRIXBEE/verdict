import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/search/route'
import { NextRequest } from 'next/server'

describe('GET /api/search', () => {
  it('returns empty array for queries under 2 characters', async () => {
    const req = new NextRequest('http://localhost:3000/api/search?q=a')
    const res = await GET(req)
    const data = await res.json()
    expect(data.results || data.data).toEqual([])
  })

  it('returns empty for blank query without returning all records', async () => {
    const req = new NextRequest('http://localhost:3000/api/search?q=')
    const res = await GET(req)
    const data = await res.json()
    const results = data.results || data.data || []
    expect(results.length).toBe(0)
  })

  it('returns results for valid query', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/search?q=Modi'
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    const results = data.results || data.data || []
    expect(Array.isArray(results)).toBe(true)
  })
})
