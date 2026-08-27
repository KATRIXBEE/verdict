const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

const HIDDEN_ROUTES_TO_CHECK = [
  '/admin',
  '/admin/dashboard',
  '/admin/politicians',
  '/admin/login',
  '/dashboard',
  '/login',
  '/signup',
  '/register',
  '/cms',
  '/editor',
  '/staff',
  '/internal',
  '/dev',
  '/debug',
  '/test',
  '/preview',
  '/staging',
  '/api/admin',
  '/api/admin/politicians',
  '/api/debug',
  '/api/test',
  '/api/internal',
  '/api/env',
  '/api/config',
  '/api/users',
  '/api/sessions',
  '/api/logs',
  '/api/metrics',
  '/api/status',
  '/api/v1/politicians',
  '/api/v2/politicians',
  '/v1/api/politicians',
  '/_next/static/',
  '/_next/server/',
  '/sitemap.xml',
  '/sitemap.txt',
  '/security.txt',
  '/.well-known/security.txt',
  '/changelog',
  '/version',
  '/health',
  '/status',
  '/ping',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/browserconfig.xml',
  '/crossdomain.xml',
  '/phpinfo.php',
  '/wp-admin',
  '/wp-login.php',
  '/backup',
  '/backup.zip',
  '/backup.tar.gz',
  '/db-backup.sql',
  '/dump.sql',
  '/export.json',
  '/data',
  '/uploads',
  '/files',
  '/docs',
  '/swagger',
  '/graphql',
  '/graphql/playground',
  '/__graphql',
];

async function scanHiddenRoutes() {
  console.log('=' .repeat(60));
  console.log('VERDICT — HIDDEN & SHADOW ROUTE DISCOVERY SCAN');
  console.log('='.repeat(60));

  const results = [];
  const discovered = [];

  for (const route of HIDDEN_ROUTES_TO_CHECK) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, { redirect: 'manual' });
      const status = res.status;
      const contentType = res.headers.get('content-type') || '';

      const isFound = status === 200 || status === 301 || status === 302 || status === 307 || status === 308;
      const isProtected = status === 401 || status === 403;

      const record = {
        route,
        status,
        contentType,
        flag: isFound ? 'FOUND' : isProtected ? 'PROTECTED' : 'NOT_FOUND',
      };

      results.push(record);
      if (isFound || isProtected) {
        discovered.push(record);
        console.log(`[DISCOVERY] ${route} -> Status: ${status} (${record.flag}) [${contentType}]`);
      }
    } catch (err) {
      results.push({ route, status: 'ERROR', flag: 'ERROR', error: err.message });
    }
  }

  console.log(`\nScan complete: ${results.length} paths probed.`);
  console.log(`Discovered / Exposed endpoints: ${discovered.length}`);

  const auditDir = path.resolve(__dirname);
  fs.writeFileSync(
    path.join(auditDir, 'hidden_routes_results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('Full hidden route results saved to: scripts/audit/hidden_routes_results.json');
}

scanHiddenRoutes();
