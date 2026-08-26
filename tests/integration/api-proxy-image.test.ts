import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/proxy-image/route'
import { NextRequest } from 'next/server'

describe('GET /api/proxy-image — SSRF protection', () => {
  it('returns fallback svg for requests without url param', async () => {
    const req = new NextRequest('http://localhost:3000/api/proxy-image')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
    const text = await res.text()
    expect(text).toContain('PHOTO PENDING')
  })

  it('rejects non-whitelisted domains by serving safe fallback SVG', async () => {
    const maliciousUrl = encodeURIComponent('https://attackerwikipedia.org/img.jpg')
    const req = new NextRequest(
      `http://localhost:3000/api/proxy-image?url=${maliciousUrl}`
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
    const text = await res.text()
    expect(text).toContain('PHOTO PENDING')
  })

  it('rejects HTTP (non-HTTPS) URLs by serving safe fallback SVG', async () => {
    const httpUrl = encodeURIComponent('http://upload.wikimedia.org/img.jpg')
    const req = new NextRequest(
      `http://localhost:3000/api/proxy-image?url=${httpUrl}`
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
    const text = await res.text()
    expect(text).toContain('PHOTO PENDING')
  })

  it('rejects domains that end-match but are not exact (SSRF bypass)', async () => {
    const bypassUrl = encodeURIComponent('https://evilsansad.in/img.jpg')
    const req = new NextRequest(
      `http://localhost:3000/api/proxy-image?url=${bypassUrl}`
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
    const text = await res.text()
    expect(text).toContain('PHOTO PENDING')
  })
})
