import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

// NOTE: This in-memory store resets on server restart.
// For Vercel deployment this is acceptable — Vercel edge 
// provides trusted IP and instances recycle frequently.
// For self-hosted production: replace with Upstash Redis:
// npm install @upstash/ratelimit @upstash/redis
const rateLimitStore = new Map<string, RateLimitRecord>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords(now: number, windowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

function getClientIp(request: NextRequest): string {
  // Priority: Edge trusted header > rightmost proxy IP in chain > fallback
  const vercelIp = request.headers.get("x-real-ip");
  if (vercelIp) return vercelIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the last IP in the chain (set by upstream reverse proxy, immune to client prefix spoofing)
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[ips.length - 1];
  }

  return "127.0.0.1";
}

function checkRateLimit(ip: string, category: "read" | "mutation", now: number): boolean {
  const windowMs = 60 * 1000; // 60-second sliding window
  const maxLimit = category === "mutation" ? 20 : 60;
  const key = `${ip}:${category}`;

  cleanupExpiredRecords(now, windowMs);

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxLimit) {
    return false; // Exceeded limit
  }

  record.timestamps.push(now);
  return true;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Generate correlation ID and cryptographic per-request nonce for Content Security Policy
  const requestId = crypto.randomUUID();
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.sansad.in https://*.eci.gov.in https://*.wikimedia.org https://*.wikipedia.org https://righttoinformation.wiki https://api.dicebear.com https://images.unsplash.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://sansad.in https://righttoinformation.wiki https://upload.wikimedia.org https://api.dicebear.com",
    "frame-ancestors 'none'",
  ];

  const cspHeaderValue = cspDirectives.join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-csp-nonce", nonce);

  // 2. Enforce Rate Limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const isMutation =
      request.method === "POST" ||
      request.method === "PUT" ||
      request.method === "DELETE" ||
      pathname.startsWith("/api/ratings");
    const category = isMutation ? "mutation" : "read";
    const now = Date.now();

    const allowed = checkRateLimit(ip, category, now);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: {
            code: "RATE_LIMITED",
            message: "Rate limit exceeded. Please try again later.",
            retryAfter: 60,
          },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "Content-Security-Policy": cspHeaderValue,
            "x-request-id": requestId,
          },
        }
      );
    }
  }

  // 3. Create response with propagated CSP and security headers
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", cspHeaderValue);
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icons / images / static (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|images|static).*)",
  ],
};
