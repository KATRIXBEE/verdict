import json
import os
import sys
import asyncio

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "data-pipeline"))

from sqlalchemy import select, update, text
from utils.db import init_db, get_db_session
from utils.models import Politician, ParliamentaryPerformance
from enrichers.score_calculator import ScoreCalculator

FAKE_ATTENDANCE = {86.5, 89.5, 92.5, 95.5}

async def main():
    print("=" * 60)
    print("VERDICT — Score & Attendance Data Fixer")
    print("=" * 60)

    await init_db()

    # 1. Reset fake attendance in DB
    cleaned_db_count = 0
    async with get_db_session() as session:
        stmt = select(ParliamentaryPerformance)
        recs = (await session.execute(stmt)).scalars().all()
        for r in recs:
            if r.attendance_percent is not None and float(r.attendance_percent) in FAKE_ATTENDANCE:
                r.attendance_percent = None
                cleaned_db_count += 1
        await session.commit()
    print(f"Cleaned {cleaned_db_count} fake attendance records in DB")

    # 2. Reset fake attendance in src/data/all-mps.json
    all_mps_path = os.path.join(BASE_DIR, "src", "data", "all-mps.json")
    if os.path.exists(all_mps_path):
        with open(all_mps_path, "r", encoding="utf-8") as f:
            all_mps = json.load(f)
        
        cleaned_json_count = 0
        for mp in all_mps:
            att = mp.get("attendancePercentage")
            if att is not None and float(att) in FAKE_ATTENDANCE:
                mp["attendancePercentage"] = None
                cleaned_json_count += 1
        
        with open(all_mps_path, "w", encoding="utf-8") as f:
            json.dump(all_mps, f, ensure_ascii=False, indent=2)
        print(f"Cleaned {cleaned_json_count} fake attendance records in all-mps.json")

    # 3. Recalculate all scores in DB
    calc = ScoreCalculator()
    stats = await calc.calculate_all_scores()

    print("\n" + "=" * 60)
    print("SCORE RECALCULATION AUDIT")
    print("=" * 60)
    print(f"Total Evaluated:          {stats['processed']}")
    print(f"Average VERDICT Score:    {stats['average_score']} / 10.0")
    print(f"Average Completeness:     {stats['average_completeness']}%")
    print(f"Score Distribution:")
    for band, count in stats["distribution"].items():
        print(f"  • {band}: {count}")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
