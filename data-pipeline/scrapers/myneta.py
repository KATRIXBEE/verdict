"""
MyNeta.info Async Scraper
Scrapes candidate affidavits, criminal dockets, asset declarations, and Form 26 PDF links.
"""

import re
import urllib.parse
from typing import Dict, Any, List, Optional
import httpx
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential
from config import MYNETA_RPS, MAX_DAILY_MYNETA_REQUESTS
from utils.rate_limiter import TokenBucketRateLimiter
from utils.proxy_manager import ProxyManager
from utils.logger import log_event
from parsers.ipc_translator import translate_ipc_section
from parsers.eci_affidavit_pdf import clean_currency_str

rate_limiter = TokenBucketRateLimiter(MYNETA_RPS)
proxy_manager = ProxyManager()


class MyNetaScraper:
    """
    Asynchronous web scraper for ADR / MyNeta.info candidate pages.
    """

    BASE_URL = "https://myneta.info"

    def __init__(self):
        self.request_count = 0

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=16), reraise=True)
    async def fetch_html(self, url: str) -> Optional[str]:
        """
        Fetches HTML from MyNeta with rate limiting, proxy failover, and exponential retries.
        """
        if self.request_count >= MAX_DAILY_MYNETA_REQUESTS:
            log_event("myneta", f"Reached daily request quota ({MAX_DAILY_MYNETA_REQUESTS})", level="WARNING")
            return None

        await rate_limiter.acquire()
        proxy = proxy_manager.get_proxy()
        proxies = {"all://": proxy} if proxy else None

        try:
            async with httpx.AsyncClient(timeout=20.0, follow_redirects=True, proxy=proxy) as client:
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9",
                }
                resp = await client.get(url, headers=headers)
                self.request_count += 1

                if resp.status_code == 429:
                    log_event("myneta", "Received 429 Rate Limit. Pausing scraper...", level="WARNING", status_code=429)
                    import asyncio
                    await asyncio.sleep(60)  # Cool down
                    raise Exception("Rate limited (429)")

                if resp.status_code in (403, 503):
                    proxy_manager.mark_failed(proxy)
                    raise Exception(f"HTTP {resp.status_code}")

                if resp.status_code == 200:
                    log_event("myneta", f"Fetched {url}", level="INFO", status_code=200, url=url)
                    return resp.text
                return None

        except Exception as e:
            log_event("myneta", f"Error fetching {url}: {e}", level="ERROR", error=str(e), url=url)
            raise e

    async def search_candidate(self, name: str, state: Optional[str] = None) -> List[Dict[str, str]]:
        """
        Searches MyNeta search endpoint for candidate profile links.
        """
        query = urllib.parse.quote_plus(name)
        search_url = f"{self.BASE_URL}/search.php?q={query}"
        html = await self.fetch_html(search_url)
        if not html:
            return []

        soup = BeautifulSoup(html, "html.parser")
        results = []
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if "candidate.php?candidate_id=" in href:
                text = link.get_text(strip=True)
                full_url = href if href.startswith("http") else f"{self.BASE_URL}/{href.lstrip('/')}"
                results.append({"name": text, "url": full_url})
        return results

    async def scrape_candidate_profile(self, candidate_url: str) -> Dict[str, Any]:
        """
        Extracts comprehensive candidate profile, assets, criminal dockets, and PDF URL.
        """
        html = await self.fetch_html(candidate_url)
        if not html:
            return {}

        soup = BeautifulSoup(html, "html.parser")
        profile: Dict[str, Any] = {
            "source_url": candidate_url,
            "name": None,
            "party": None,
            "constituency": None,
            "state": None,
            "profession": None,
            "education": None,
            "pan_declared": False,
            "movable_assets": None,
            "immovable_assets": None,
            "total_assets": None,
            "total_liabilities": None,
            "criminal_cases": [],
            "affidavit_pdf_url": None,
        }

        # Candidate Name
        h2 = soup.find("h2")
        if h2:
            profile["name"] = h2.get_text(strip=True)

        # Affidavit PDF Link
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.lower().endswith(".pdf") or "affidavit" in href.lower():
                profile["affidavit_pdf_url"] = href if href.startswith("http") else f"{self.BASE_URL}/{href.lstrip('/')}"
                break

        # Education & Profession
        for div in soup.find_all(["div", "p", "td"]):
            text = div.get_text(" ", strip=True)
            if "Education" in text and ":" in text and not profile["education"]:
                parts = text.split(":")
                if len(parts) > 1:
                    profile["education"] = parts[1].split("\n")[0].strip()
            if "Profession" in text and ":" in text and not profile["profession"]:
                parts = text.split(":")
                if len(parts) > 1:
                    profile["profession"] = parts[1].split("\n")[0].strip()
            if "PAN given" in text or "PAN Declared" in text:
                profile["pan_declared"] = True

        # Assets Table Parsing
        for table in soup.find_all("table"):
            table_text = table.get_text(" ", strip=True)
            if "Movable" in table_text and "Immovable" in table_text:
                for row in table.find_all("tr"):
                    cells = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]
                    row_str = " ".join(cells)
                    if "Movable" in row_str:
                        for cell in cells:
                            val = clean_currency_str(cell)
                            if val is not None and val > 0:
                                profile["movable_assets"] = val
                    if "Immovable" in row_str:
                        for cell in cells:
                            val = clean_currency_str(cell)
                            if val is not None and val > 0:
                                profile["immovable_assets"] = val
                    if "Total" in row_str and "Liabilities" not in row_str:
                        for cell in cells:
                            val = clean_currency_str(cell)
                            if val is not None and val > 0:
                                profile["total_assets"] = val
                    if "Liabilities" in row_str:
                        for cell in cells:
                            val = clean_currency_str(cell)
                            if val is not None:
                                profile["total_liabilities"] = val

        # Criminal Cases Parsing
        for div in soup.find_all(["div", "table"], class_=lambda c: c and "crime" in c.lower() if c else False):
            case_text = div.get_text(" ", strip=True)
            ipc_matches = re.findall(r"(?:IPC|Section|Sec)\s*(\d+[A-Z]?)", case_text, re.IGNORECASE)
            for sec in ipc_matches:
                trans = translate_ipc_section(sec)
                profile["criminal_cases"].append({
                    "case_number": "MyNeta Recorded Docket",
                    "court_name": "District Court",
                    "ipc_sections": [trans["section"]],
                    "ipc_plain_english": [trans["plain_english"]],
                    "severity": trans["severity"],
                    "nature_of_offence": trans["plain_english"],
                    "current_status": "Chargesheet Filed",
                })

        return profile
