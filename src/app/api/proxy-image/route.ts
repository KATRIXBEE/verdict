import { NextRequest, NextResponse } from "next/server";

const FALLBACK_SVG = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#1A1A1A"/>
  <circle cx="200" cy="145" r="65" fill="#2E2E2E"/>
  <ellipse cx="200" cy="320" rx="110" ry="85" fill="#2E2E2E"/>
  <rect x="0" y="390" width="400" height="10" fill="#FF4545" opacity="0.6"/>
  <text x="200" y="375" font-family="monospace" font-size="11" fill="#777777" text-anchor="middle" letter-spacing="2">
    PHOTO PENDING
  </text>
</svg>`;

const ALLOWED_DOMAINS = [
  "sansad.in",
  "affidavit.eci.gov.in",
  "eci.gov.in",
  "upload.wikimedia.org",
  "wikipedia.org",
  "wikimedia.org",
  "righttoinformation.wiki",
  "images.unsplash.com",
  "rajyasabha.nic.in",
  "loksabhaph.nic.in",
  "loksabha.nic.in",
  "myneta.info",
];

const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response(FALLBACK_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new Response(FALLBACK_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  }

  // 1. Strict Protocol Check
  if (parsedUrl.protocol !== "https:") {
    return new Response(FALLBACK_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  }

  // 2. Strict Exact or Dot-Prefixed Domain Matching (Neutralizes Suffix Match SSRF)
  const hostname = parsedUrl.hostname.toLowerCase();
  const isAllowed = ALLOWED_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith(`.${d}`)
  );

  if (!isAllowed) {
    return new Response(FALLBACK_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "VerdictCivicBot/1.0 (https://verdict.org.in; civic-tech@verdict.org.in)",
        "Referer": parsedUrl.origin,
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return new Response(FALLBACK_SVG, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        },
      });
    }

    // 3. Payload Size Capping Check
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return new Response(FALLBACK_SVG, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        },
      });
    }

    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength > MAX_PAYLOAD_BYTES) {
      return new Response(FALLBACK_SVG, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        },
      });
    }

    let contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.toLowerCase().startsWith("image/")) {
      contentType = "image/jpeg";
    }

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[API_ERROR] /api/proxy-image:", error);
    return new Response(FALLBACK_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    });
  }
}
