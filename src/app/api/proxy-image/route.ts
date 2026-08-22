import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Security: only proxy from these trusted domains
  const allowedDomains = [
    "sansad.in",
    "rajyasabha.nic.in",
    "loksabhaph.nic.in",
    "loksabha.nic.in",
    "upload.wikimedia.org",
    "righttoinformation.wiki",
    "myneta.info",
    "wikipedia.org",
    "images.unsplash.com",
    "wikimedia.org",
    "eci.gov.in"
  ];

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new Response("Invalid URL format", { status: 400 });
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isAllowed = allowedDomains.some((domain) => hostname.endsWith(domain));

  if (!isAllowed) {
    return new Response("Domain not allowed", { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; VERDICT/1.0)",
        "Referer": parsedUrl.origin,
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return new Response(`Image fetch failed with status ${response.status}`, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new Response(`Error fetching image: ${error?.message || "Internal error"}`, { status: 500 });
  }
}
