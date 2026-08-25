import os
import sys
import sqlite3

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data-pipeline", "verdict_pipeline.db")

def run_asset_growth_calculation():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    print("=" * 60)
    print("SOURCE 4: Multi-Year Asset Growth Check & Calculation")
    print("=" * 60)

    # Query multi-year assets in DB
    c.execute("""
        SELECT politician_id, COUNT(DISTINCT election_year) as years
        FROM assets
        GROUP BY politician_id
        HAVING years > 1
        ORDER BY years DESC
        LIMIT 10
    """)
    multi_year_rows = c.fetchall()
    print(f"Politicians with >= 2 distinct election years in assets table: {len(multi_year_rows)}")
    for r in multi_year_rows:
        print(f"  Politician ID: {r[0]} | Years count: {r[1]}")

    # Run SQL update for asset_growth_percent
    c.execute("""
        UPDATE politicians
        SET asset_growth_percent = (
          SELECT ROUND(
            (CAST(a_latest.total_assets AS REAL) - a_earliest.total_assets) / a_earliest.total_assets * 100.0, 1
          )
          FROM
            (SELECT total_assets FROM assets 
             WHERE politician_id = politicians.id 
             AND total_assets > 0
             ORDER BY election_year DESC LIMIT 1) a_latest,
            (SELECT total_assets FROM assets 
             WHERE politician_id = politicians.id 
             AND total_assets > 0
             ORDER BY election_year ASC LIMIT 1) a_earliest
        )
        WHERE (
          SELECT COUNT(DISTINCT election_year) FROM assets 
          WHERE politician_id = politicians.id AND total_assets > 0
        ) >= 2
    """)
    conn.commit()

    c.execute("SELECT COUNT(*) FROM politicians WHERE asset_growth_percent IS NOT NULL")
    updated_cnt = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM politicians WHERE asset_growth_percent IS NULL")
    null_cnt = c.fetchone()[0]

    print(f"\nPoliticians with calculated asset growth: {updated_cnt}")
    print(f"Politicians with null asset growth (single-term / neutral): {null_cnt}")
    print("=" * 60)

    conn.close()

if __name__ == "__main__":
    run_asset_growth_calculation()
