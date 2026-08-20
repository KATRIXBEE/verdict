"""
MyNeta Enrichment Importer
Enriches existing database politicians with asset declarations, criminal cases, education, and affidavit URLs.
"""

from typing import Optional, Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from utils.models import Politician, Asset, CriminalCase
from utils.db import get_db_session
from utils.logger import log_event
from scrapers.myneta import MyNetaScraper
from .base_importer import BaseImporter


class MyNetaImporter(BaseImporter):
    """
    Orchestrates candidate searches and asset/criminal docket enrichment from MyNeta.info.
    """

    def __init__(self, state_filter: Optional[str] = None):
        super().__init__(source_name="MyNeta (ADR)")
        self.state_filter = state_filter
        self.scraper = MyNetaScraper()

    async def run_enrichment(self) -> Dict[str, Any]:
        """
        Runs MyNeta search and profile extraction for politicians.
        """
        stats = {
            "processed": 0,
            "matched": 0,
            "assets_added": 0,
            "cases_added": 0,
            "errors": 0,
        }

        async with get_db_session() as session:
            await self.start_import_log(session)

            # Query candidate pool
            query = select(Politician)
            if self.state_filter:
                query = query.where(Politician.current_state.ilike(f"%{self.state_filter}%"))
            
            pols = (await session.execute(query)).scalars().all()
            log_event("myneta_importer", f"Found {len(pols)} politicians for MyNeta enrichment", level="INFO")

            for pol in pols:
                stats["processed"] += 1
                try:
                    # 1. Search candidate on MyNeta
                    search_results = await self.scraper.search_candidate(pol.name, pol.current_state)
                    if not search_results:
                        continue

                    # Select first confident match
                    match_url = search_results[0]["url"]
                    profile_data = await self.scraper.scrape_candidate_profile(match_url)
                    if not profile_data:
                        continue

                    stats["matched"] += 1

                    # 2. Update Politician demographic fields
                    self.update_politician_field(pol, "education", profile_data.get("education"), self.source_name)
                    self.update_politician_field(pol, "profession", profile_data.get("profession"), self.source_name)

                    # 3. Ingest Asset Record
                    if profile_data.get("total_assets") or profile_data.get("movable_assets"):
                        year = 2024
                        stmt_ast = select(Asset).where(
                            Asset.politician_id == pol.id,
                            Asset.election_year == year,
                        )
                        ast = (await session.execute(stmt_ast)).scalar_one_or_none()
                        if not ast:
                            ast = Asset(
                                politician_id=pol.id,
                                election_year=year,
                                movable_assets=profile_data.get("movable_assets"),
                                immovable_assets=profile_data.get("immovable_assets"),
                                total_assets=profile_data.get("total_assets"),
                                total_liabilities=profile_data.get("total_liabilities"),
                                pan_number_declared=profile_data.get("pan_declared", False),
                                source=self.source_name,
                            )
                            session.add(ast)
                            stats["assets_added"] += 1
                        else:
                            if profile_data.get("movable_assets"):
                                ast.movable_assets = profile_data["movable_assets"]
                            if profile_data.get("immovable_assets"):
                                ast.immovable_assets = profile_data["immovable_assets"]
                            if profile_data.get("total_assets"):
                                ast.total_assets = profile_data["total_assets"]

                    # 4. Ingest Criminal Cases
                    cases = profile_data.get("criminal_cases", [])
                    for c in cases:
                        stmt_case = select(CriminalCase).where(
                            CriminalCase.politician_id == pol.id,
                            CriminalCase.case_number == c["case_number"],
                        )
                        existing_case = (await session.execute(stmt_case)).scalar_one_or_none()
                        if not existing_case:
                            new_case = CriminalCase(
                                politician_id=pol.id,
                                case_number=c.get("case_number"),
                                court_name=c.get("court_name"),
                                ipc_sections=c.get("ipc_sections", []),
                                ipc_plain_english=c.get("ipc_plain_english", []),
                                severity=c.get("severity", "Moderate"),
                                nature_of_offence=c.get("nature_of_offence"),
                                current_status=c.get("current_status", "Chargesheet Filed"),
                                election_year_declared=2024,
                                source=self.source_name,
                            )
                            session.add(new_case)
                            stats["cases_added"] += 1

                    await session.commit()

                except Exception as e:
                    stats["errors"] += 1
                    log_event("myneta_importer", f"Error enriching politician {pol.name}: {e}", level="ERROR", error=str(e))
                    await session.rollback()

            if self.import_log:
                self.import_log.politicians_processed = stats["processed"]
                self.import_log.politicians_updated = stats["matched"]
            await self.finish_import_log(session)

        log_event("myneta_importer", f"MyNeta enrichment finished: {stats}", level="INFO")
        return stats
