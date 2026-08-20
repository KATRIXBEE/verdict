"""
Scheduler Cron Job Definitions
Asynchronous scheduled maintenance routines for eCourts, Sansad, Google News, and Score calculations.
"""

from datetime import datetime, timedelta
from sqlalchemy import select
from utils.models import Politician, CriminalCase, NewsMention, ParliamentaryPerformance
from utils.db import get_db_session
from utils.logger import log_event
from scrapers.ecourts import ECourtsScraper
from scrapers.sansad import SansadScraper
from scrapers.google_news import GoogleNewsScraper
from enrichers.score_calculator import ScoreCalculator


async def update_ecourts_case_status() -> None:
    """
    Daily Job (02:00 IST):
    Updates case status and hearing dates for active criminal dockets.
    """
    log_event("cron", "Starting daily eCourts case status sync...", level="INFO")
    scraper = ECourtsScraper()
    cutoff = datetime.utcnow() - timedelta(hours=24)

    async with get_db_session() as session:
        stmt = select(CriminalCase).where(
            (CriminalCase.last_status_check.is_(None)) | (CriminalCase.last_status_check < cutoff)
        ).limit(100)
        cases = (await session.execute(stmt)).scalars().all()

        updated = 0
        for c in cases:
            res = await scraper.check_case_status(
                case_number=c.case_number,
                ecourts_case_id=c.ecourts_case_id,
                court_name=c.court_name,
            )
            if res:
                if res.get("current_status"):
                    c.current_status = res["current_status"]
                if res.get("next_hearing_date"):
                    c.next_hearing_date = res["next_hearing_date"]
                if res.get("presiding_judge"):
                    c.presiding_judge = res["presiding_judge"]
                c.last_status_check = datetime.utcnow()
                updated += 1

        await session.commit()
        log_event("cron", f"eCourts sync finished: updated {updated} of {len(cases)} cases", level="INFO")


async def update_news_mentions() -> None:
    """
    Daily Job (02:00 IST):
    Fetches latest 7 days of news mentions for elected officials and classifies sentiment.
    """
    log_event("cron", "Starting daily Google News media stream sync...", level="INFO")
    scraper = GoogleNewsScraper()

    async with get_db_session() as session:
        stmt = select(Politician).where(Politician.current_house.is_not(None)).limit(50)
        pols = (await session.execute(stmt)).scalars().all()

        total_added = 0
        for pol in pols:
            articles = await scraper.fetch_news_mentions(pol.name, days=7)
            for art in articles:
                stmt_url = select(NewsMention).where(NewsMention.url == art["url"])
                existing = (await session.execute(stmt_url)).scalar_one_or_none()
                if not existing:
                    session.add(NewsMention(
                        politician_id=pol.id,
                        headline=art["headline"],
                        source_name=art["source_name"],
                        url=art["url"],
                        published_date=art["published_date"],
                        sentiment=art["sentiment"],
                    ))
                    total_added += 1
            await session.commit()

        log_event("cron", f"Google News sync finished: added {total_added} new media mentions", level="INFO")


async def update_sansad_attendance() -> None:
    """
    Weekly Job (Monday 03:00 IST):
    Re-scrapes Sansad.in for Lok Sabha and Rajya Sabha MPs.
    """
    log_event("cron", "Starting weekly Sansad.in parliamentary performance sync...", level="INFO")
    scraper = SansadScraper()
    ls_mps = await scraper.scrape_all_mps("Lok Sabha")
    rs_mps = await scraper.scrape_all_mps("Rajya Sabha")

    async with get_db_session() as session:
        for rec in ls_mps + rs_mps:
            stmt_pol = select(Politician).where(Politician.name.ilike(f"%{rec['name']}%"))
            pol = (await session.execute(stmt_pol)).scalars().first()
            if pol:
                stmt_perf = select(ParliamentaryPerformance).where(
                    ParliamentaryPerformance.politician_id == pol.id,
                    ParliamentaryPerformance.term_year_start == rec["term_year_start"],
                    ParliamentaryPerformance.house == rec["house"],
                )
                perf = (await session.execute(stmt_perf)).scalar_one_or_none()
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
                else:
                    perf.attendance_percent = rec["attendance_percent"]
                    perf.questions_asked_starred = rec["questions_asked_starred"]
                    perf.questions_asked_unstarred = rec["questions_asked_unstarred"]
                    perf.debates_participated = rec["debates_participated"]
                    perf.last_updated = datetime.utcnow()
        await session.commit()
    log_event("cron", "Sansad sync finished.", level="INFO")


async def recalculate_all_scores_job() -> None:
    """
    Weekly Job (Monday 03:00 IST):
    Recalculates VERDICT Score and Completeness for all politicians.
    """
    log_event("cron", "Starting weekly algorithmic VERDICT Score recalculation...", level="INFO")
    calc = ScoreCalculator()
    await calc.calculate_all_scores()
    log_event("cron", "Score recalculation job complete.", level="INFO")
