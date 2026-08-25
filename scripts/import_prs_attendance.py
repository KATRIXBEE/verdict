import os
import sys
import re
import json
import time
import sqlite3
import unicodedata
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data-pipeline", "verdict_pipeline.db")
CACHE_FILE = os.path.join(BASE_DIR, "scripts", "data", "prs_mptrack_cache.json")
os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = re.sub(r'[\(\[].*?[\)\]]', '', text)  # remove parentheticals
    text = re.sub(r'\b(adv|advocate|dr|prof|smt|shri|mr|ms|alias|kunwar|choudhary|chaudhary|yadav|singh|sharma|patel|kumar)\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return ' '.join(text.lower().split())

def fetch_all_mp_slugs():
    print("=" * 60)
    print("STEP 1: Discovering all 18th Lok Sabha MPs on PRS India...")
    print("=" * 60)
    
    slugs = {}
    for p in range(1, 65):
        url = f"https://prsindia.org/mptrack?MpTrackSearch[loc_sabha]=18th-lok-sabha&page={p}&per-page=9"
        try:
            r = requests.get(url, headers=HEADERS, timeout=10)
            if r.status_code != 200:
                break
            soup = BeautifulSoup(r.text, 'html.parser')
            page_found = 0
            for a in soup.find_all('a', href=True):
                href = a['href']
                if '/mptrack/18th-lok-sabha/' in href and href != '/mptrack/18th-lok-sabha':
                    slug = href.split('/mptrack/18th-lok-sabha/')[1].strip()
                    name = a.get_text(strip=True)
                    if slug not in slugs:
                        slugs[slug] = name or slug
                        page_found += 1
                    elif not slugs[slug] and name:
                        slugs[slug] = name
            if page_found == 0 and p > 5:
                break
        except Exception as e:
            print(f"Error on page {p}: {e}")
            break
            
    print(f"Discovered {len(slugs)} MP profiles on PRS India.")
    return slugs

def scrape_mp_detail(slug):
    url = f"https://prsindia.org/mptrack/18th-lok-sabha/{slug}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=12)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # 1. Full name
        h1 = soup.find('h1')
        full_name = h1.get_text(strip=True) if h1 else slug.replace('-', ' ').title()
        
        # 2. State & PC from breadcrumb / personal profile if available
        state = None
        constituency = None
        for div in soup.find_all(['div', 'p', 'span']):
            txt = div.get_text(strip=True)
            if 'Constituency:' in txt or 'State:' in txt:
                # e.g. State: West Bengal | Constituency: Diamond Harbour
                parts = txt.split('|')
                for part in parts:
                    if 'State:' in part:
                        state = part.replace('State:', '').strip()
                    if 'Constituency:' in part:
                        constituency = part.replace('Constituency:', '').strip()
        
        # 3. Performance block
        attendance_percent = None
        debates_count = None
        questions_asked = None
        
        perf = soup.find(class_='parliamentary-performance-details')
        if perf:
            perf_text = perf.get_text(separator=' ', strip=True)
            
            # Attendance
            att_match = re.search(r'Attendance\s+Selected MP\s+([0-9\.]+|N/A|NA)', perf_text, re.IGNORECASE)
            if att_match:
                val = att_match.group(1).upper()
                if val not in ('N/A', 'NA'):
                    try:
                        attendance_percent = float(val)
                    except:
                        pass
            
            # Debates
            deb_match = re.search(r'Debates\s+Selected MP\s+([0-9]+)', perf_text, re.IGNORECASE)
            if deb_match:
                try:
                    debates_count = int(deb_match.group(1))
                except:
                    pass
                    
            # Questions
            q_match = re.search(r'Questions\s+Selected MP\s+([0-9]+)', perf_text, re.IGNORECASE)
            if q_match:
                try:
                    questions_asked = int(q_match.group(1))
                except:
                    pass

        # Check secondary attendance header if not found
        if attendance_percent is None:
            for h in soup.find_all(['h2', 'h3']):
                txt = h.get_text(strip=True)
                m = re.search(r'\(([0-9\.]+)%\s*Attendance\)', txt, re.IGNORECASE)
                if m:
                    try:
                        attendance_percent = float(m.group(1))
                    except:
                        pass
                    break

        return {
            "slug": slug,
            "name": full_name,
            "state": state,
            "constituency": constituency,
            "attendance_percent": attendance_percent,
            "debates_count": debates_count,
            "questions_asked": questions_asked,
        }
    except Exception as e:
        return None

def run_prs_import():
    # Load or scrape
    cache_data = {}
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            print(f"Loaded {len(cache_data)} cached PRS records.")
        except Exception:
            cache_data = {}

    slugs_dict = fetch_all_mp_slugs()
    to_scrape = [s for s in slugs_dict if s not in cache_data or cache_data[s].get('attendance_percent') is None]

    if to_scrape:
        print(f"Scraping detailed stats for {len(to_scrape)} MPs from PRS India...")
        completed = 0
        with ThreadPoolExecutor(max_workers=8) as executor:
            future_to_slug = {executor.submit(scrape_mp_detail, slug): slug for slug in to_scrape}
            for future in as_completed(future_to_slug):
                slug = future_to_slug[future]
                res = future.result()
                if res:
                    cache_data[slug] = res
                completed += 1
                if completed % 50 == 0 or completed == len(to_scrape):
                    print(f"  Scraped [{completed}/{len(to_scrape)}] MPs...")
                    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                        json.dump(cache_data, f, ensure_ascii=False, indent=2)

        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)

    # Match and update SQLite DB
    print("\n" + "=" * 60)
    print("STEP 2: Matching and updating database politicians with PRS metrics...")
    print("=" * 60)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT id, name, current_constituency, current_state FROM politicians")
    db_pols = c.fetchall()

    matched_count = 0
    with_attendance_count = 0
    null_attendance_count = 0
    total_attendance_sum = 0.0

    for pol_id, name, constituency, state in db_pols:
        norm_db_name = normalize_text(name)
        norm_db_const = normalize_text(constituency or "")
        
        # Best match in PRS data
        matched_prs = None
        for slug, prs_mp in cache_data.items():
            prs_name = normalize_text(prs_mp.get('name') or "")
            prs_const = normalize_text(prs_mp.get('constituency') or "")
            
            # Match 1: Exact normalized name match
            if norm_db_name and prs_name and (norm_db_name == prs_name or norm_db_name in prs_name or prs_name in norm_db_name):
                matched_prs = prs_mp
                break
            
            # Match 2: Slug match
            norm_slug = slug.replace('-', ' ')
            if norm_db_name and norm_slug and (norm_db_name in norm_slug or norm_slug in norm_db_name):
                matched_prs = prs_mp
                break

        if matched_prs:
            att = matched_prs.get("attendance_percent")
            q_cnt = matched_prs.get("questions_asked")
            deb_cnt = matched_prs.get("debates_count")

            c.execute("""
                UPDATE politicians 
                SET attendance_percent = ?, questions_asked = ?, debates_count = ?
                WHERE id = ?
            """, (att, q_cnt, deb_cnt, pol_id))

            matched_count += 1
            if att is not None:
                with_attendance_count += 1
                total_attendance_sum += att
            else:
                null_attendance_count += 1
        else:
            null_attendance_count += 1

    conn.commit()
    conn.close()

    avg_att = (total_attendance_sum / with_attendance_count) if with_attendance_count > 0 else 0.0

    print("=" * 60)
    print("SOURCE 1 (PRS ATTENDANCE) IMPORT SUMMARY:")
    print("=" * 60)
    print(f"Total Politicians Matched:       {matched_count} / {len(db_pols)}")
    print(f"Politicians with Attendance %:   {with_attendance_count}")
    print(f"Average Attendance %:            {avg_att:.1f}%")
    print(f"Politicians with Null (Ministers/NA): {null_attendance_count}")
    print("=" * 60)

if __name__ == "__main__":
    run_prs_import()
