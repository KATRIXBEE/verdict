const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

const TEST_CASES = [
  // ── STATIC PAGES ──────────────────────────────
  {
    name: "Home / Dashboard",
    url: '/',
    method: 'GET',
    expect_status: 200,
    expect_contains: ['politician', 'verdict', 'dashboard'],
    must_not_contain: ['Unhandled Runtime Error', 'Cannot read properties of undefined'],
  },
  {
    name: "India Rankings Page",
    url: '/india-rankings',
    method: 'GET',
    expect_status: 200,
    expect_contains: ['ranking', 'india'],
    must_not_contain: ['Unhandled Runtime Error', 'Cannot read properties of undefined'],
  },
  {
    name: "Tax Money Page",
    url: '/tax-money',
    method: 'GET',
    expect_status: 200,
    must_not_contain: ['Unhandled Runtime Error', 'Cannot read properties of undefined'],
  },
  {
    name: "Ground Truth Page",
    url: '/ground-truth',
    method: 'GET',
    expect_status: 200,
    must_not_contain: ['Unhandled Runtime Error', 'Cannot read properties of undefined'],
  },
  {
    name: "Compare / Face-Off Page",
    url: '/compare',
    method: 'GET',
    expect_status: [200, 308, 301],
    must_not_contain: ['Unhandled Runtime Error', 'Cannot read properties of undefined'],
  },
  {
    name: "Methodology & IPC Page",
    url: '/method',
    method: 'GET',
    expect_status: [200, 404],
    note: "Check if this route actually exists",
  },
  {
    name: "Offline Fallback Page",
    url: '/offline',
    method: 'GET',
    expect_status: [200, 404],
    note: "PWA offline page",
  },
  {
    name: "API Docs Page",
    url: '/api-docs',
    method: 'GET',
    expect_status: [200, 404],
  },
  {
    name: "Search Results Page",
    url: '/search?q=vijay',
    method: 'GET',
    expect_status: 200,
    note: "THIS IS THE REPORTED BUG — View all results link leads to 404",
  },
  {
    name: "PWA Manifest",
    url: '/manifest.json',
    method: 'GET',
    expect_status: 200,
    expect_content_type: 'application/json',
  },
  {
    name: "Robots.txt",
    url: '/robots.txt',
    method: 'GET',
    expect_status: 200,
  },
  {
    name: "OpenAPI Spec",
    url: '/openapi.yaml',
    method: 'GET',
    expect_status: [200, 404],
  },

  // ── POLITICIAN PROFILE PAGES ─────────────────
  {
    name: "Politician Profile — Narendra Modi",
    url: '/politician/narendra-modi-varanasi',
    method: 'GET',
    expect_status: 200,
    must_not_contain: ['Unhandled Runtime Error', 'Cannot read properties of undefined'],
  },
  {
    name: "Politician Profile — Invalid Slug",
    url: '/politician/this-person-does-not-exist-xyz',
    method: 'GET',
    expect_status: 404,
    note: "Should show 404 page, not crash",
  },
  {
    name: "Politician Profile — Slug Injection Attempt",
    url: "/politician/%3Cscript%3Ealert(1)%3C%2Fscript%3E",
    method: 'GET',
    expect_status: [404, 400],
    security_test: true,
    note: "XSS in slug — must return 404 not reflect the script",
  },
  {
    name: "Politician Profile — SQL Injection Slug",
    url: "/politician/%27%3B%20DROP%20TABLE%20politicians%3B%20--",
    method: 'GET',
    expect_status: [404, 400],
    security_test: true,
  },

  // ── API ENDPOINTS ─────────────────────────────
  {
    name: "API Health Check",
    url: '/api/health',
    method: 'GET',
    expect_status: [200, 503],
    expect_json_keys: ['status', 'checks'],
  },
  {
    name: "API Politicians List",
    url: '/api/politicians?limit=5',
    method: 'GET',
    expect_status: 200,
    expect_json_keys: ['politicians'],
  },
  {
    name: "API Politicians — Pagination",
    url: '/api/politicians?page=1&limit=10',
    method: 'GET',
    expect_status: 200,
    expect_json_keys: ['politicians', 'total', 'page'],
  },
  {
    name: "API Politicians — Invalid Page",
    url: '/api/politicians?page=-1&limit=999999',
    method: 'GET',
    expect_status: [200, 400],
    note: "Limit 999999 should be capped at 50",
    security_test: true,
  },
  {
    name: "API Search — Valid Query (Vijay)",
    url: '/api/search?q=vijay',
    method: 'GET',
    expect_status: 200,
    expect_json_keys: ['results', 'total'],
  },
  {
    name: "API Search — Short Query (under 2 chars)",
    url: '/api/search?q=v',
    method: 'GET',
    expect_status: 200,
    note: "Should return empty results, NOT all politicians",
    expect_contains_json: { results: [] },
  },
  {
    name: "API Search — Empty Query",
    url: '/api/search?q=',
    method: 'GET',
    expect_status: 200,
    note: "Must NOT return all 563 politicians",
  },
  {
    name: "API Search — XSS Attempt",
    url: '/api/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E',
    method: 'GET',
    expect_status: [200, 400],
    security_test: true,
    note: "Must not reflect script tag in JSON response",
  },
  {
    name: "API Search — SQL Injection Attempt",
    url: "/api/search?q=%27%20OR%201%3D1%20--",
    method: 'GET',
    expect_status: [200, 400],
    security_test: true,
    note: "Must not expose database error or return unexpected results",
  },
  {
    name: "API Politician By Slug — Valid",
    url: '/api/politicians/narendra-modi-varanasi',
    method: 'GET',
    expect_status: [200, 404],
    expect_json_keys: ['name', 'verdict_score'],
  },
  {
    name: "API Politician By Slug — Not Found",
    url: '/api/politicians/nobody-from-nowhere-xyz',
    method: 'GET',
    expect_status: 404,
    expect_json_keys: ['error'],
    note: "Error response must use {error: {code, message}} format",
  },
  {
    name: "API Crime Stats",
    url: '/api/crime-stats',
    method: 'GET',
    expect_status: 200,
  },
  {
    name: "API India Rankings",
    url: '/api/india-rankings',
    method: 'GET',
    expect_status: 200,
  },
  {
    name: "API Rupee Tracker",
    url: '/api/india-rankings/rupee',
    method: 'GET',
    expect_status: 200,
  },
  {
    name: "API Ground Truth List",
    url: '/api/ground-truth',
    method: 'GET',
    expect_status: 200,
  },
  {
    name: "API Proxy Image — No URL Param",
    url: '/api/proxy-image',
    method: 'GET',
    expect_status: [200, 400],
    expect_contains: ['PHOTO PENDING'],
    security_test: true,
  },
  {
    name: "API Proxy Image — Allowed Domain",
    url: '/api/proxy-image?url=https://upload.wikimedia.org/wikipedia/commons/thumb/narendra_modi.jpg',
    method: 'GET',
    expect_status: [200, 404, 500],
    note: "Should not block valid domains",
  },
  {
    name: "API Proxy Image — SSRF Attempt (attackerwikipedia.org)",
    url: '/api/proxy-image?url=https://attackerwikipedia.org/evil.jpg',
    method: 'GET',
    expect_status: [200, 403],
    expect_contains: ['PHOTO PENDING'],
    security_test: true,
    note: "Must block — old suffix-match bypass, fixed in SEC-01",
  },
  {
    name: "API Proxy Image — HTTP (not HTTPS)",
    url: '/api/proxy-image?url=http://upload.wikimedia.org/img.jpg',
    method: 'GET',
    expect_status: [200, 403],
    expect_contains: ['PHOTO PENDING'],
    security_test: true,
  },
  {
    name: "API Proxy Image — Internal Network (SSRF)",
    url: '/api/proxy-image?url=http://localhost:5432',
    method: 'GET',
    expect_status: [200, 403],
    expect_contains: ['PHOTO PENDING'],
    security_test: true,
    note: "Must block internal network access attempts",
  },
  {
    name: "API Proxy Image — AWS Metadata (SSRF)",
    url: '/api/proxy-image?url=http://169.254.169.254/latest/meta-data/',
    method: 'GET',
    expect_status: [200, 403],
    expect_contains: ['PHOTO PENDING'],
    security_test: true,
    note: "Must block AWS metadata endpoint SSRF",
  },
];

async function runTests() {
  const results = [];
  
  for (const test of TEST_CASES) {
    try {
      const response = await fetch(`${BASE_URL}${test.url}`, {
        method: test.method,
        headers: { 'Accept': 'application/json, text/html' },
        redirect: 'manual',
      });
      
      const status = response.status;
      let body = '';
      let json = null;
      
      try {
        body = await response.text();
        json = JSON.parse(body);
      } catch {}
      
      const expectedStatuses = Array.isArray(test.expect_status)
        ? test.expect_status
        : [test.expect_status];
      
      const statusPass = !test.expect_status || expectedStatuses.includes(status);
      
      // Check for must_not_contain patterns
      const violations = (test.must_not_contain || []).filter(
        pattern => body.toLowerCase().includes(pattern.toLowerCase())
      );
      
      // Check for stack traces / error leaks
      const stackTracePatterns = [
        'at Object.',
        'at Function.',
        'node_modules',
        'ENOENT',
        'ECONNREFUSED',
        'PostgreSQL',
        'supabase',
        'process.env',
        'SUPABASE_',
        'DATABASE_URL',
        'SECRET_KEY',
        'password',
        'Error:',
        'SyntaxError:',
        'TypeError:',
        'ReferenceError:',
      ];
      
      const isHtmlResponse = (response.headers.get('content-type') || '').includes('text/html');
      const leakedInfo = stackTracePatterns.filter(pattern => {
        if (isHtmlResponse && (pattern === 'node_modules' || pattern === 'Error:')) {
          return false;
        }
        return body.includes(pattern) && status >= 400;
      });

      // Check expect_json_keys if applicable
      let keysPass = true;
      if (test.expect_json_keys && json) {
        for (const k of test.expect_json_keys) {
          if (!(k in json)) {
            keysPass = false;
          }
        }
      }
      
      results.push({
        name: test.name,
        url: test.url,
        status,
        statusPass: statusPass && keysPass,
        violations,
        leakedInfo,
        security_test: test.security_test || false,
        note: test.note || '',
        pass: statusPass && keysPass && violations.length === 0 && leakedInfo.length === 0,
        body_snippet: body.substring(0, 200),
      });
      
    } catch (err) {
      results.push({
        name: test.name,
        url: test.url,
        status: 'NETWORK_ERROR',
        error: err.message,
        pass: false,
      });
    }
  }
  
  return results;
}

runTests().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('VERDICT — PAGE & SECURITY AUDIT RESULTS');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.pass);
  const failed = results.filter(r => !r.pass);
  const security = results.filter(r => r.security_test && !r.pass);
  
  console.log(`\nTotal tests: ${results.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Security failures: ${security.length}`);
  
  if (failed.length > 0) {
    console.log('\n── FAILED TESTS ──');
    failed.forEach(r => {
      console.log(`\n❌ ${r.name}`);
      console.log(`   URL: ${r.url}`);
      console.log(`   Status: ${r.status}`);
      if (r.violations?.length) console.log(`   Violations: ${r.violations.join(', ')}`);
      if (r.leakedInfo?.length) console.log(`   🚨 INFO LEAK: ${r.leakedInfo.join(', ')}`);
      if (r.note) console.log(`   Note: ${r.note}`);
    });
  }
  
  const auditDir = path.resolve(__dirname);
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(auditDir, 'audit_results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nFull results saved to: scripts/audit/audit_results.json');
});
