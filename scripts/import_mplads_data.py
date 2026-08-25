import os
import sys
import csv
import re
import io
import json
import sqlite3
import unicodedata
import requests

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data-pipeline", "verdict_pipeline.db")
CACHE_CSV = os.path.join(BASE_DIR, "scripts", "data", "MPLADS_raw.csv")

MPLADS_CSV_URL = "https://raw.githubusercontent.com/Vonter/india-mplads-works/main/csv/MPLADS.csv"

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', str(text))
    text = re.sub(r'[\(\[].*?[\)\]]', '', text)
    text = re.sub(r'\b(adv|advocate|dr|prof|smt|shri|mr|ms|alias|kunwar|choudhary|chaudhary|yadav|singh|sharma|patel|kumar)\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return ' '.join(text.lower().split())

def fetch_or_load_mplads_csv():
    if os.path.exists(CACHE_CSV) and os.path.getsize(CACHE_CSV) > 1000000:
        print(f"Loaded MPLADS CSV from local cache ({os.path.getsize(CACHE_CSV) / 1024 / 1024:.1f} MB)...")
        with open(CACHE_CSV, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()

    print(f"Downloading MPLADS works dataset from {MPLADS_CSV_URL}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    r = requests.get(MPLADS_CSV_URL, headers=headers, timeout=60)
    if r.status_code == 200:
        with open(CACHE_CSV, 'w', encoding='utf-8', errors='replace') as f:
            f.write(r.text)
        print(f"Saved MPLADS CSV to cache ({len(r.content) / 1024 / 1024:.1f} MB).")
        return r.text
    else:
        raise Exception(f"Failed to download MPLADS CSV: HTTP {r.status_code}")

def run_mplads_import():
    print("=" * 60)
    print("SOURCE 5: Parsing and Importing MPLADS Utilisation Data")
    print("=" * 60)

    csv_text = fetch_or_load_mplads_csv()
    
    # Parse semicolon-delimited CSV
    # Headers: MP NAME;WORK;CATEGORY;STATE;CONSTITUENCY;IDA;CITY;WARD;BLOCK;VILLAGE;RECOMMENDED DATE;ALLOCATION AMOUNT;IDA APPROVAL;STATUS;HOUSE
    reader = csv.reader(io.StringIO(csv_text), delimiter=';')
    header = next(reader, None)
    
    mp_stats = {}
    total_records = 0

    for row in reader:
        if len(row) < 14:
            continue
        total_records += 1
        mp_name = row[0].strip()
        state = row[3].strip()
        constituency = row[4].strip()
        alloc_str = row[11].strip()
        status = row[13].strip()
        house = row[14].strip() if len(row) > 14 else ""

        try:
            alloc_amt = float(re.sub(r'[^\d\.]', '', alloc_str)) if alloc_str else 0.0
        except:
            alloc_amt = 0.0

        is_utilised = status.lower() in ('sanctioned', 'completed', 'in progress', 'work completed', 'finished')

        norm_name = normalize_text(mp_name)
        norm_const = normalize_text(constituency)

        key = (norm_name, norm_const)
        if key not in mp_stats:
            mp_stats[key] = {
                "name": mp_name,
                "constituency": constituency,
                "state": state,
                "house": house,
                "total_allocated": 0.0,
                "total_utilised": 0.0,
                "works_count": 0
            }

        mp_stats[key]["total_allocated"] += alloc_amt
        mp_stats[key]["works_count"] += 1
        if is_utilised:
            mp_stats[key]["total_utilised"] += alloc_amt

    print(f"Processed {total_records} project works across {len(mp_stats)} unique MP-constituency pairs.")

    # Match and update SQLite DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT id, name, current_constituency, current_state FROM politicians")
    db_pols = c.fetchall()

    matched_count = 0
    util_percents = []

    for pol_id, name, constituency, state in db_pols:
        norm_db_name = normalize_text(name)
        norm_db_const = normalize_text(constituency or "")

        best_match = None
        for (m_name, m_const), stats in mp_stats.items():
            if norm_db_name and m_name:
                if norm_db_name == m_name or (norm_db_const and m_const and norm_db_const == m_const and (norm_db_name in m_name or m_name in norm_db_name)):
                    best_match = stats
                    break
                elif norm_db_name in m_name or m_name in norm_db_name:
                    if not best_match:
                        best_match = stats

        if best_match and best_match["total_allocated"] > 0:
            alloc = best_match["total_allocated"]
            util = best_match["total_utilised"]
            util_pct = round((util / alloc) * 100.0, 1)

            c.execute("""
                UPDATE politicians
                SET mplads_allocated = ?, mplads_utilised = ?, mplads_utilisation_percent = ?
                WHERE id = ?
            """, (alloc, util, util_pct, pol_id))

            matched_count += 1
            util_percents.append((name, util_pct, alloc, util))
        else:
            # Leave null
            pass

    conn.commit()

    print("=" * 60)
    print("SOURCE 5 (MPLADS UTILISATION) IMPORT SUMMARY:")
    print("=" * 60)
    print(f"Total Politicians Matched with MPLADS: {matched_count} / {len(db_pols)}")
    if util_percents:
        avg_u = sum(u[1] for u in util_percents) / len(util_percents)
        print(f"Average MPLADS Utilisation %:          {avg_u:.1f}%")
        
        # Sort by utilisation %
        sorted_by_u = sorted(util_percents, key=lambda x: x[1], reverse=True)
        print("\nTop 3 MPs by MPLADS Utilisation:")
        for n, u, a, ut in sorted_by_u[:3]:
            print(f"  - {n:<30}: {u:.1f}% utilised (Rs {ut:,.0f} of Rs {a:,.0f})")
            
        print("\nLowest 3 MPs by MPLADS Utilisation:")
        for n, u, a, ut in sorted_by_u[-3:]:
            print(f"  - {n:<30}: {u:.1f}% utilised (Rs {ut:,.0f} of Rs {a:,.0f})")

    print("=" * 60)
    conn.close()

if __name__ == "__main__":
    run_mplads_import()
