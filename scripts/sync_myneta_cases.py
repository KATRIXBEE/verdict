import os
import sys
import re
import json
import sqlite3
import unicodedata
import requests
from bs4 import BeautifulSoup

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data-pipeline", "verdict_pipeline.db")
CACHE_FILE = os.path.join(BASE_DIR, "scripts", "data", "myneta_winners_2024.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    text = re.sub(r'[\(\[].*?[\)\]]', '', text)
    text = re.sub(r'\b(adv|advocate|dr|prof|smt|shri|mr|ms|alias|kunwar|choudhary|chaudhary|yadav|singh|sharma|patel|kumar)\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return ' '.join(text.lower().split())

def run_step_a():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM criminal_cases")
    cnt_cases = c.fetchone()[0]
    c.execute("SELECT COUNT(DISTINCT politician_id) FROM criminal_cases")
    cnt_pols = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM politicians WHERE criminal_case_count > 0")
    cnt_with_count = c.fetchone()[0]
    conn.close()
    
    print("=" * 60)
    print("STEP A: Current State of Criminal Cases:")
    print("=" * 60)
    print(f"1. Total criminal cases: {cnt_cases}")
    print(f"2. Distinct politicians with cases in criminal_cases table: {cnt_pols}")
    print(f"3. Politicians where criminal_case_count > 0: {cnt_with_count}")
    print("=" * 60)
    return cnt_cases, cnt_pols, cnt_with_count

def fetch_myneta_2024_winners():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                winners = json.load(f)
            print(f"Loaded {len(winners)} MyNeta 2024 winners from cache.")
            return winners
        except Exception:
            pass

    print("Fetching full MyNeta Lok Sabha 2024 winners list...")
    url = "https://myneta.info/LokSabha2024/index.php?action=show_winners&sort=default"
    r = requests.get(url, headers=HEADERS, timeout=20)
    if r.status_code != 200:
        print("Failed to fetch MyNeta winners page.")
        return []

    soup = BeautifulSoup(r.text, 'html.parser')
    winners = []
    for t in soup.find_all('table'):
        rows = t.find_all('tr')
        if len(rows) > 50:
            for row in rows[1:]:
                tds = row.find_all('td')
                if len(tds) >= 7:
                    # Cols: Sno, Candidate, Constituency, Party, Criminal Case, Education, Total Assets, Liabilities
                    cand_link = tds[1].find('a')
                    cand_name = tds[1].get_text(strip=True)
                    cand_url = cand_link['href'] if cand_link and 'href' in cand_link.attrs else None
                    if cand_url and not cand_url.startswith('http'):
                        cand_url = f"https://myneta.info/LokSabha2024/{cand_url.lstrip('/')}"
                    
                    constituency = tds[2].get_text(strip=True)
                    party = tds[3].get_text(strip=True)
                    crime_str = tds[4].get_text(strip=True)
                    edu = tds[5].get_text(strip=True)
                    assets_str = tds[6].get_text(strip=True)
                    liab_str = tds[7].get_text(strip=True) if len(tds) > 7 else ""
                    
                    try:
                        crime_count = int(crime_str)
                    except:
                        crime_count = 0

                    winners.append({
                        "name": cand_name,
                        "url": cand_url,
                        "constituency": constituency,
                        "party": party,
                        "criminal_case_count": crime_count,
                        "education": edu,
                        "assets_str": assets_str,
                        "liabilities_str": liab_str
                    })

    print(f"Scraped {len(winners)} winners from MyNeta Lok Sabha 2024.")
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(winners, f, ensure_ascii=False, indent=2)
    return winners

def sync_cases_and_politicians():
    winners = fetch_myneta_2024_winners()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT id, name, current_constituency, current_state FROM politicians")
    db_pols = c.fetchall()

    print(f"\nMatching {len(db_pols)} politicians with MyNeta 2024 winners...")
    matched = 0
    updated_cases = 0

    for pol_id, name, constituency, state in db_pols:
        norm_name = normalize_text(name)
        norm_const = normalize_text(constituency or "")

        best_winner = None
        for w in winners:
            w_name = normalize_text(w["name"])
            w_const = normalize_text(w["constituency"])

            if norm_name and w_name:
                if norm_name == w_name or (norm_const and w_const and norm_const == w_const and (norm_name in w_name or w_name in norm_name)):
                    best_winner = w
                    break
                elif norm_name in w_name or w_name in norm_name:
                    if not best_winner:
                        best_winner = w

        if best_winner:
            matched += 1
            case_cnt = best_winner["criminal_case_count"]
            
            # Check worst case severity
            c.execute("SELECT severity FROM criminal_cases WHERE politician_id = ?", (pol_id,))
            severities = [r[0] for r in c.fetchall()]
            
            worst_sev = None
            if 'Severe' in severities or 'severe' in severities:
                worst_sev = 'Severe'
            elif 'Serious' in severities or 'serious' in severities:
                worst_sev = 'Serious'
            elif 'Moderate' in severities or 'moderate' in severities:
                worst_sev = 'Moderate'
            elif 'Minor' in severities or 'minor' in severities:
                worst_sev = 'Minor'
            elif case_cnt > 0:
                worst_sev = 'Moderate'  # standard default for active charges if detailed list not yet parsed

            # If case_cnt is 0, confirmed clean
            c.execute("""
                UPDATE politicians
                SET criminal_case_count = ?, worst_case_severity = ?
                WHERE id = ?
            """, (case_cnt, worst_sev, pol_id))

            if case_cnt > 0:
                updated_cases += 1
        else:
            # Check existing criminal_cases table for this politician
            c.execute("SELECT COUNT(*), severity FROM criminal_cases WHERE politician_id = ? GROUP BY severity", (pol_id,))
            rows = c.fetchall()
            if rows:
                total_c = sum(r[0] for r in rows)
                c.execute("UPDATE politicians SET criminal_case_count = ? WHERE id = ?", (total_c, pol_id))

    conn.commit()

    # Step B: Formal UPDATE SQL as requested in prompt
    c.execute("""
        UPDATE politicians
        SET 
          criminal_case_count = COALESCE((
            SELECT COUNT(*) FROM criminal_cases cc 
            WHERE cc.politician_id = politicians.id
          ), politicians.criminal_case_count),
          worst_case_severity = COALESCE((
            SELECT severity FROM criminal_cases cc
            WHERE cc.politician_id = politicians.id
            ORDER BY CASE severity
              WHEN 'Severe' THEN 1
              WHEN 'Serious' THEN 2  
              WHEN 'Moderate' THEN 3
              WHEN 'Minor' THEN 4
              ELSE 5 END
            LIMIT 1
          ), politicians.worst_case_severity)
        WHERE (SELECT COUNT(*) FROM criminal_cases WHERE politician_id = politicians.id) > 0
    """)
    conn.commit()

    # Step C: Verification query
    print("\n" + "=" * 60)
    print("STEP C: Verification of criminal_case_count distribution:")
    print("=" * 60)
    c.execute("""
        SELECT criminal_case_count, COUNT(*) 
        FROM politicians 
        GROUP BY criminal_case_count 
        ORDER BY criminal_case_count
    """)
    results = c.fetchall()
    for cnt, num in results:
        label = "Null/No data" if cnt is None else f"{cnt} cases"
        print(f"  {label:<15}: {num} politicians")

    c.execute("SELECT COUNT(*) FROM politicians WHERE criminal_case_count > 0")
    total_with_cases = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM politicians WHERE criminal_case_count = 0")
    total_clean = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM politicians WHERE criminal_case_count IS NULL")
    total_null = c.fetchone()[0]

    print("-" * 60)
    print(f"Total with criminal cases (> 0): {total_with_cases}")
    print(f"Total confirmed clean (= 0):    {total_clean}")
    print(f"Total unimported / null:        {total_null}")
    print("=" * 60)
    conn.close()

if __name__ == "__main__":
    run_step_a()
    sync_cases_and_politicians()
