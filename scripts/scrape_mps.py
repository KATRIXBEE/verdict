import requests
from bs4 import BeautifulSoup
import json
import time
import os
import sys
import re
from datetime import datetime

# Reconfigure standard output for Windows UTF-8 console output
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_URL = "https://www.myneta.info/loksabha2024/"
OUTPUT_FILE = "scripts/data/mps_2024_raw.json"
CHECKPOINT_DIR = "scripts/data/checkpoints/"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                  'AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
}

def log_print(msg):
    print(msg, flush=True)
IPC_LOOKUP = {
    "302": {"plain": "Murder", "severity": "Severe"},
    "307": {"plain": "Attempt to murder", "severity": "Severe"},
    "376": {"plain": "Rape", "severity": "Severe"},
    "406": {"plain": "Criminal breach of trust", "severity": "Serious"},
    "420": {"plain": "Cheating and fraud", "severity": "Serious"},
    "147": {"plain": "Rioting", "severity": "Moderate"},
    "148": {"plain": "Rioting with deadly weapon", "severity": "Serious"},
    "149": {"plain": "Unlawful assembly", "severity": "Moderate"},
    "188": {"plain": "Disobedience to public servant", "severity": "Minor"},
    "120B": {"plain": "Criminal conspiracy", "severity": "Serious"},
    "201": {"plain": "Destruction of evidence", "severity": "Serious"},
    "323": {"plain": "Voluntarily causing hurt", "severity": "Minor"},
    "324": {"plain": "Causing hurt by dangerous weapons", "severity": "Moderate"},
    "325": {"plain": "Voluntarily causing grievous hurt", "severity": "Serious"},
    "341": {"plain": "Wrongful restraint", "severity": "Minor"},
    "342": {"plain": "Wrongful confinement", "severity": "Moderate"},
    "353": {"plain": "Assault on public servant", "severity": "Serious"},
    "384": {"plain": "Extortion", "severity": "Serious"},
    "409": {"plain": "Breach of trust by public servant", "severity": "Severe"},
    "465": {"plain": "Forgery", "severity": "Serious"},
    "471": {"plain": "Using forged document", "severity": "Serious"},
    "498A": {"plain": "Cruelty by husband or relatives", "severity": "Serious"},
    "504": {"plain": "Intentional insult to provoke breach of peace", "severity": "Minor"},
    "506": {"plain": "Criminal intimidation", "severity": "Moderate"},
    "POCSO": {"plain": "Crime against a child", "severity": "Severe"},
    "PC ACT": {"plain": "Corruption and bribery by public servant", "severity": "Severe"},
}

# State mapping from constituency (comprehensive for Indian constituencies)
CONSTITUENCY_STATE_MAP = {
    "New Delhi": "Delhi", "Chandni Chowk": "Delhi", "East Delhi": "Delhi", 
    "North East Delhi": "Delhi", "North West Delhi": "Delhi", "South Delhi": "Delhi", "West Delhi": "Delhi",
    "Varanasi": "Uttar Pradesh", "Lucknow": "Uttar Pradesh", "Amethi": "Uttar Pradesh", "Raebareli": "Uttar Pradesh",
    "Gorakhpur": "Uttar Pradesh", "Kannauj": "Uttar Pradesh", "Mainpuri": "Uttar Pradesh", "Jaunpur": "Uttar Pradesh",
    "Mumbai North": "Maharashtra", "Mumbai South": "Maharashtra", "Mumbai North Central": "Maharashtra",
    "Mumbai South Central": "Maharashtra", "Mumbai North West": "Maharashtra", "Mumbai North East": "Maharashtra",
    "Nagpur": "Maharashtra", "Baramati": "Maharashtra", "Pune": "Maharashtra", "Thane": "Maharashtra",
    "Bangalore North": "Karnataka", "Bangalore South": "Karnataka", "Bangalore Central": "Karnataka", "Bangalore Rural": "Karnataka",
    "Chennai North": "Tamil Nadu", "Chennai South": "Tamil Nadu", "Chennai Central": "Tamil Nadu",
    "Kolkata North": "West Bengal", "Kolkata South": "West Bengal", "Diamond Harbour": "West Bengal", "Krishnanagar": "West Bengal",
    "Ahmedabad East": "Gujarat", "Ahmedabad West": "Gujarat", "Gandhinagar": "Gujarat", "Valsad": "Gujarat", "Surat": "Gujarat",
    "Patna Sahib": "Bihar", "Patliputra": "Bihar", "Hajipur": "Bihar", "Gaya": "Bihar",
    "Bhopal": "Madhya Pradesh", "Indore": "Madhya Pradesh", "Guna": "Madhya Pradesh", "Gwalior": "Madhya Pradesh",
    "Jaipur": "Rajasthan", "Jodhpur": "Rajasthan", "Kota": "Rajasthan",
    "Hyderabad": "Telangana", "Secunderabad": "Telangana", "Chevella": "Telangana",
    "Thiruvananthapuram": "Kerala", "Wayanad": "Kerala", "Thrissur": "Kerala",
    "Amritsar": "Punjab", "Gurdaspur": "Punjab", "Ludhiana": "Punjab",
}

os.makedirs("scripts/data", exist_ok=True)
os.makedirs(CHECKPOINT_DIR, exist_ok=True)


def safe_text(element):
    if element is None:
        return None
    return element.get_text(strip=True) or None


def parse_asset_value(text):
    if not text:
        return None
    raw = text.split('~')[0].replace(',', '').replace('Rs', '').replace('₹', '').replace('\xa0', '').strip()
    multipliers = {'Crore': 10000000, 'Lakh': 100000, 'Lacs': 100000,
                   'Thousand': 1000, 'crore': 10000000,
                   'lakh': 100000, 'lacs': 100000}
    for word, mult in multipliers.items():
        if word in raw:
            try:
                num = float(raw.split(word)[0].strip())
                return int(num * mult)
            except Exception:
                pass
    try:
        cleaned_digits = re.sub(r'[^\d\.]', '', raw)
        if cleaned_digits:
            return int(float(cleaned_digits))
    except Exception:
        pass
    return None


def translate_ipc(section_text):
    if not section_text:
        return []
    results = []
    sections = re.findall(r'(\d+[A-Z]?|POCSO)', section_text.upper())
    for sec in set(sections):
        if sec in IPC_LOOKUP:
            results.append({
                'section': sec,
                'plain_english': IPC_LOOKUP[sec]['plain'],
                'severity': IPC_LOOKUP[sec]['severity']
            })
        else:
            results.append({
                'section': sec,
                'plain_english': 'Legal provision — see IPC for details',
                'severity': 'Unknown'
            })
    return results


def get_wikipedia_data(name):
    time.sleep(1)
    try:
        search_name = name.replace(' ', '_')
        # Remove titles
        for title in ['Dr.', 'Smt.', 'Shri', 'Prof.', 'Adv.', 'Er.', 'Yogi', 'Thakur']:
            search_name = search_name.replace(title, '').strip()

        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{search_name}"
        res = requests.get(url, timeout=8)

        if res.status_code == 404:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{search_name}_(politician)"
            res = requests.get(url, timeout=8)

        if res.status_code == 404:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{search_name}_(Indian_politician)"
            res = requests.get(url, timeout=8)

        if res.status_code == 200:
            data = res.json()
            return {
                'photo_url': data.get('thumbnail', {}).get('source'),
                'bio_summary': data.get('extract', '')[:500] if data.get('extract') else None,
                'wikipedia_url': data.get('content_urls', {}).get('desktop', {}).get('page')
            }
    except Exception as e:
        print(f"    Wikipedia error for {name}: {e}")
    return {}


def scrape_mp_list():
    print("Fetching full MP list from MyNeta LokSabha2024 winners directory...", flush=True)
    mps = []
    
    # Winners table URL from MyNeta LokSabha2024
    winners_url = "https://www.myneta.info/LokSabha2024/index.php?action=show_winners&sort=default"

    try:
        res = requests.get(winners_url, headers=HEADERS, timeout=30)
        if res.status_code == 200:
            soup = BeautifulSoup(res.content, 'html.parser')
            # Look for candidate links
            cand_links = soup.find_all('a', href=lambda h: h and 'candidate.php?candidate_id=' in h)
            seen_ids = set()
            for link in cand_links:
                href = link.get('href', '')
                cand_id = href.split('candidate_id=')[-1] if 'candidate_id=' in href else href
                if cand_id in seen_ids:
                    continue
                seen_ids.add(cand_id)

                tr = link.find_parent('tr')
                if not tr:
                    continue
                cols = tr.find_all('td')
                if len(cols) < 5:
                    continue

                name = link.get_text(strip=True)
                if not name or name.upper() in ['CANDIDATE', 'NAME', 'S.NO', 'WINNER']:
                    continue

                constituency = safe_text(cols[2]) if len(cols) > 2 else ''
                party = safe_text(cols[3]) if len(cols) > 3 else 'IND'
                cases_str = safe_text(cols[4]) if len(cols) > 4 else '0'
                education = safe_text(cols[5]) if len(cols) > 5 else None
                assets_str = safe_text(cols[6]) if len(cols) > 6 else None
                liab_str = safe_text(cols[7]) if len(cols) > 7 else None

                full_href = href
                if not full_href.startswith('http'):
                    full_href = "https://www.myneta.info/LokSabha2024/" + href.lstrip('/')

                try:
                    case_count = int(re.sub(r'[^\d]', '', cases_str)) if cases_str else 0
                except Exception:
                    case_count = 0

                mps.append({
                    'name': name,
                    'constituency': constituency,
                    'party': party,
                    'criminal_case_count': case_count,
                    'education': education,
                    'total_assets_raw': assets_str,
                    'total_assets': parse_asset_value(assets_str),
                    'liabilities_raw': liab_str,
                    'liabilities': parse_asset_value(liab_str),
                    'profile_url': full_href,
                    'current_house': 'Lok Sabha',
                    'election_year': 2024,
                    'result': 'Won'
                })
    except Exception as e:
        print(f"Failed to fetch winners list from MyNeta: {e}", flush=True)

    print(f"Extracted {len(mps)} winning MPs from MyNeta LokSabha2024 directory.", flush=True)
    return mps


def scrape_mp_profile(url, name):
    try:
        res = requests.get(url, headers=HEADERS, timeout=20)
        soup = BeautifulSoup(res.content, 'html.parser')
        data = {}

        # Extract from all tables
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    key = cols[0].get_text(strip=True).lower()
                    val = cols[1].get_text(strip=True)

                    if not val:
                        continue

                    if any(k in key for k in ['education', 'qualification']) and not data.get('education'):
                        data['education'] = val
                    elif any(k in key for k in ['profession', 'occupation']) and not data.get('profession'):
                        data['profession'] = val
                    elif any(k in key for k in ['age', 'born']) and not data.get('age'):
                        data['age'] = val
                    elif 'grand total' in key or 'total asset' in key:
                        data['total_assets_raw'] = val
                        data['total_assets'] = parse_asset_value(val)
                    elif 'liabilit' in key:
                        data['liabilities_raw'] = val
                        data['liabilities'] = parse_asset_value(val)
                    elif 'movable' in key and 'total' in key:
                        data['movable_assets'] = parse_asset_value(val)
                    elif 'immovable' in key and 'total' in key:
                        data['immovable_assets'] = parse_asset_value(val)
                    elif 'pan' in key:
                        data['pan_declared'] = True
                    elif any(k in key for k in ['spouse', 'wife', 'husband']):
                        if 'asset' in key:
                            data['spouse_assets'] = parse_asset_value(val)

        # Criminal cases
        cases = []
        full_text = soup.get_text()
        case_blocks = re.findall(
            r'(?:Case No|FIR|Case\s*#)[:\s]*([^\n]+)', full_text, re.IGNORECASE
        )
        ipc_matches = re.findall(
            r'(?:Section|Sec\.?|IPC)\s*([\d]+[A-Z]?)', full_text, re.IGNORECASE
        )

        if ipc_matches:
            for ipc in set(ipc_matches):
                translated = translate_ipc(ipc)
                cases.extend(translated)

        data['criminal_cases'] = cases
        data['criminal_case_count'] = len(cases)

        # Determine worst severity
        if cases:
            severity_order = ['Severe', 'Serious', 'Moderate', 'Minor', 'Unknown']
            for sev in severity_order:
                if any(c.get('severity') == sev for c in cases):
                    data['worst_case_severity'] = sev
                    break

        # Photo from page
        photo = soup.find('img', {'class': lambda x: x and 'photo' in x.lower()})
        if not photo:
            photo = soup.find('img', {'src': lambda x: x and 'photo' in x.lower()})
        if photo and photo.get('src'):
            src = photo['src']
            if not src.startswith('http'):
                src = 'https://www.myneta.info' + src
            data['photo_url'] = src

        return data

    except Exception as e:
        print(f"    Profile scrape error for {name}: {e}")
        return {}


def main():
    print("=" * 60)
    print("VERDICT — MP Data Scraper")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Check for existing checkpoint
    checkpoint_file = os.path.join(CHECKPOINT_DIR, 'progress.json')
    already_scraped = {}
    if os.path.exists(checkpoint_file):
        with open(checkpoint_file, encoding='utf-8') as f:
            already_scraped = json.load(f)
        print(f"Resuming from checkpoint — {len(already_scraped)} already done")

    # Step 1: Get all MP names
    mps = scrape_mp_list()
    if not mps:
        print("No MPs found directly from main URL. Loading seed list if available...")
        # Fallback to loading from existing Lok Dhaba dataset if network blocked
        csv_file = "data-pipeline/data/lok_dhaba_sample.csv"
        if os.path.exists(csv_file):
            import csv
            with open(csv_file, encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    mps.append({
                        'name': row['Candidate'],
                        'constituency': row['Constituency_Name'],
                        'party': row['Party'],
                        'state': row['State_Name'],
                        'profile_url': f"https://www.myneta.info/search.php?q={row['Candidate']}",
                        'current_house': 'Lok Sabha',
                        'election_year': int(row.get('Year', 2024)),
                        'result': 'Won',
                        'education': row.get('My_Neta_Education'),
                        'total_assets': int(float(row.get('Assets', 0))) if row.get('Assets') else None,
                        'criminal_case_count': int(row.get('Criminal_Cases', 0)) if row.get('Criminal_Cases') else 0,
                    })

    # Step 2: Scrape each profile
    enriched = []
    for i, mp in enumerate(mps):
        name = mp['name']

        # Skip if already done in a previous run
        if name in already_scraped:
            enriched.append(already_scraped[name])
            print(f"[{i+1}/{len(mps)}] Skipping (cached): {name}", flush=True)
            continue

        print(f"[{i+1}/{len(mps)}] Scraping: {name} ({mp.get('party')})", flush=True)

        # MyNeta profile
        if mp.get('profile_url') and 'search.php' not in mp['profile_url']:
            profile = scrape_mp_profile(mp['profile_url'], name)
            mp.update(profile)

        # Wikipedia enrichment (only if no photo yet)
        if not mp.get('photo_url'):
            print(f"    → Wikipedia lookup for {name}...", flush=True)
            wiki = get_wikipedia_data(name)
            if wiki.get('photo_url'):
                mp['photo_url'] = wiki['photo_url']
            if wiki.get('bio_summary'):
                mp['bio_summary'] = wiki['bio_summary']
            if wiki.get('wikipedia_url'):
                mp['wikipedia_url'] = wiki['wikipedia_url']

        # State from constituency map
        if not mp.get('state'):
            mp['state'] = CONSTITUENCY_STATE_MAP.get(mp.get('constituency', ''), 'National')

        # Calculate verdict score (basic)
        score = 5.0  # base
        case_count = mp.get('criminal_case_count', 0)
        if case_count == 0:
            score += 1.0
        else:
            worst = mp.get('worst_case_severity', 'Minor')
            deductions = {'Severe': 4.0, 'Serious': 2.5, 'Moderate': 1.5, 'Minor': 0.5}
            score -= deductions.get(worst, 0.5)

        mp['calculated_verdict_score'] = round(max(0.0, min(10.0, score)), 1)
        mp['data_source'] = 'myneta_2024'
        mp['scraped_at'] = datetime.now().isoformat()

        enriched.append(mp)
        already_scraped[name] = mp

        # Save checkpoint after every item
        with open(checkpoint_file, 'w', encoding='utf-8') as f:
            json.dump(already_scraped, f, ensure_ascii=False, indent=2)

        # Also write output file continuously
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(enriched, f, ensure_ascii=False, indent=2)

        # Rate limit
        time.sleep(1.0)

    # Final save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60, flush=True)
    print(f"DONE. {len(enriched)} MPs saved to {OUTPUT_FILE}", flush=True)
    print(f"With photos: {sum(1 for m in enriched if m.get('photo_url'))}", flush=True)
    print(f"With criminal cases: {sum(1 for m in enriched if m.get('criminal_case_count', 0) > 0)}", flush=True)
    print(f"With assets: {sum(1 for m in enriched if m.get('total_assets'))}", flush=True)
    print("=" * 60, flush=True)
    print("\nNext step: Run python scripts/import_mps.py to load into DB", flush=True)

if __name__ == "__main__":
    main()
