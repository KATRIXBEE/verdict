"""
Wikipedia REST API Client
Fetches biographical summary extracts, birth dates, and portrait images.
"""

import re
import urllib.parse
from datetime import datetime, date
from typing import Dict, Any, Optional
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from config import WIKIPEDIA_RPS
from utils.rate_limiter import TokenBucketRateLimiter
from utils.logger import log_event

rate_limiter = TokenBucketRateLimiter(WIKIPEDIA_RPS)


class WikipediaClient:
    """
    Client for Wikimedia Foundation REST API.
    """

    BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/summary"

    def __init__(self):
        self.headers = {
            "User-Agent": "VerdictCivicTech/1.0 (https://github.com/KATRIXBEE/verdict; contact@verdict.org.in)",
            "Accept": "application/json",
        }

    def _extract_birth_date(self, text: str) -> Optional[date]:
        """
        Extracts birth date from bio text using regex patterns like 'born 17 September 1950' or '(born 1950-09-17)'.
        """
        if not text:
            return None

        # Pattern: born 17 September 1950 or born 2 October 1969
        match = re.search(r"\bborn\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})", text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            for fmt in ("%d %B %Y", "%d %b %Y", "%B %d, %Y"):
                try:
                    return datetime.strptime(date_str, fmt).date()
                except ValueError:
                    pass

        # Pattern: (born 1968-05-14)
        match_iso = re.search(r"\bborn\s+(\d{4}-\d{2}-\d{2})", text, re.IGNORECASE)
        if match_iso:
            try:
                return datetime.strptime(match_iso.group(1), "%Y-%m-%d").date()
            except ValueError:
                pass

        return None

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8), reraise=False)
    async def fetch_summary_by_title(self, title: str) -> Optional[Dict[str, Any]]:
        """
        Queries Wikipedia page summary endpoint for a specific title.
        """
        await rate_limiter.acquire()
        encoded_title = urllib.parse.quote(title.strip().replace(" ", "_"))
        url = f"{self.BASE_URL}/{encoded_title}"

        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(url, headers=self.headers)
                if resp.status_code == 200:
                    data = resp.json()
                    extract = data.get("extract", "")
                    photo_url = data.get("thumbnail", {}).get("source")
                    page_url = data.get("content_urls", {}).get("desktop", {}).get("page")
                    birth_date = self._extract_birth_date(extract)

                    log_event("wikipedia", f"Found Wikipedia article for '{title}'", level="INFO", url=url)
                    return {
                        "found": True,
                        "title": data.get("title", title),
                        "summary": extract,
                        "photo_url": photo_url,
                        "wikipedia_url": page_url,
                        "date_of_birth": birth_date,
                    }
                elif resp.status_code == 404:
                    return None
        except Exception as e:
            log_event("wikipedia", f"Error fetching Wikipedia page for '{title}'", level="ERROR", error=str(e), url=url)
        return None

    async def get_politician_bio(self, name: str) -> Dict[str, Any]:
        """
        Attempts to fetch politician summary using name search cascade:
        1. Exact Name
        2. Name + ' (politician)'
        3. Name + ' (Indian politician)'
        4. Name + ' India'
        """
        # 1. Exact Name
        res = await self.fetch_summary_by_title(name)
        if res:
            return res

        # 2. Name + ' (politician)'
        res = await self.fetch_summary_by_title(f"{name} (politician)")
        if res:
            return res

        # 3. Name + ' (Indian politician)'
        res = await self.fetch_summary_by_title(f"{name} (Indian politician)")
        if res:
            return res

        # 4. Name + ' India'
        res = await self.fetch_summary_by_title(f"{name} India")
        if res:
            return res

        log_event("wikipedia", f"No Wikipedia entry found for '{name}'", level="INFO")
        return {"found": False}
