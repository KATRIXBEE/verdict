"""
VERDICT — Comprehensive Photo Fetcher
Fetches real photos for every politician in the database.
Priority: Sansad.in → Rajya Sabha → Vidhan Sabha → MyNeta → Wikipedia (validated)
Uses the existing async SQLAlchemy DB client for all reads/writes.
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import os
import re
import sys
import asyncio
from urllib.parse import urljoin, quote
from pathlib import Path

# Add project root and data-pipeline to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
PIPELINE_DIR = PROJECT_ROOT / "data-pipeline"
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PIPELINE_DIR))

# UTF-8 console output for Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from config import DATABASE_URL
from utils.db import init_db, get_db_session
from utils.models import Politician
from sqlalchemy import select, update

# ── Paths ──────────────────────────────────────────────
CACHE_DIR = "scripts/data/photo_cache"
CHECKPOINT = "scripts/data/photo_checkpoint.json"
LOG_FILE = "scripts/data/photo_log.json"
FRONTEND_JSON = "src/data/all-mps.json"
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs("scripts/data", exist_ok=True)

# ── Headers ────────────────────────────────────────────
BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                  'AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-IN,en;q=0.9',
}

WIKI_HEADERS = {
    'User-Agent': 'VERDICT-CivicTech/1.0 (Educational; '
                  'katrixbee@gmail.com)'
}

# ── Wikipedia keyword validation ───────────────────────
POLITICIAN_KEYWORDS = [
    'politician', 'member of parliament', 'minister',
    'lok sabha', 'rajya sabha', 'legislative assembly',
    'chief minister', 'prime minister', 'member of the indian',
    'constituency', 'elected', 'parliament of india',
    'bharatiya janata', 'indian national congress',
    'political party', 'mla', 'rajya sabha member',
    'member of legislative', 'government of india',
    'union minister', 'cabinet minister', 'state minister',
]

# ── Wikipedia exact overrides for major politicians ────
WIKI_OVERRIDES = {
    "Narendra Modi": "Narendra_Modi",
    "Rahul Gandhi": "Rahul_Gandhi",
    "Amit Shah": "Amit_Shah",
    "Smriti Irani": "Smriti_Irani",
    "Rajnath Singh": "Rajnath_Singh",
    "Nirmala Sitharaman": "Nirmala_Sitharaman",
    "Yogi Adityanath": "Yogi_Adityanath",
    "Arvind Kejriwal": "Arvind_Kejriwal",
    "Mamata Banerjee": "Mamata_Banerjee",
    "Sonia Gandhi": "Sonia_Gandhi",
    "Priyanka Gandhi": "Priyanka_Gandhi_Vadra",
    "Akhilesh Yadav": "Akhilesh_Yadav",
    "Chandrababu Naidu": "N._Chandrababu_Naidu",
    "Nitish Kumar": "Nitish_Kumar",
    "Sharad Pawar": "Sharad_Pawar",
    "Omar Abdullah": "Omar_Abdullah_(politician)",
    "Farooq Abdullah": "Farooq_Abdullah",
    "Hemant Soren": "Hemant_Soren",
    "Asaduddin Owaisi": "Asaduddin_Owaisi",
    "Supriya Sule": "Supriya_Sule",
    "Chirag Paswan": "Chirag_Paswan",
    "Piyush Goyal": "Piyush_Goyal",
    "S. Jaishankar": "S._Jaishankar",
    "Dharmendra Pradhan": "Dharmendra_Pradhan",
    "Jyotiraditya Scindia": "Jyotiraditya_Scindia",
    "Shivraj Singh Chouhan": "Shivraj_Singh_Chouhan",
    "Devendra Fadnavis": "Devendra_Fadnavis",
    "Eknath Shinde": "Eknath_Shinde",
    "Hema Malini": "Hema_Malini",
    "Kangana Ranaut": "Kangana_Ranaut",
    "Manoj Tiwari": "Manoj_Tiwari_(politician)",
    "Dimple Yadav": "Dimple_Yadav",
    "Bhupesh Baghel": "Bhupesh_Baghel",
    "Pushkar Singh Dhami": "Pushkar_Singh_Dhami",
    "Mohan Yadav": "Mohan_Yadav_(politician)",
    "Vishnu Deo Sai": "Vishnu_Deo_Sai",
    "Bhajan Lal Sharma": "Bhajan_Lal_Sharma",
    "Uddhav Thackeray": "Uddhav_Thackeray",
    "Manohar Lal Khattar": "Manohar_Lal_Khattar",
    "Nayab Singh Saini": "Nayab_Singh_Saini",
    "Siddaramaiah": "Siddaramaiah",
    "D. K. Shivakumar": "D._K._Shivakumar",
    "Revanth Reddy": "Revanth_Reddy",
    "M. K. Stalin": "M._K._Stalin",
    "Pinarayi Vijayan": "Pinarayi_Vijayan",
    "Sukhvinder Singh Sukhu": "Sukhvinder_Singh_Sukhu",
    "Bhagwant Mann": "Bhagwant_Mann",
    "Ashok Gehlot": "Ashok_Gehlot",
    "Mallikarjun Kharge": "Mallikarjun_Kharge",
    "Jagdeep Dhankhar": "Jagdeep_Dhankhar",
    "Droupadi Murmu": "Droupadi_Murmu",
    "Om Birla": "Om_Birla",
    "Lalu Prasad Yadav": "Lalu_Prasad_Yadav",
    "Tejashwi Yadav": "Tejashwi_Yadav",
    "Atishi": "Atishi_(politician)",
    "Manish Sisodia": "Manish_Sisodia",
    "Sanjay Singh": "Sanjay_Singh_(politician)",
    "Raghav Chadha": "Raghav_Chadha",
    "Hardik Patel": "Hardik_Patel",
    "Jignesh Mevani": "Jignesh_Mevani",
    "Shashi Tharoor": "Shashi_Tharoor",
    "Manmohan Singh": "Manmohan_Singh",
    "P. Chidambaram": "P._Chidambaram",
    "Kapil Sibal": "Kapil_Sibal",
    "Abhishek Banerjee": "Abhishek_Banerjee_(politician)",
    "Kiren Rijiju": "Kiren_Rijiju",
    "Tejasvi Surya": "Tejasvi_Surya",
    "Manish Tewari": "Manish_Tewari",
    "Dayanidhi Maran": "Dayanidhi_Maran",
    "Harsimrat Kaur Badal": "Harsimrat_Kaur_Badal",
    "Giriraj Singh": "Giriraj_Singh",
    "Jagadish Shettar": "Jagadish_Shettar",
    "Sarbananda Sonowal": "Sarbananda_Sonowal",
    "Nitin Gadkari": "Nitin_Gadkari",
    "Ashwini Vaishnaw": "Ashwini_Vaishnaw",
    "Pralhad Joshi": "Pralhad_Joshi",
    "Anurag Singh Thakur": "Anurag_Thakur",
    "Bhartruhari Mahtab": "Bhartruhari_Mahtab",
    "Deepender Singh Hooda": "Deepender_Singh_Hooda",
    "Supriya Sule": "Supriya_Sule",
    "Sougata Ray": "Sougata_Ray",
    "Rakibul Hussain": "Rakibul_Hussain",
    "Charanjit Singh Channi": "Charanjit_Singh_Channi",
    "Rao Inderjit Singh": "Rao_Inderjit_Singh",
}

# ── State Vidhan Sabha URLs ─────────────────────────────
VIDHAN_SABHAS = {
    "Maharashtra": "https://www.mls.org.in/members",
    "Karnataka": "https://kla.kar.nic.in/members",
    "Tamil Nadu": "https://www.assembly.tn.gov.in/members",
    "Kerala": "https://niyamasabha.org/codes/members",
    "West Bengal": "https://wbassembly.gov.in/members",
    "Uttar Pradesh": "https://vidhanSabha.up.gov.in/en/members",
    "Gujarat": "https://gujaratassembly.nic.in/member",
    "Rajasthan": "https://rajassembly.nic.in/member",
    "Madhya Pradesh": "https://mpvidhansabha.nic.in/members",
    "Bihar": "https://vidhansabha.bih.nic.in/members",
    "Telangana": "https://tsassembly.telangana.gov.in/members",
    "Andhra Pradesh": "https://aplegislature.org/members",
    "Odisha": "https://odishaassembly.nic.in/members",
    "Punjab": "https://punjabiassembly.nic.in/members",
    "Haryana": "https://haryanaassembly.gov.in/members",
    "Jharkhand": "https://jharkhandvidhansabha.nic.in/members",
    "Assam": "https://assamassembly.gov.in/members",
    "Chhattisgarh": "https://cgvidhansabha.gov.in/members",
    "Uttarakhand": "https://liveassembly.uk.gov.in/members",
    "Himachal Pradesh": "https://hpvidhansabha.nic.in/members",
    "Goa": "https://goalegislature.gov.in/members",
    "Manipur": "https://manipurassembly.nic.in/members",
    "Meghalaya": "https://megassembly.nic.in/members",
    "Tripura": "https://tripuraassembly.nic.in/members",
    "Arunachal Pradesh": "https://arlegassembly.gov.in/members",
    "Nagaland": "https://nagalandassembly.nic.in/members",
    "Mizoram": "https://mizoramassembly.nic.in/members",
    "Sikkim": "https://sikkimassembly.nic.in/members",
    "Delhi": "https://delhiassembly.nic.in/members",
    "NCT OF Delhi": "https://delhiassembly.nic.in/members",
}


def normalise(name):
    if not name:
        return ''
    for t in ['Dr.', 'Dr ', 'Smt.', 'Smt ', 'Shri ',
              'Shri.', 'Prof.', 'Adv.', 'Er.', 'Mr.',
              'Mrs.', 'Ms.', 'Col.', 'Gen.', 'Lt.']:
        name = name.replace(t, '').strip()
    return name.strip().lower()


def make_cache_key(source, name):
    return os.path.join(
        CACHE_DIR,
        f"{source}_{re.sub(r'[^a-z0-9]', '_', normalise(name))}.json"
    )


def load_cache(source, name):
    key = make_cache_key(source, name)
    if os.path.exists(key):
        with open(key) as f:
            return json.load(f).get('url')
    return 'NOT_CACHED'


def save_cache(source, name, url):
    key = make_cache_key(source, name)
    with open(key, 'w') as f:
        json.dump({'url': url}, f)


# ── SOURCE 1: Sansad.in ───────────────────────────────
_sansad_cache = None


def load_sansad_directory():
    global _sansad_cache
    if _sansad_cache is not None:
        return _sansad_cache

    cache_file = os.path.join(CACHE_DIR, "_sansad_directory.json")
    if os.path.exists(cache_file):
        with open(cache_file) as f:
            _sansad_cache = json.load(f)
        print(f"  Sansad directory loaded from cache: {len(_sansad_cache)} MPs", flush=True)
        return _sansad_cache

    print("  Fetching Sansad.in MP directory...", flush=True)
    directory = {}

    try:
        res = requests.get(
            "https://sansad.in/ls/members",
            headers=BROWSER_HEADERS, timeout=30
        )
        soup = BeautifulSoup(res.content, 'html.parser')

        # Pattern 1: img tags with person-like attributes
        imgs = soup.find_all('img')
        for img in imgs:
            src = img.get('src') or img.get('data-src') or ''
            alt = img.get('alt') or ''
            if not src or len(alt) < 3:
                continue
            if any(x in src.lower() for x in
                   ['photo', 'member', 'mp', 'portrait', 'profile']):
                if not src.startswith('http'):
                    src = 'https://sansad.in' + src
                directory[normalise(alt)] = src

        # Pattern 2: member cards
        cards = soup.find_all(
            ['div', 'li', 'article'],
            class_=re.compile(r'member|mp-card|legislator', re.I)
        )
        for card in cards:
            name_el = (card.find(class_=re.compile(r'name', re.I)) or
                       card.find(['h2', 'h3', 'h4', 'p', 'span']))
            img_el = card.find('img')
            if name_el and img_el:
                name = name_el.get_text(strip=True)
                src = img_el.get('src') or img_el.get('data-src') or ''
                if src and name:
                    if not src.startswith('http'):
                        src = 'https://sansad.in' + src
                    directory[normalise(name)] = src

        # Pattern 3: API endpoint
        try:
            api = requests.get(
                "https://sansad.in/api/ls/members",
                headers=BROWSER_HEADERS, timeout=15
            )
            if api.status_code == 200:
                data = api.json()
                members = data if isinstance(data, list) else data.get('members', [])
                for m in members:
                    name = (m.get('name') or m.get('fullName') or
                            m.get('memberName') or '')
                    photo = (m.get('photo') or m.get('photoUrl') or
                             m.get('image') or m.get('photoPath') or '')
                    if name and photo:
                        if not photo.startswith('http'):
                            photo = 'https://sansad.in' + photo
                        directory[normalise(name)] = photo
        except Exception:
            pass

        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(directory, f, ensure_ascii=False, indent=2)

        print(f"  Sansad.in: {len(directory)} MP photos indexed", flush=True)

    except Exception as e:
        print(f"  Sansad.in directory failed: {e}", flush=True)

    _sansad_cache = directory
    return directory


def get_sansad_photo(name):
    cached = load_cache('sansad', name)
    if cached != 'NOT_CACHED':
        return cached

    directory = load_sansad_directory()
    norm = normalise(name)

    result = directory.get(norm)
    if not result:
        for key, url in directory.items():
            if norm in key or key in norm:
                result = url
                break

    save_cache('sansad', name, result)
    return result


# ── SOURCE 2: Rajya Sabha ─────────────────────────────
_rs_cache = None


def load_rs_directory():
    global _rs_cache
    if _rs_cache is not None:
        return _rs_cache

    cache_file = os.path.join(CACHE_DIR, "_rs_directory.json")
    if os.path.exists(cache_file):
        with open(cache_file) as f:
            _rs_cache = json.load(f)
        print(f"  Rajya Sabha directory loaded: {len(_rs_cache)} members", flush=True)
        return _rs_cache

    print("  Fetching Rajya Sabha member directory...", flush=True)
    directory = {}

    try:
        urls_to_try = [
            "https://rajyasabha.nic.in/rsnew/member_site/memberlist.aspx",
            "https://sansad.in/rs/members",
            "https://rajyasabha.nic.in/rsnew/member_site/members.aspx",
        ]

        for url in urls_to_try:
            try:
                res = requests.get(url, headers=BROWSER_HEADERS, timeout=20)
                if res.status_code != 200:
                    continue
                soup = BeautifulSoup(res.content, 'html.parser')
                imgs = soup.find_all('img')
                for img in imgs:
                    src = img.get('src') or img.get('data-src') or ''
                    alt = img.get('alt') or ''
                    if src and alt and len(alt) > 3:
                        if not src.startswith('http'):
                            src = urljoin(url, src)
                        directory[normalise(alt)] = src
                if directory:
                    break
            except Exception:
                continue

        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(directory, f, ensure_ascii=False, indent=2)

        print(f"  Rajya Sabha: {len(directory)} member photos indexed", flush=True)

    except Exception as e:
        print(f"  Rajya Sabha directory failed: {e}", flush=True)

    _rs_cache = directory
    return directory


def get_rs_photo(name):
    cached = load_cache('rs', name)
    if cached != 'NOT_CACHED':
        return cached

    directory = load_rs_directory()
    norm = normalise(name)
    result = directory.get(norm)
    if not result:
        for key, url in directory.items():
            if norm in key or key in norm:
                result = url
                break

    save_cache('rs', name, result)
    return result


# ── SOURCE 3: MyNeta.info ─────────────────────────────
def get_myneta_photo(name, state=None, constituency=None):
    cached = load_cache('myneta', name)
    if cached != 'NOT_CACHED':
        return cached

    time.sleep(1.5)
    result = None

    try:
        search_name = quote(name)
        search_url = (
            f"https://www.myneta.info/candidate/"
            f"?action=show&type=name&name={search_name}"
        )

        res = requests.get(search_url, headers=BROWSER_HEADERS, timeout=15)
        if res.status_code != 200:
            save_cache('myneta', name, None)
            return None

        soup = BeautifulSoup(res.content, 'html.parser')

        candidates = soup.find_all(
            'a', href=re.compile(r'candidate_id=\d+')
        )

        best_match_url = None
        for cand in candidates:
            cand_name = cand.get_text(strip=True)
            norm_result = normalise(cand_name)
            norm_query = normalise(name)
            if norm_result == norm_query:
                best_match_url = cand['href']
                break
            elif norm_query in norm_result or norm_result in norm_query:
                best_match_url = cand['href']

        if not best_match_url:
            save_cache('myneta', name, None)
            return None

        if not best_match_url.startswith('http'):
            best_match_url = 'https://www.myneta.info' + best_match_url

        time.sleep(1)
        profile_res = requests.get(
            best_match_url, headers=BROWSER_HEADERS, timeout=15
        )
        profile_soup = BeautifulSoup(profile_res.content, 'html.parser')

        photo_patterns = [
            {'class': re.compile(r'candidate.photo|photo|portrait', re.I)},
            {'id': re.compile(r'photo|portrait|candidate', re.I)},
        ]

        for pattern in photo_patterns:
            img = profile_soup.find('img', pattern)
            if img and img.get('src'):
                src = img['src']
                if not src.startswith('http'):
                    src = 'https://www.myneta.info' + src
                if not any(x in src.lower() for x in
                           ['logo', 'icon', 'banner', 'footer']):
                    result = src
                    break

        if not result:
            cand_id_match = re.search(r'candidate_id=(\d+)', best_match_url)
            if cand_id_match:
                cand_id = cand_id_match.group(1)
                photo_urls = [
                    f"https://myneta.info/images/candidate/{cand_id}.jpg",
                    f"https://myneta.info/candidate_images/{cand_id}.jpg",
                    f"https://myneta.info/photos/{cand_id}.jpg",
                ]
                for photo_url in photo_urls:
                    try:
                        check = requests.head(
                            photo_url, headers=BROWSER_HEADERS, timeout=5
                        )
                        if check.status_code == 200:
                            result = photo_url
                            break
                    except Exception:
                        continue

    except Exception as e:
        print(f"    MyNeta error: {e}", flush=True)

    save_cache('myneta', name, result)
    return result


# ── SOURCE 4: Vidhan Sabha websites ──────────────────
def get_vidhan_sabha_photo(name, state):
    if not state or state not in VIDHAN_SABHAS:
        return None

    cached = load_cache(f'vs_{state}', name)
    if cached != 'NOT_CACHED':
        return cached

    time.sleep(1)
    result = None

    try:
        url = VIDHAN_SABHAS[state]
        res = requests.get(url, headers=BROWSER_HEADERS, timeout=20)
        if res.status_code != 200:
            save_cache(f'vs_{state}', name, None)
            return None

        soup = BeautifulSoup(res.content, 'html.parser')
        norm = normalise(name)

        for img in soup.find_all('img'):
            alt = normalise(img.get('alt') or '')
            if norm in alt or alt in norm:
                src = img.get('src') or ''
                if src:
                    if not src.startswith('http'):
                        src = urljoin(url, src)
                    result = src
                    break

    except Exception as e:
        print(f"    Vidhan Sabha ({state}) error: {e}", flush=True)

    save_cache(f'vs_{state}', name, result)
    return result


# ── SOURCE 5: Wikipedia (strictly validated) ──────────
def get_wikipedia_photo_validated(name):
    cached = load_cache('wiki', name)
    if cached != 'NOT_CACHED':
        return cached

    time.sleep(0.5)

    wiki_title = WIKI_OVERRIDES.get(name)
    if not wiki_title:
        clean = name
        for t in ['Dr.', 'Smt.', 'Shri ', 'Prof.', 'Adv.', 'Er.',
                  'Mr.', 'Mrs.', 'Ms.']:
            clean = clean.replace(t, '').strip()
        wiki_title = clean.replace(' ', '_')

    attempts = [
        wiki_title,
        f"{wiki_title}_(politician)",
        f"{wiki_title}_(Indian_politician)",
        f"{wiki_title}_India",
    ]

    result = None
    for attempt in attempts:
        try:
            url = (f"https://en.wikipedia.org/api/rest_v1"
                   f"/page/summary/{attempt}")
            res = requests.get(url, headers=WIKI_HEADERS, timeout=10)

            if res.status_code != 200:
                continue

            data = res.json()
            combined = (
                (data.get('extract') or '') + ' ' +
                (data.get('description') or '')
            ).lower()

            # STRICT: must confirm it's a politician page
            if not any(kw in combined for kw in POLITICIAN_KEYWORDS):
                continue

            thumbnail = data.get('thumbnail', {})
            if thumbnail and thumbnail.get('source'):
                img_url = thumbnail['source']
                img_url = re.sub(r'/\d+px-', '/400px-', img_url)
                result = img_url
                break

        except Exception as e:
            print(f"    Wiki error ({attempt}): {e}", flush=True)
            time.sleep(1)

    save_cache('wiki', name, result)
    return result


# ── MAIN ──────────────────────────────────────────────
async def async_main():
    print("=" * 60, flush=True)
    print("VERDICT — Comprehensive Photo Fetcher", flush=True)
    print("Sources: Sansad → RS → Vidhan Sabha → MyNeta → Wiki", flush=True)
    print("=" * 60, flush=True)

    # Pre-load directories for speed
    print("\nPre-loading official photo directories...", flush=True)
    sansad_dir = load_sansad_directory()
    rs_dir = load_rs_directory()
    print(f"  Sansad: {len(sansad_dir)} | RS: {len(rs_dir)}", flush=True)

    # Load checkpoint
    checkpoint = {}
    if os.path.exists(CHECKPOINT):
        with open(CHECKPOINT, encoding='utf-8') as f:
            checkpoint = json.load(f)
        print(f"  Resuming — {len(checkpoint)} already done\n", flush=True)

    # ── PLACEHOLDER 1: DB fetch ────────────────────────
    # Fetch ALL politicians from DB using existing async SQLAlchemy client
    await init_db()

    async with get_db_session() as session:
        stmt = select(
            Politician.id,
            Politician.name,
            Politician.current_state,
            Politician.current_house,
            Politician.photo_url,
        )
        results_db = (await session.execute(stmt)).all()
        politicians = [
            {
                "id": str(r[0]),
                "name": r[1],
                "state": r[2] or "",
                "current_house": r[3] or "",
                "photo_url": r[4],
            }
            for r in results_db
        ]

    print(f"Total politicians: {len(politicians)}", flush=True)

    # Load frontend JSON for simultaneous update
    frontend_mps = []
    if os.path.exists(FRONTEND_JSON):
        with open(FRONTEND_JSON, "r", encoding="utf-8") as f:
            try:
                frontend_mps = json.load(f)
            except Exception:
                frontend_mps = []
    
    frontend_map = {}
    for m in frontend_mps:
        key = (m.get("fullName") or "").strip().lower()
        if key:
            frontend_map[key] = m
        slug_key = (m.get("slug") or "").strip().lower()
        if slug_key:
            frontend_map[slug_key] = m

    stats = {
        'sansad': 0, 'rs': 0, 'vidhan_sabha': 0,
        'myneta': 0, 'wikipedia': 0, 'parliament': 0,
        'null': 0, 'errors': 0, 'log': []
    }

    for i, pol in enumerate(politicians):
        pid = str(pol['id'])
        name = pol.get('name', '')
        state = pol.get('state', '')
        house = pol.get('current_house', '') or ''

        if pid in checkpoint:
            continue

        print(f"\n[{i+1}/{len(politicians)}] {name} | {state} | {house}", flush=True)

        new_url = None
        source = None

        # ── Source 1: Sansad (Lok Sabha) ──────────────
        if not new_url and 'lok' in house.lower():
            url = get_sansad_photo(name)
            if url:
                new_url = url
                source = 'sansad'
                print(f"  ✓ Sansad.in", flush=True)

        # ── Source 2: Rajya Sabha ──────────────────────
        if not new_url and 'rajya' in house.lower():
            url = get_rs_photo(name)
            if url:
                new_url = url
                source = 'rs'
                print(f"  ✓ Rajya Sabha", flush=True)

        # ── Source 2b: Try both parliament sites ───────
        if not new_url:
            url = get_sansad_photo(name) or get_rs_photo(name)
            if url:
                new_url = url
                source = 'parliament'
                print(f"  ✓ Parliament", flush=True)

        # ── Source 3: Vidhan Sabha ─────────────────────
        if not new_url and state:
            url = get_vidhan_sabha_photo(name, state)
            if url:
                new_url = url
                source = 'vidhan_sabha'
                print(f"  ✓ Vidhan Sabha ({state})", flush=True)

        # ── Source 4: MyNeta ───────────────────────────
        if not new_url:
            print(f"  → Trying MyNeta...", flush=True)
            url = get_myneta_photo(name, state)
            if url:
                new_url = url
                source = 'myneta'
                print(f"  ✓ MyNeta", flush=True)

        # ── Source 5: Wikipedia (validated) ───────────
        if not new_url:
            print(f"  → Trying Wikipedia...", flush=True)
            url = get_wikipedia_photo_validated(name)
            if url:
                new_url = url
                source = 'wikipedia'
                print(f"  ✓ Wikipedia (validated)", flush=True)

        # ── Fallback: null ─────────────────────────────
        if not new_url:
            print(f"  ○ No photo found — null (default avatar)", flush=True)
            source = 'null'

        # Track stats
        if source and source != 'null':
            stats[source] = stats.get(source, 0) + 1
        else:
            stats['null'] += 1

        # ── PLACEHOLDER 2: DB update ──────────────────
        # Update photo_url in DB using existing async SQLAlchemy client
        try:
            async with get_db_session() as session:
                stmt_update = (
                    update(Politician)
                    .where(Politician.id == pid)
                    .values(photo_url=new_url)
                )
                await session.execute(stmt_update)
                await session.commit()
        except Exception as e:
            print(f"  ✗ DB update error: {e}", flush=True)
            stats['errors'] += 1

        # Also update frontend JSON in memory
        name_lower = name.strip().lower()
        if name_lower in frontend_map:
            frontend_map[name_lower]["photoUrl"] = new_url or ""

        stats['log'].append({
            'id': pid, 'name': name,
            'source': source, 'url': new_url
        })

        # Checkpoint every 25
        checkpoint[pid] = {'source': source, 'url': new_url}
        if (i + 1) % 25 == 0 or (i + 1) == len(politicians):
            with open(CHECKPOINT, 'w', encoding='utf-8') as f:
                json.dump(checkpoint, f, indent=2)
            with open(LOG_FILE, 'w', encoding='utf-8') as f:
                json.dump(stats['log'], f, ensure_ascii=False, indent=2)
            # Persist frontend JSON periodically
            if frontend_mps:
                with open(FRONTEND_JSON, "w", encoding="utf-8") as f:
                    json.dump(frontend_mps, f, ensure_ascii=False, indent=2)

    # Final save
    with open(CHECKPOINT, 'w', encoding='utf-8') as f:
        json.dump(checkpoint, f, indent=2)
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(stats['log'], f, ensure_ascii=False, indent=2)
    if frontend_mps:
        with open(FRONTEND_JSON, "w", encoding="utf-8") as f:
            json.dump(frontend_mps, f, ensure_ascii=False, indent=2)

    total = len(politicians)
    found = total - stats['null']

    print("\n" + "=" * 60, flush=True)
    print(f"RESULTS — {found}/{total} politicians have photos", flush=True)
    print(f"  Sansad.in (official):     {stats.get('sansad', 0)}", flush=True)
    print(f"  Rajya Sabha (official):   {stats.get('rs', 0)}", flush=True)
    print(f"  Parliament (cross):       {stats.get('parliament', 0)}", flush=True)
    print(f"  Vidhan Sabha:             {stats.get('vidhan_sabha', 0)}", flush=True)
    print(f"  MyNeta.info:              {stats.get('myneta', 0)}", flush=True)
    print(f"  Wikipedia (validated):    {stats.get('wikipedia', 0)}", flush=True)
    print(f"  No photo (null):          {stats['null']}", flush=True)
    print(f"  Errors:                   {stats['errors']}", flush=True)
    print(f"\nLog saved to: {LOG_FILE}", flush=True)
    print("=" * 60, flush=True)


def main():
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
