import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom Trend and Rate metrics
const failureRate = new Rate('verdict_failed_requests');
const homeDuration = new Trend('duration_home_and_search');
const dossierDuration = new Trend('duration_dossier_pages');
const compareDuration = new Trend('duration_compare_views');
const proxyDuration = new Trend('duration_image_proxy');
const ratingDuration = new Trend('duration_ratings');

export const options = {
  stages: [
    { duration: '30s', target: 25 },  // Stage 1: Ramp-up 0 -> 25 VUs
    { duration: '1m',  target: 50 },  // Stage 2: Peak sustained 50 VUs (10k daily visitors)
    { duration: '30s', target: 100 }, // Stage 3: Stress surge 100 VUs
    { duration: '20s', target: 0 },   // Stage 4: Ramp-down 100 -> 0 VUs
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1200'],
    'http_req_failed': ['rate<0.01'],
    'verdict_failed_requests': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Generate distinct virtual client IP per VU to simulate authentic distributed user traffic
  const vuIp = `198.51.100.${(__VU % 250) + 1}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (k6-load-test; VERDICT-SRE-Benchmark)',
    'x-forwarded-for': vuIp,
    'x-real-ip': vuIp,
    'Accept': 'text/html,application/json,*/*',
  };

  // Determine workload scenario based on probabilistic distribution
  const rand = Math.random();

  if (rand < 0.40) {
    // 40% Workload: Homepage & Search Queries
    group('01_Home_and_Search', function () {
      const resHome = http.get(`${BASE_URL}/`, { headers });
      const passHome = check(resHome, {
        'homepage status 200': (r) => r.status === 200,
      });
      failureRate.add(!passHome);
      homeDuration.add(resHome.timings.duration);

      const resList = http.get(`${BASE_URL}/api/politicians?page=1&limit=20`, { headers });
      const passList = check(resList, {
        'politicians api status 200': (r) => r.status === 200,
        'has politicians data': (r) => r.body.includes('politicians') || r.body.includes('data'),
      });
      failureRate.add(!passList);
      homeDuration.add(resList.timings.duration);

      const searchTerms = ['Modi', 'Gandhi', 'Singh', 'Sharma', 'Kumar'];
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      const resSearch = http.get(`${BASE_URL}/api/search?q=${term}`, { headers });
      const passSearch = check(resSearch, {
        'search api status 200': (r) => r.status === 200,
      });
      failureRate.add(!passSearch);
      homeDuration.add(resSearch.timings.duration);
    });

  } else if (rand < 0.70) {
    // 30% Workload: Deep-Dive Dossier Pages
    group('02_Politician_Dossiers', function () {
      const slugs = [
        'narendra-modi-varanasi',
        'dr-arvind-shrivastava',
        'rameshwar-singh',
        'digvijay-rathore',
      ];
      const slug = slugs[Math.floor(Math.random() * slugs.length)];

      const resPage = http.get(`${BASE_URL}/politician/${slug}`, { headers });
      const passPage = check(resPage, {
        'dossier html status 200': (r) => r.status === 200 || r.status === 404,
      });
      failureRate.add(!passPage);
      dossierDuration.add(resPage.timings.duration);

      const resApi = http.get(`${BASE_URL}/api/politicians/${slug}`, { headers });
      const passApi = check(resApi, {
        'dossier api status 200/404': (r) => r.status === 200 || r.status === 404,
      });
      failureRate.add(!passApi);
      dossierDuration.add(resApi.timings.duration);
    });

  } else if (rand < 0.85) {
    // 15% Workload: Comparison & Static Analytical Views
    group('03_Compare_and_Analytics', function () {
      const views = ['/compare', '/tax-money', '/method', '/ground-truth'];
      const view = views[Math.floor(Math.random() * views.length)];

      const res = http.get(`${BASE_URL}${view}`, { headers });
      const pass = check(res, {
        'static/compare view status 200': (r) => r.status === 200,
      });
      failureRate.add(!pass);
      compareDuration.add(res.timings.duration);
    });

  } else if (rand < 0.95) {
    // 10% Workload: Image Proxy Queries
    group('04_Image_Proxy', function () {
      const sampleImg = encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Narendra_Modi_official_portrait_2024.jpg/440px-Narendra_Modi_official_portrait_2024.jpg');
      const res = http.get(`${BASE_URL}/api/proxy-image?url=${sampleImg}`, { headers });
      const pass = check(res, {
        'image proxy status 200': (r) => r.status === 200,
      });
      failureRate.add(!pass);
      proxyDuration.add(res.timings.duration);
    });

  } else {
    // 5% Workload: Rating & Health Telemetry Probes
    group('05_Health_and_Ratings', function () {
      const resHealth = http.get(`${BASE_URL}/api/health`, { headers });
      const passHealth = check(resHealth, {
        'health check status 200': (r) => r.status === 200,
      });
      failureRate.add(!passHealth);
      ratingDuration.add(resHealth.timings.duration);
    });
  }

  // Realistic user pacing / think time between navigation actions (200ms - 800ms)
  sleep(Math.random() * 0.6 + 0.2);
}
