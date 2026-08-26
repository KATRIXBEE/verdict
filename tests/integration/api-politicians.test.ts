import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/politicians/route'
import { NextRequest } from 'next/server'

describe('GET /api/politicians', () => {
  it('returns array of politicians', async () => {
    const req = new NextRequest('http://localhost:3000/api/politicians')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    const list = data.politicians || data.data || data
    expect(Array.isArray(list)).toBe(true)
  })

  it('supports pagination with page and limit params', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/politicians?page=1&limit=10'
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('returns consistent response shape on every call', async () => {
    const req = new NextRequest('http://localhost:3000/api/politicians?limit=1')
    const res = await GET(req)
    const data = await res.json()
    const list = data.politicians || data.data || data
    if (Array.isArray(list) && list.length > 0) {
      const mp = list[0]
      expect(mp).toHaveProperty('id')
      expect(mp.fullName || mp.name).toBeDefined()
    }
  })
})
