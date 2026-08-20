"""
Job Registry & Scheduler Daemon
Initializes and registers APScheduler background jobs.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from utils.logger import log_event
from .cron_jobs import (
    update_ecourts_case_status,
    update_news_mentions,
    update_sansad_attendance,
    recalculate_all_scores_job,
)


def create_pipeline_scheduler() -> AsyncIOScheduler:
    """
    Creates and schedules all automated data pipeline cron jobs.
    """
    scheduler = AsyncIOScheduler()

    # 1. Daily eCourts Sync (02:00 IST)
    scheduler.add_job(
        update_ecourts_case_status,
        trigger=CronTrigger(hour=2, minute=0, timezone="Asia/Kolkata"),
        id="daily_ecourts_sync",
        name="Daily eCourts Case Status Sync",
        replace_existing=True,
    )

    # 2. Daily Google News Stream Sync (02:30 IST)
    scheduler.add_job(
        update_news_mentions,
        trigger=CronTrigger(hour=2, minute=30, timezone="Asia/Kolkata"),
        id="daily_news_sync",
        name="Daily Google News RSS Sync",
        replace_existing=True,
    )

    # 3. Weekly Sansad MPs Performance Sync (Monday 03:00 IST)
    scheduler.add_job(
        update_sansad_attendance,
        trigger=CronTrigger(day_of_week="mon", hour=3, minute=0, timezone="Asia/Kolkata"),
        id="weekly_sansad_sync",
        name="Weekly Sansad.in MP Performance Sync",
        replace_existing=True,
    )

    # 4. Weekly VERDICT Score Recalculation (Monday 04:00 IST)
    scheduler.add_job(
        recalculate_all_scores_job,
        trigger=CronTrigger(day_of_week="mon", hour=4, minute=0, timezone="Asia/Kolkata"),
        id="weekly_score_recalculation",
        name="Weekly VERDICT Score Recalculation",
        replace_existing=True,
    )

    log_event("scheduler", "Registered 4 automated cron jobs (Daily eCourts, Daily News, Weekly Sansad, Weekly Scores)", level="INFO")
    return scheduler
