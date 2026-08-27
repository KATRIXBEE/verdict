import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/ratings/route'
import { NextRequest } from 'next/server'

function makeRequest(body: object, ip = '1.2.3.4') {
  return new NextRequest('http://localhost:3000/api/ratings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': ip,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/ratings', () => {
  it('returns 400 for missing required fields', async () => {
    const req = makeRequest({})
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejects client-supplied digilockerVerified', async () => {
    const req = makeRequest({
      politicianId: 'test-mp',
      rating: 5,
      userName: 'Test User',
      digilockerVerified: true,
    })
    const res = await POST(req)
    const data = await res.json()
    expect(data.digilockerVerified).not.toBe(true)
  })

  it('returns 200 for valid submission', async () => {
    const uniqueIp = `192.168.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`
    const req = makeRequest({
      politicianId: 'narendra-modi-varanasi',
      rating: 5,
      userName: 'Test Voter',
    }, uniqueIp)
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('error response follows { error: { code, message } } contract', async () => {
    const req = makeRequest({ rating: 999 })
    const res = await POST(req)
    const data = await res.json()
    if (res.status !== 200) {
      expect(data).toHaveProperty('error')
      expect(data.error).toHaveProperty('code')
      expect(data.error).toHaveProperty('message')
    }
  })
})
