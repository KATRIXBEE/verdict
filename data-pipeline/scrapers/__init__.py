"""
VERDICT Data Pipeline Scrapers
"""

from .lok_dhaba import LokDhabaParser
from .myneta import MyNetaScraper
from .sansad import SansadScraper
from .wikipedia_api import WikipediaClient
from .ecourts import ECourtsScraper
from .google_news import GoogleNewsScraper, classify_headline_sentiment

__all__ = [
    "LokDhabaParser",
    "MyNetaScraper",
    "SansadScraper",
    "WikipediaClient",
    "ECourtsScraper",
    "GoogleNewsScraper",
    "classify_headline_sentiment",
]
