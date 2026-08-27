const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// 1. INJECTION TESTS
const INJECTION_PAYLOADS = [
  // SQL Injection payloads
  "' OR '1'='1",
  "' OR 1=1 --",
  "'; DROP TABLE politicians; --",
  "' UNION SELECT * FROM politicians --",
  "1' ORDER BY 1--",
  "1; WAITFOR DELAY '0:0:5' --",

  // NoSQL Injection
  '{"$gt": ""}',
  '{"$where": "sleep(1000)"}',

  // XSS Payloads
  "<script>alert('xss')</script>",
  "<img src=x onerror=alert(1)>",
  "javascript:alert(1)",
  "<svg onload=alert(1)>",
  "';alert(String.fromCharCode(88,83,83))//",

  // Path traversal
  "../../../../etc/passwd",
  "../../../.env",
  "..%2F..%2F..%2Fetc%2Fpasswd",

  // Command Injection
  "; ls -la",
  "| cat /etc/passwd",
  "`id`",
];

const INPUT_ENDPOINTS = [
  (payload) => `/api/search?q=${encodeURIComponent(payload)}`,
  (payload) => `/api/politicians?state=${encodeURIComponent(payload)}`,
  (payload) => `/api/politicians?party=${encodeURIComponent(payload)}`,
  (payload) => `/politician/${encodeURIComponent(payload)}`,
  (payload) => `/api/proxy-image?url=${encodeURIComponent(payload)}`,
  (payload) => `/api/ground-truth/${encodeURIComponent(payload)}`,
];

// 2. AUTHENTICATION & SPOOFING TESTS
const AUTH_TESTS = [
  {
    name: "Rating with fake DigiLocker token",
    url: '/api/ratings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAA',
      'x-forwarded-for': '192.168.10.101',
    },
    body: { politicianId: 'narendra-modi-varanasi', rating: 5, userName: 'Test User', digilockerVerified: true },
    check: (status, body, json) => {
      // digilockerVerified should NOT be true unless verified server-side
      return json && json.digilockerVerified !== true;
    },
  },
  {
    name: "Rating with no auth",
    url: '/api/ratings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.10.102',
    },
    body: { politicianId: 'narendra-modi-varanasi', rating: 4, userName: 'Anonymous Voter' },
    check: (status, body, json) => {
      return status === 200 && json && json.digilockerVerified !== true;
    },
  },
  {
    name: "Rating with isLocalVoter: true in body",
    url: '/api/ratings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '192.168.10.103',
    },
    body: { politicianId: 'narendra-modi-varanasi', rating: 5, userName: 'Spoof Test', isLocalVoter: true },
    check: (status, body, json) => {
      return json && json.isLocalVoter !== true;
    },
  },
];

// 3. INFORMATION DISCLOSURE TESTS
const INFO_DISCLOSURE_PATHS = [
  '/.env',
  '/.env.local',
  '/.env.production',
  '/config.json',
  '/package.json',
  '/next.config.js',
  '/src/lib/db.ts',
  '/.git/config',
  '/.git/HEAD',
  '/api/politicians?page=0&limit=-1',
  '/api/ratings', // GET on POST-only endpoint
];

async function runSecurityAudit() {
  console.log('=' .repeat(60));
  console.log('VERDICT — PENETRATION & SECURITY AUDIT SCANNER');
  console.log('='.repeat(60));

  const results = {
    injections: [],
    auth: [],
    info_disclosure: [],
    rate_limiting: [],
    headers: [],
  };

  // 1. INJECTION SCAN
  console.log('\n[1/5] Testing Injection Payloads across API Endpoints...');
  for (const endpointFn of INPUT_ENDPOINTS) {
    for (const payload of INJECTION_PAYLOADS) {
      const targetUrl = `${BASE_URL}${endpointFn(payload)}`;
      try {
        const start = Date.now();
        const res = await fetch(targetUrl, { redirect: 'manual' });
        const duration = Date.now() - start;
        const text = await res.text();

        const leaksDbError = /sqlite|postgresql|syntax error|fatal error|sqlstate/i.test(text);
        const reflectsXss = text.includes(payload) && res.headers.get('content-type')?.includes('text/html');
        const timeBlindSqli = duration > 4000 && payload.includes('WAITFOR');

        const passed = !leaksDbError && !reflectsXss && !timeBlindSqli && res.status !== 500;

        results.injections.push({
          url: endpointFn(payload),
          payload,
          status: res.status,
          durationMs: duration,
          passed,
          reason: leaksDbError ? 'DB Error Leak' : reflectsXss ? 'XSS Reflection' : timeBlindSqli ? 'Time Blind SQLi' : 'Clean',
        });
      } catch (err) {
        results.injections.push({
          url: endpointFn(payload),
          payload,
          status: 'ERROR',
          passed: false,
          reason: err.message,
        });
      }
    }
  }

  // 2. AUTHENTICATION & SPOOFING SCAN
  console.log('[2/5] Testing Authentication & Token Spoofing...');
  for (const test of AUTH_TESTS) {
    try {
      const res = await fetch(`${BASE_URL}${test.url}`, {
        method: test.method,
        headers: test.headers,
        body: JSON.stringify(test.body),
      });
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}
      const passed = test.check(res.status, text, json);

      results.auth.push({
        name: test.name,
        status: res.status,
        passed,
      });
    } catch (err) {
      results.auth.push({
        name: test.name,
        status: 'ERROR',
        passed: false,
        error: err.message,
      });
    }
  }

  // 3. INFORMATION DISCLOSURE SCAN
  console.log('[3/5] Testing Sensitive Path & Environment Disclosure...');
  for (const path of INFO_DISCLOSURE_PATHS) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, { redirect: 'manual' });
      const text = await res.text();

      // Protected if 404, 403, 405 or not revealing secrets
      const leaksSecrets = /SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|SECRET_KEY|password=/i.test(text);
      const passed = !leaksSecrets && (res.status === 404 || res.status === 403 || res.status === 405 || (res.status === 200 && !path.startsWith('/.')));

      results.info_disclosure.push({
        path,
        status: res.status,
        leaksSecrets,
        passed,
      });
    } catch (err) {
      results.info_disclosure.push({
        path,
        status: 'ERROR',
        passed: false,
      });
    }
  }

  // 4. RATE LIMITING TEST
  console.log('[4/5] Testing Rapid Fire Rate Limiting on /api/ratings...');
  let hitRateLimit = false;
  let successCount = 0;
  const testIp = '10.99.88.77';

  for (let i = 0; i < 25; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp,
        },
        body: JSON.stringify({
          politicianId: 'narendra-modi-varanasi',
          rating: 5,
          userName: `SpamBot_${i}`,
        }),
      });
      if (res.status === 429) {
        hitRateLimit = true;
      } else if (res.status === 200) {
        successCount++;
      }
    } catch {}
  }

  results.rate_limiting.push({
    test: "25 rapid POST submissions from same IP",
    hitRateLimit,
    successCount,
    passed: hitRateLimit || successCount <= 20,
  });

  // 5. SECURITY HEADERS AUDIT
  console.log('[5/5] Auditing Defensive Security Headers on /...');
  try {
    const res = await fetch(`${BASE_URL}/`);
    const headers = res.headers;

    const headerChecks = [
      { name: 'X-Frame-Options', value: headers.get('x-frame-options'), expected: 'DENY' },
      { name: 'X-Content-Type-Options', value: headers.get('x-content-type-options'), expected: 'nosniff' },
      { name: 'X-XSS-Protection', value: headers.get('x-xss-protection'), expected: '1; mode=block' },
      { name: 'Referrer-Policy', value: headers.get('referrer-policy'), expected: 'strict-origin-when-cross-origin' },
      { name: 'Content-Security-Policy', value: headers.get('content-security-policy') ? 'PRESENT' : 'MISSING', expected: 'PRESENT' },
      { name: 'X-Powered-By Leak', value: headers.get('x-powered-by') || 'NONE (SECURE)', expected: 'NONE (SECURE)' },
    ];

    results.headers = headerChecks.map(h => ({
      ...h,
      passed: h.value === h.expected || (h.name === 'Content-Security-Policy' && h.value === 'PRESENT'),
    }));
  } catch (err) {
    results.headers = [{ name: 'Connection', passed: false, error: err.message }];
  }

  const auditDir = path.resolve(__dirname);
  fs.writeFileSync(
    path.join(auditDir, 'security_results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n============================================================');
  console.log('SECURITY PENETRATION RESULTS SUMMARY');
  console.log('============================================================');
  console.log(`Injection Tests: ${results.injections.filter(r => r.passed).length} / ${results.injections.length} PASSED`);
  console.log(`Auth & Spoofing Tests: ${results.auth.filter(r => r.passed).length} / ${results.auth.length} PASSED`);
  console.log(`Information Disclosure: ${results.info_disclosure.filter(r => r.passed).length} / ${results.info_disclosure.length} PASSED`);
  console.log(`Rate Limiting: ${results.rate_limiting.filter(r => r.passed).length} / ${results.rate_limiting.length} PASSED`);
  console.log(`Defensive Headers: ${results.headers.filter(r => r.passed).length} / ${results.headers.length} PASSED`);
  console.log('\nFull security results saved to: scripts/audit/security_results.json');
}

runSecurityAudit();
