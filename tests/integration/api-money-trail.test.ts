import { describe, it, expect } from 'vitest';
import { GET as getScams } from '@/app/api/scams/route';
import { GET as getScamBySlug } from '@/app/api/scams/[slug]/route';
import { GET as getStats } from '@/app/api/scams/stats/route';
import { SCAM_CASES_DATA } from '@/data/mock-scams';
import { NextRequest } from 'next/server';

describe('Money Trail API & Data Integrity', () => {
  it('GET /api/scams returns all 10 verified CAG/SC cases by default', async () => {
    const req = new NextRequest('http://localhost:3000/api/scams');
    const res = await getScams(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.total).toBe(10);
    expect(json.data.length).toBe(10);
  });

  it('GET /api/scams filters by category', async () => {
    const req = new NextRequest('http://localhost:3000/api/scams?category=Infrastructure+Overpricing');
    const res = await getScams(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(1);
    expect(json.data.every((c: any) => c.category.includes('Infrastructure'))).toBe(true);
  });

  it('GET /api/scams/[slug] returns full dossier and timeline for Dwarka Expressway', async () => {
    const req = new NextRequest('http://localhost:3000/api/scams/dwarka-expressway-cost-inflation');
    const res = await getScamBySlug(req, {
      params: Promise.resolve({ slug: 'dwarka-expressway-cost-inflation' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.slug).toBe('dwarka-expressway-cost-inflation');
    expect(json.benchmark_cost_actual).toBe(250.77);
    expect(json.audit_body).toContain('CAG');
    expect(json.timeline_events.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/scams/[slug] returns 404 for invalid slug', async () => {
    const req = new NextRequest('http://localhost:3000/api/scams/non-existent-scam-slug');
    const res = await getScamBySlug(req, {
      params: Promise.resolve({ slug: 'non-existent-scam-slug' }),
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/scams/stats returns accurate aggregate metrics', async () => {
    const res = await getStats();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.total_scams).toBe(10);
    expect(json.grand_total_crore).toBeGreaterThan(400000);
    expect(json.total_amount_misused_crore).toBeGreaterThan(400000);
    expect(json.amount_recovered_crore).toBeGreaterThan(0);
  });

  it('verifies that every scam case has an official source URL and audit citation', () => {
    SCAM_CASES_DATA.forEach((scam) => {
      expect(scam.source_url).toBeDefined();
      expect(scam.source_url.length).toBeGreaterThan(5);
      expect(scam.source_name).toBeDefined();
      expect(scam.source_name.length).toBeGreaterThan(3);
      expect(scam.responsible_politicians).toBeDefined();
      expect(scam.responsible_politicians.length).toBeGreaterThan(0);
    });
  });
});
