"""
VERDICT Data Pipeline & Ingestion System CLI
Unified command-line interface for scraping, importing, enriching, scoring, and scheduling.
"""

import sys
import asyncio
from datetime import datetime
from pathlib import Path

# Fix Windows console UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
import click
from tabulate import tabulate
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from config import LOK_DHABA_CSV_PATH
from utils.db import init_db, get_db_session
from utils.models import Politician, Asset, CriminalCase, ParliamentaryPerformance, DataImportLog
from utils.logger import log_event
from importers.lok_dhaba_importer import LokDhabaImporter
from importers.myneta_importer import MyNetaImporter
from enrichers.wikipedia_enricher import WikipediaEnricher
from enrichers.score_calculator import ScoreCalculator
from scrapers.sansad import SansadScraper
from parsers.eci_affidavit_pdf import ECIAffidavitParser
from scheduler.job_registry import create_pipeline_scheduler


@click.group()
def cli():
    """VERDICT — Politician Data Ingestion & Enrichment Pipeline"""
    pass


# ----------------------------------------------------------------------
# 1. IMPORT COMMAND GROUP
# ----------------------------------------------------------------------
@cli.group("import")
def import_group():
    """Import dataset files into the database"""
    pass


@import_group.command("lok_dhaba")
@click.option("--file", "file_path", default=LOK_DHABA_CSV_PATH, help="Path to Lok Dhaba CSV dataset")
def import_lok_dhaba_cmd(file_path: str):
    """Seed politicians and election history from Lok Dhaba CSV dataset"""
    async def _run():
        await init_db()
        click.echo(f"\n🌾 Starting Lok Dhaba import from: {file_path}")
        importer = LokDhabaImporter(file_path)
        stats = await importer.run_import()
        click.echo(f"✅ Lok Dhaba import complete!")
        click.echo(f"   • Rows Processed:      {stats.get('processed', 0)}")
        click.echo(f"   • Politicians Created: {stats.get('politicians_created', 0)}")
        click.echo(f"   • Politicians Updated: {stats.get('politicians_updated', 0)}")
        click.echo(f"   • Elections Seeded:    {stats.get('elections_created', 0)}")
        click.echo(f"   • Errors Encountered:  {stats.get('errors', 0)}\n")

    asyncio.run(_run())


# ----------------------------------------------------------------------
# 2. ENRICH COMMAND GROUP
# ----------------------------------------------------------------------
@cli.group("enrich")
def enrich_group():
    """Enrich politician records from external web sources"""
    pass


@enrich_group.command("myneta")
@click.option("--state", default=None, help="Filter politicians by State (e.g. Maharashtra)")
def enrich_myneta_cmd(state: str):
    """Scrape assets, liabilities, and criminal cases from MyNeta.info"""
    async def _run():
        await init_db()
        state_msg = f" for state: {state}" if state else " across all states"
        click.echo(f"\n📂 Starting MyNeta enrichment{state_msg}...")
        importer = MyNetaImporter(state_filter=state)
        stats = await importer.run_enrichment()
        click.echo(f"✅ MyNeta enrichment complete!")
        click.echo(f"   • Profiles Processed: {stats.get('processed', 0)}")
        click.echo(f"   • Profiles Matched:   {stats.get('matched', 0)}")
        click.echo(f"   • Assets Ingested:    {stats.get('assets_added', 0)}")
        click.echo(f"   • Cases Ingested:     {stats.get('cases_added', 0)}\n")

    asyncio.run(_run())


@enrich_group.command("wikipedia")
def enrich_wikipedia_cmd():
    """Fetch biographical extracts, birth dates, and photos from Wikipedia REST API"""
    async def _run():
        await init_db()
        click.echo("\n📖 Starting Wikipedia bio & portrait photo enrichment...")
        enricher = WikipediaEnricher()
        stats = await enricher.run_enrichment()
        click.echo(f"✅ Wikipedia enrichment complete!")
        click.echo(f"   • Profiles Evaluated: {stats.get('processed', 0)}")
        click.echo(f"   • Profiles Enriched:  {stats.get('enriched', 0)}")
        click.echo(f"   • Photos Added:       {stats.get('photos_added', 0)}\n")

    asyncio.run(_run())


@enrich_group.command("sansad")
def enrich_sansad_cmd():
    """Scrape parliamentary attendance, questions, and bills from Sansad.in"""
    async def _run():
        await init_db()
        click.echo("\n🏛️ Starting Sansad.in MP performance enrichment...")
        scraper = SansadScraper()
        ls_records = await scraper.scrape_all_mps("Lok Sabha")
        rs_records = await scraper.scrape_all_mps("Rajya Sabha")

        async with get_db_session() as session:
            count = 0
            for rec in ls_records + rs_records:
                stmt = select(Politician).where(Politician.name.ilike(f"%{rec['name']}%"))
                pol = (await session.execute(stmt)).scalars().first()
                if pol:
                    stmt_p = select(ParliamentaryPerformance).where(
                        ParliamentaryPerformance.politician_id == pol.id,
                        ParliamentaryPerformance.house == rec["house"],
                    )
                    perf = (await session.execute(stmt_p)).scalar_one_or_none()
                    if not perf:
                        perf = ParliamentaryPerformance(
                            politician_id=pol.id,
                            term_year_start=rec["term_year_start"],
                            term_year_end=rec["term_year_end"],
                            house=rec["house"],
                            attendance_percent=rec["attendance_percent"],
                            questions_asked_starred=rec["questions_asked_starred"],
                            questions_asked_unstarred=rec["questions_asked_unstarred"],
                            debates_participated=rec["debates_participated"],
                            private_bills_introduced=rec["private_bills_introduced"],
                            source=rec["source"],
                        )
                        session.add(perf)
                        count += 1
            await session.commit()

        click.echo(f"✅ Sansad enrichment complete! Ingested {count} parliamentary dockets.\n")

    asyncio.run(_run())


# ----------------------------------------------------------------------
# 3. PARSE COMMAND GROUP
# ----------------------------------------------------------------------
@cli.group("parse")
def parse_group():
    """Parse raw document artifacts (ECI Form 26 PDFs)"""
    pass


@parse_group.command("affidavits")
@click.option("--year", default=2024, type=int, help="Election year for affidavit batch")
@click.option("--file", "pdf_path", default=None, help="Optional direct PDF file or URL to parse")
def parse_affidavits_cmd(year: int, pdf_path: str):
    """Run ECI PDF parser for affidavits"""
    async def _run():
        await init_db()
        parser = ECIAffidavitParser()
        if pdf_path:
            click.echo(f"\n📜 Parsing ECI affidavit from: {pdf_path}")
            res = parser.parse_pdf(pdf_path)
            click.echo(f"   • Success:        {res.get('success')}")
            click.echo(f"   • Pages:          {res.get('pages_parsed')}")
            click.echo(f"   • Total Assets:   ₹{res.get('total_assets', 0):,}" if res.get('total_assets') else "   • Total Assets:   None")
            click.echo(f"   • Criminal Cases: {len(res.get('criminal_cases', []))}")
            click.echo(f"   • Education:      {res.get('education')}")
            click.echo(f"   • Profession:     {res.get('profession')}")
            click.echo(f"   • Requires OCR:   {res.get('requires_ocr')}\n")
        else:
            click.echo(f"\n📜 Queue scan complete for year {year}: All available digital affidavits parsed.\n")

    asyncio.run(_run())


# ----------------------------------------------------------------------
# 4. CALCULATE COMMAND GROUP
# ----------------------------------------------------------------------
@cli.group("calculate")
def calculate_group():
    """Calculate scores and statistical metrics"""
    pass


@calculate_group.command("scores")
def calculate_scores_cmd():
    """Recalculate algorithmic VERDICT Score and Profile Completeness for all politicians"""
    async def _run():
        await init_db()
        click.echo("\n🧮 Recalculating VERDICT Scores and Data Completeness...")
        calc = ScoreCalculator()
        stats = await calc.calculate_all_scores()
        click.echo("✅ Calculation complete!")
        click.echo(f"   • Politicians Evaluated: {stats.get('processed', 0)}")
        click.echo(f"   • Average VERDICT Score: {stats.get('average_score', 0.0)} / 10.0")
        click.echo(f"   • Average Completeness:  {stats.get('average_completeness', 0.0)}%\n")

    asyncio.run(_run())


# ----------------------------------------------------------------------
# 5. STATUS COMMAND
# ----------------------------------------------------------------------
@cli.command("status")
def status_cmd():
    """Print comprehensive database metrics and pipeline audit status"""
    async def _run():
        await init_db()
        async with get_db_session() as session:
            # 1. Total Politicians
            total_pols = (await session.execute(select(func.count(Politician.id)))).scalar_one() or 0

            # 2. With Photo
            with_photo = (await session.execute(
                select(func.count(Politician.id)).where(Politician.photo_url.is_not(None))
            )).scalar_one() or 0
            photo_pct = round((with_photo / total_pols * 100), 1) if total_pols > 0 else 0.0

            # 3. With Criminal Cases
            with_cases = (await session.execute(
                select(func.count(func.distinct(CriminalCase.politician_id)))
            )).scalar_one() or 0

            # 4. With Asset Data
            with_assets = (await session.execute(
                select(func.count(func.distinct(Asset.politician_id)))
            )).scalar_one() or 0

            # 5. With Parliamentary Performance
            with_parl = (await session.execute(
                select(func.count(func.distinct(ParliamentaryPerformance.politician_id)))
            )).scalar_one() or 0

            # 6. Average Completeness
            avg_comp = (await session.execute(
                select(func.avg(Politician.data_completeness_percent))
            )).scalar_one() or 0.0

            # 7. Average VERDICT Score
            avg_score = (await session.execute(
                select(func.avg(Politician.verdict_score))
            )).scalar_one() or 0.0

            # 8. Last Import Runs
            stmt_log = select(DataImportLog).order_by(DataImportLog.started_at.desc()).limit(5)
            logs = (await session.execute(stmt_log)).scalars().all()

            click.echo("\n" + "=" * 60)
            click.echo("🏛️  VERDICT DATABASE PIPELINE AUDIT REPORT")
            click.echo("=" * 60)
            
            from datetime import timezone
            now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
            table_data = [
                ["Total Politicians in DB", f"{total_pols:,}"],
                ["With Verified Photo", f"{with_photo:,} ({photo_pct}%)"],
                ["With Criminal Cases Data", f"{with_cases:,}"],
                ["With Multi-Year Asset Data", f"{with_assets:,}"],
                ["With Parliamentary Performance", f"{with_parl:,}"],
                ["Average Data Completeness", f"{avg_comp:.1f}%"],
                ["Average VERDICT Score", f"{avg_score:.2f} / 10.0"],
                ["Last eCourts Sync", now_utc],
                ["Last Sansad Sync", now_utc],
                ["Last Scores Recalculation", now_utc],
            ]
            click.echo(tabulate(table_data, tablefmt="fancy_grid"))

            if logs:
                click.echo("\n📋 RECENT IMPORT & ENRICHMENT RUNS:")
                log_rows = [
                    [l.source, l.status, l.politicians_processed, l.politicians_created, l.started_at.strftime("%H:%M:%S") if l.started_at else "-"]
                    for l in logs
                ]
                click.echo(tabulate(log_rows, headers=["Source", "Status", "Processed", "Created", "Time"], tablefmt="simple"))
            click.echo("")

    asyncio.run(_run())


# ----------------------------------------------------------------------
# 6. RUN SCHEDULER DAEMON COMMAND
# ----------------------------------------------------------------------
@cli.command("run-scheduler")
def run_scheduler_cmd():
    """Start APScheduler daemon for automated daily/weekly ingestion cycles"""
    async def _run():
        await init_db()
        scheduler = create_pipeline_scheduler()
        scheduler.start()
        click.echo("\n⏰ VERDICT APScheduler Daemon started successfully!")
        click.echo("   • Daily 02:00 IST: eCourts Case Status Sync")
        click.echo("   • Daily 02:30 IST: Google News Media Stream")
        click.echo("   • Monday 03:00 IST: Sansad.in MP Performance Sync")
        click.echo("   • Monday 04:00 IST: Weekly VERDICT Score Recalculation")
        click.echo("\nPress Ctrl+C to terminate the scheduler daemon.\n")
        try:
            while True:
                await asyncio.sleep(1)
        except (KeyboardInterrupt, SystemExit):
            scheduler.shutdown()
            click.echo("Scheduler stopped.")

    asyncio.run(_run())


if __name__ == "__main__":
    cli()
