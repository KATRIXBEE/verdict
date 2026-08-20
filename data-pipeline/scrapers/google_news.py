"""
Google News RSS Feed Scraper & Polarity Sentiment Classifier
Fetches news mentions for politicians and classifies sentiment using keywords.
"""

import re
import urllib.parse
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
import httpx
import feedparser
from tenacity import retry, stop_after_attempt, wait_exponential
from config import GOOGLE_NEWS_RPS
from utils.rate_limiter import TokenBucketRateLimiter
from utils.logger import log_event

rate_limiter = TokenBucketRateLimiter(GOOGLE_NEWS_RPS)

# Keyword dictionaries for classification
POSITIVE_KEYWORDS = [
    "developed", "inaugurated", "launched", "awarded", "praised", 
    "helped", "delivered", "built", "completed", "reformed", 
    "approved", "allocated", "victory", "honoured", "championed"
]

NEGATIVE_KEYWORDS = [
    "arrested", "scam", "corruption", "fraud", "alleged", 
    "controversy", "accused", "convicted", "scandal", "exposed", 
    "probe", "raid", "ed summons", "cbi", "fir", "bribe", "disqualified"
]


def classify_headline_sentiment(headline: str) -> str:
    """
    Classifies a news headline as Positive, Negative, or Neutral based on keyword presence.
    """
    text = headline.lower()
    pos_matches = sum(1 for kw in POSITIVE_KEYWORDS if kw in text)
    neg_matches = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text)

    if neg_matches > pos_matches:
        return "Negative"
    elif pos_matches > neg_matches:
        return "Positive"
    return "Neutral"


class GoogleNewsScraper:
    """
    Fetches media mentions via Google News RSS search endpoints.
    """

    BASE_RSS_URL = "https://news.google.com/rss/search"

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8), reraise=False)
    async def fetch_news_mentions(self, politician_name: str, days: int = 90) -> List[Dict[str, Any]]:
        """
        Fetches news articles for a politician from the past N days.
        """
        await rate_limiter.acquire()
        query = urllib.parse.quote(f"{politician_name} India")
        url = f"{self.BASE_RSS_URL}?q={query}&hl=en-IN&gl=IN&ceid=IN:en"

        articles: List[Dict[str, Any]] = []

        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(url, headers=self.headers)
                if resp.status_code == 200:
                    feed = feedparser.parse(resp.text)
                    cutoff_date = datetime.utcnow() - timedelta(days=days)

                    for entry in feed.entries[:25]:
                        headline = entry.get("title", "")
                        link = entry.get("link", "")
                        source_name = entry.get("source", {}).get("title", "National Media")

                        # Parse publish date
                        pub_date = None
                        if "published_parsed" in entry and entry.published_parsed:
                            dt = datetime(*entry.published_parsed[:6])
                            if dt < cutoff_date:
                                continue
                            pub_date = dt.date()
                        else:
                            pub_date = date.today()

                        sentiment = classify_headline_sentiment(headline)

                        articles.append({
                            "headline": headline,
                            "url": link,
                            "source_name": source_name,
                            "published_date": pub_date,
                            "sentiment": sentiment,
                        })

                    log_event("google_news", f"Found {len(articles)} news mentions for '{politician_name}'", level="INFO")
        except Exception as e:
            log_event("google_news", f"Error fetching news for '{politician_name}'", level="ERROR", error=str(e))

        return articles
