const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function runDataLeakTests() {
  console.log('=' .repeat(60));
  console.log('VERDICT — DATA LEAK & PII EXPOSURE AUDIT');
  console.log('='.repeat(60));

  const findings = {
    client_bundle_secrets: [],
    politician_pii: [],
    citizen_ratings_ip_leak: [],
    error_schema_leaks: [],
  };

  // 1. CLIENT BUNDLE SECRET SCAN
  console.log('\n[1/4] Scanning .next/static/chunks/ for Exposed Secrets...');
  const chunksDir = path.resolve(__dirname, '../../.next/static/chunks');
  const sensitivePatterns = [
    /SUPABASE_SERVICE_ROLE_KEY/i,
    /DATABASE_URL/i,
    /NEXTAUTH_SECRET/i,
    /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, // JWT
  ];

  if (fs.existsSync(chunksDir)) {
    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (file.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          for (const pattern of sensitivePatterns) {
            if (pattern.test(content)) {
              findings.client_bundle_secrets.push({
                file: path.relative(chunksDir, fullPath),
                matchedPattern: pattern.toString(),
              });
            }
          }
        }
      }
    };
    scanDirectory(chunksDir);
  } else {
    console.log('Note: .next/static/chunks/ not built yet or running in dev.');
  }

  // 2. POLITICIAN PII EXPOSURE CHECK
  console.log('[2/4] Testing Politician API for PAN Numbers and Private PII...');
  try {
    const res = await fetch(`${BASE_URL}/api/politicians?limit=5`);
    const json = await res.json();
    const politicians = json.politicians || json.data || [];

    for (const p of politicians) {
      const jsonStr = JSON.stringify(p);
      const hasPan = /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(jsonStr);
      const hasPhone = /"phone":\s*"[0-9]{10}"/.test(jsonStr);
      const hasPersonalEmail = /"email":\s*"[^"]+@gmail\.com"/.test(jsonStr);

      if (hasPan || hasPhone || hasPersonalEmail) {
        findings.politician_pii.push({
          politician: p.name || p.fullName,
          hasPan,
          hasPhone,
          hasPersonalEmail,
        });
      }
    }
  } catch (err) {
    findings.politician_pii.push({ error: err.message });
  }

  // 3. CITIZEN RATINGS IP EXPOSURE CHECK
  console.log('[3/4] Testing /api/politicians/[slug] for IP Address Leaks in Ratings...');
  try {
    const res = await fetch(`${BASE_URL}/api/politicians/narendra-modi-varanasi`);
    const json = await res.json();
    const ratings = json.citizen_ratings || json.data?.citizen_ratings || [];

    for (const r of ratings) {
      if ('client_ip' in r || 'user_ip' in r || 'ip_address' in r || 'ip' in r) {
        findings.citizen_ratings_ip_leak.push({
          ratingId: r.id,
          exposedField: 'client_ip' in r ? 'client_ip' : 'user_ip',
        });
      }
    }
  } catch (err) {
    findings.citizen_ratings_ip_leak.push({ error: err.message });
  }

  // 4. ERROR MESSAGE SCHEMA LEAK CHECK
  console.log('[4/4] Testing Error Handling for Raw Stack Trace / DB Schema Leaks...');
  const errorUrls = [
    '/api/politicians/invalid-slug-%27%22--%3B',
    '/api/ratings?invalid=1',
    '/api/ground-truth/does-not-exist-%27',
  ];

  for (const url of errorUrls) {
    try {
      const res = await fetch(`${BASE_URL}${url}`);
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}

      const hasStackTrace = /at Object\.|at Function\.|node_modules|PostgreSQL|sqlite3/i.test(text);
      const followsContract = json && 'error' in json && 'code' in json.error && 'message' in json.error;

      if (hasStackTrace || !followsContract) {
        findings.error_schema_leaks.push({
          url,
          status: res.status,
          hasStackTrace,
          followsContract: !!followsContract,
          snippet: text.substring(0, 150),
        });
      }
    } catch (err) {
      findings.error_schema_leaks.push({ url, error: err.message });
    }
  }

  console.log('\n============================================================');
  console.log('DATA LEAK AUDIT RESULTS');
  console.log('============================================================');
  console.log(`Client Bundle Secret Leaks: ${findings.client_bundle_secrets.length}`);
  console.log(`Politician Private PII Leaks (PAN/Phone): ${findings.politician_pii.length}`);
  console.log(`Citizen Ratings IP Leaks: ${findings.citizen_ratings_ip_leak.length}`);
  console.log(`Error Responses Leaking Schema: ${findings.error_schema_leaks.length}`);

  const auditDir = path.resolve(__dirname);
  fs.writeFileSync(
    path.join(auditDir, 'data_leak_results.json'),
    JSON.stringify(findings, null, 2)
  );

  console.log('Full data leak results saved to: scripts/audit/data_leak_results.json');
}

runDataLeakTests();
