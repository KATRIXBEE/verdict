"""
Wikipedia Profile & Media Enricher
Enriches politicians missing biographical extracts, birth dates, or portrait images.
"""

from typing import Dict, Any
from sqlalchemy import select, or_
from utils.models import Politician
from utils.db import get_db_session
from utils.logger import log_event
from scrapers.wikipedia_api import WikipediaClient


class WikipediaEnricher:
    """
    Enriches politicians with Wikipedia bio, portrait photos, and birth dates.
    """

    def __init__(self):
        self.client = WikipediaClient()

    async def run_enrichment(self) -> Dict[str, Any]:
        """
        Runs Wikipedia lookup for all politicians missing summary or photo.
        """
        stats = {
            "processed": 0,
            "enriched": 0,
            "photos_added": 0,
            "errors": 0,
        }

        async with get_db_session() as session:
            # Query politicians needing enrichment
            stmt = select(Politician).where(
                or_(
                    Politician.wikipedia_summary.is_(None),
                    Politician.photo_url.is_(None),
                    Politician.date_of_birth.is_(None),
                )
            )
            pols = (await session.execute(stmt)).scalars().all()
            log_event("wikipedia_enricher", f"Found {len(pols)} politicians for Wikipedia enrichment", level="INFO")

            for pol in pols:
                stats["processed"] += 1
                try:
                    bio = await self.client.get_politician_bio(pol.name)
                    if not bio.get("found"):
                        continue

                    stats["enriched"] += 1

                    if bio.get("summary") and not pol.wikipedia_summary:
                        pol.wikipedia_summary = bio["summary"]
                    if bio.get("wikipedia_url") and not pol.wikipedia_url:
                        pol.wikipedia_url = bio["wikipedia_url"]
                    if bio.get("date_of_birth") and not pol.date_of_birth:
                        pol.date_of_birth = bio["date_of_birth"]

                    # Only update photo if none exists
                    if bio.get("photo_url") and not pol.photo_url:
                        pol.photo_url = bio["photo_url"]
                        stats["photos_added"] += 1

                    # Add Wikipedia to sources
                    sources = list(pol.data_sources or [])
                    if "Wikipedia" not in sources:
                        sources.append("Wikipedia")
                        pol.data_sources = sources

                    await session.commit()

                except Exception as e:
                    stats["errors"] += 1
                    log_event("wikipedia_enricher", f"Error enriching {pol.name}: {e}", level="ERROR", error=str(e))
                    await session.rollback()

        log_event("wikipedia_enricher", f"Wikipedia enrichment complete: {stats}", level="INFO")
        return stats
