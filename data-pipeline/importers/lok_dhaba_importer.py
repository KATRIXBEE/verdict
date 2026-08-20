"""
Lok Dhaba Seed Data Importer
Imports historical Indian election results, candidates, and multi-year track records at scale.
"""

from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from utils.models import Politician, ElectionHistory, Asset
from utils.db import get_db_session
from utils.logger import log_event
from scrapers.lok_dhaba import LokDhabaParser
from .base_importer import BaseImporter, create_slug, normalize_name


class LokDhabaImporter(BaseImporter):
    """
    Importer for bulk Lok Dhaba candidate & election CSVs.
    """

    def __init__(self, csv_file_path: str):
        super().__init__(source_name="Lok Dhaba (Ashoka TCPD)")
        self.csv_path = csv_file_path

    async def run_import(self) -> Dict[str, Any]:
        """
        Executes the seed import process.
        """
        parser = LokDhabaParser(self.csv_path)
        records = parser.parse()

        if not records:
            return {"success": False, "message": "No records parsed from CSV"}

        stats = {
            "processed": 0,
            "politicians_created": 0,
            "politicians_updated": 0,
            "elections_created": 0,
            "errors": 0,
        }

        async with get_db_session() as session:
            await self.start_import_log(session)

            for rec in records:
                stats["processed"] += 1
                try:
                    name = rec["name"]
                    state = rec["state"]
                    constituency = rec["constituency"]
                    year = rec["election_year"]

                    # 1. Match or Create Politician
                    pol, is_confident = await self.find_matching_politician(
                        session, name, state, constituency
                    )

                    if not pol:
                        # Generate unique slug
                        slug = create_slug(name, state, constituency)
                        # Check slug collision
                        stmt = select(Politician).where(Politician.slug == slug)
                        if (await session.execute(stmt)).scalar_one_or_none():
                            slug = f"{slug}-{year}"

                        pol = Politician(
                            name=name,
                            slug=slug,
                            name_variants=[name],
                            current_party=rec["party"],
                            current_constituency=constituency,
                            current_state=state,
                            current_house=rec["house"],
                            gender=rec.get("gender"),
                            education=rec.get("education"),
                            data_sources=[self.source_name],
                            needs_review=not is_confident,
                        )
                        session.add(pol)
                        await session.flush()  # Flush to obtain pol.id
                        stats["politicians_created"] += 1
                    else:
                        # Update variants if new spelling
                        variants = list(pol.name_variants or [])
                        if name not in variants:
                            variants.append(name)
                            pol.name_variants = variants
                        # Update current party/constituency if newer election
                        if year >= 2024:
                            self.update_politician_field(pol, "current_party", rec["party"], self.source_name)
                            self.update_politician_field(pol, "current_constituency", constituency, self.source_name)
                            self.update_politician_field(pol, "current_state", state, self.source_name)
                        stats["politicians_updated"] += 1

                    # 2. Upsert Election History Record
                    stmt_elec = select(ElectionHistory).where(
                        ElectionHistory.politician_id == pol.id,
                        ElectionHistory.election_year == year,
                        ElectionHistory.constituency == constituency,
                    )
                    elec_res = await session.execute(stmt_elec)
                    elec = elec_res.scalar_one_or_none()

                    if not elec:
                        elec = ElectionHistory(
                            politician_id=pol.id,
                            election_year=year,
                            house=rec["house"],
                            constituency=constituency,
                            state=state,
                            party=rec["party"],
                            votes_received=rec.get("votes_received"),
                            result=rec["result"],
                            margin=rec.get("margin"),
                            source=self.source_name,
                        )
                        session.add(elec)
                        stats["elections_created"] += 1

                    # 3. Create Asset Record if available in Lok Dhaba
                    if rec.get("total_assets"):
                        stmt_ast = select(Asset).where(
                            Asset.politician_id == pol.id,
                            Asset.election_year == year,
                        )
                        ast = (await session.execute(stmt_ast)).scalar_one_or_none()
                        if not ast:
                            session.add(Asset(
                                politician_id=pol.id,
                                election_year=year,
                                total_assets=rec["total_assets"],
                                source=self.source_name,
                            ))

                    # Commit in batches of 100
                    if stats["processed"] % 100 == 0:
                        await session.commit()

                except Exception as e:
                    stats["errors"] += 1
                    log_event("lok_dhaba_importer", f"Error importing row: {e}", level="ERROR", error=str(e))
                    await session.rollback()

            # Final commit
            await session.commit()

            # Update import log
            if self.import_log:
                self.import_log.politicians_processed = stats["processed"]
                self.import_log.politicians_created = stats["politicians_created"]
                self.import_log.politicians_updated = stats["politicians_updated"]
            await self.finish_import_log(session, status="Completed" if stats["errors"] == 0 else "Partial")

        log_event("lok_dhaba_importer", f"Lok Dhaba Import Complete: {stats}", level="INFO")
        return stats
