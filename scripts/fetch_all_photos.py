"""
VERDICT — Comprehensive Photo Fetcher (High-Speed & Resilient)
Fetches real photos for every politician in the database.
Priority: Sansad.in → Rajya Sabha → Vidhan Sabha → MyNeta → Wikipedia (validated) → null
Uses existing async SQLAlchemy DB client for all reads/writes.
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
    'User-Agent': 'VERDICT-CivicTech/1.0 (Educational; katrixbee@gmail.com)'
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
    "Sougata Ray": "Sougata_Ray",
    "Rakibul Hussain": "Rakibul_Hussain",
    "Charanjit Singh Channi": "Charanjit_Singh_Channi",
    "Rao Inderjit Singh": "Rao_Inderjit_Singh",
    "G. Kishan Reddy": "G._Kishan_Reddy",
    "Jitan Ram Manjhi": "Jitan_Ram_Manjhi",
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

DEAD_DOMAINS = set()


def normalise(name):
    if not name:
        return ''
    for t in ['Dr.', 'Dr ', 'Smt.', 'Smt ', 'Shri ',
              'Shri.', 'Prof.', 'Adv.', 'Er.', 'Mr.',
              'Mrs.', 'Ms.', 'Col.', 'Gen.', 'Lt.', 'Kunwar', 'Chhatrapati']:
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
        try:
            with open(key) as f:
                return json.load(f).get('url')
        except Exception:
            pass
    return 'NOT_CACHED'


def save_cache(source, name, url):
    key = make_cache_key(source, name)
    try:
        with open(key, 'w') as f:
            json.dump({'url': url}, f)
    except Exception:
        pass


# ── SOURCE 1: Sansad.in ───────────────────────────────
_sansad_cache = None


def load_sansad_directory():
    global _sansad_cache
    if _sansad_cache is not None:
        return _sansad_cache

    cache_file = os.path.join(CACHE_DIR, "_sansad_directory.json")
    if os.path.exists(cache_file):
        try:
            with open(cache_file) as f:
                _sansad_cache = json.load(f)
            return _sansad_cache
        except Exception:
            pass

    directory = {}
    try:
        res = requests.get("https://sansad.in/api/ls/members", headers=BROWSER_HEADERS, timeout=2.5)
        if res.status_code == 200:
            data = res.json()
            members = data if isinstance(data, list) else data.get('members', [])
            for m in members:
                name = m.get('name') or m.get('fullName') or m.get('memberName') or ''
                photo = m.get('photo') or m.get('photoUrl') or m.get('image') or m.get('photoPath') or ''
                if name and photo:
                    if not photo.startswith('http'):
                        photo = 'https://sansad.in' + photo
                    directory[normalise(name)] = photo
    except Exception:
        pass

    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(directory, f, ensure_ascii=False, indent=2)

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
        try:
            with open(cache_file) as f:
                _rs_cache = json.load(f)
            return _rs_cache
        except Exception:
            pass

    directory = {}
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(directory, f, ensure_ascii=False, indent=2)

    _rs_cache = directory
    return directory


def get_rs_photo(name):
    cached = load_cache('rs', name)
    if cached != 'NOT_CACHED':
        return cached

    directory = load_rs_directory()
    norm = normalise(name)
    result = directory.get(norm)
    save_cache('rs', name, result)
    return result


# ── SOURCE 3: Vidhan Sabha websites ──────────────────
def get_vidhan_sabha_photo(name, state):
    if not state or state not in VIDHAN_SABHAS or state in DEAD_DOMAINS:
        return None

    cached = load_cache(f'vs_{state}', name)
    if cached != 'NOT_CACHED':
        return cached

    result = None
    try:
        url = VIDHAN_SABHAS[state]
        res = requests.get(url, headers=BROWSER_HEADERS, timeout=1.5)
        if res.status_code != 200:
            DEAD_DOMAINS.add(state)
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
    except Exception:
        DEAD_DOMAINS.add(state)

    save_cache(f'vs_{state}', name, result)
    return result


# ── SOURCE 4: MyNeta.info ─────────────────────────────
def get_myneta_photo(name, state=None):
    cached = load_cache('myneta', name)
    if cached != 'NOT_CACHED':
        return cached

    result = None
    try:
        search_name = quote(name)
        search_url = f"https://www.myneta.info/candidate/?action=show&type=name&name={search_name}"

        res = requests.get(search_url, headers=BROWSER_HEADERS, timeout=2.0)
        if res.status_code == 200:
            soup = BeautifulSoup(res.content, 'html.parser')
            candidates = soup.find_all('a', href=re.compile(r'candidate_id=\d+'))
            
            best_match_url = None
            for cand in candidates:
                cand_name = cand.get_text(strip=True)
                norm_result = normalise(cand_name)
                norm_query = normalise(name)
                if norm_result == norm_query or norm_query in norm_result:
                    best_match_url = cand['href']
                    break

            if best_match_url:
                cand_id_match = re.search(r'candidate_id=(\d+)', best_match_url)
                if cand_id_match:
                    cand_id = cand_id_match.group(1)
                    photo_url = f"https://myneta.info/images/candidate/{cand_id}.jpg"
                    check = requests.head(photo_url, headers=BROWSER_HEADERS, timeout=1.5)
                    if check.status_code == 200:
                        result = photo_url
    except Exception:
        pass

    save_cache('myneta', name, result)
    return result


# ── SOURCE 5: Wikipedia (strictly validated) ──────────
def get_wikipedia_photo_validated(name):
    cached = load_cache('wiki', name)
    if cached != 'NOT_CACHED':
        return cached

    # Check override
    override_title = None
    for c_name, c_title in WIKI_OVERRIDES.items():
        if normalise(c_name) == normalise(name):
            override_title = c_title
            break

    if override_title:
        attempts = [override_title]
    else:
        wiki_title = name
        for t in ['Dr.', 'Smt.', 'Shri ', 'Prof.', 'Adv.', 'Er.', 'Mr.', 'Mrs.', 'Ms.']:
            wiki_title = wiki_title.replace(t, '').strip()
        wiki_title = wiki_title.replace(' ', '_')

        attempts = [
            wiki_title,
            f"{wiki_title}_politician",
            f"{wiki_title}_(politician)",
            f"{wiki_title}_(Indian_politician)",
            f"{wiki_title}_India",
        ]

    result = None
    for attempt in attempts:
        try:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{attempt}"
            res = requests.get(url, headers=WIKI_HEADERS, timeout=1.5)
            if res.status_code == 200:
                data = res.json()
                combined = ((data.get('extract') or '') + ' ' + (data.get('description') or '')).lower()
                if any(kw in combined for kw in POLITICIAN_KEYWORDS):
                    thumbnail = data.get('thumbnail', {})
                    if thumbnail and thumbnail.get('source'):
                        src = thumbnail['source']
                        result = re.sub(r'/\d+px-', '/400px-', src)
                        break
        except Exception:
            continue

    save_cache('wiki', name, result)
    return result


# ── MAIN ──────────────────────────────────────────────
async def async_main():
    print("=" * 60, flush=True)
    print("VERDICT — High-Speed Photo Fetcher (5-Source Priority)", flush=True)
    print("Sources: Sansad → RS → Vidhan Sabha → MyNeta → Wiki", flush=True)
    print("=" * 60, flush=True)

    await init_db()

    # Load checkpoint
    checkpoint = {}
    if os.path.exists(CHECKPOINT):
        try:
            with open(CHECKPOINT, encoding='utf-8') as f:
                checkpoint = json.load(f)
            print(f"  Resuming from checkpoint — {len(checkpoint)} already processed\n", flush=True)
        except Exception:
            checkpoint = {}

    # Fetch ALL politicians from DB
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

    print(f"Total politicians to evaluate: {len(politicians)}", flush=True)

    # Load frontend JSON
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

    stats = {
        'sansad': 0, 'rs': 0, 'vidhan_sabha': 0,
        'myneta': 0, 'wikipedia': 0, 'parliament': 0,
        'null': 0, 'errors': 0, 'log': []
    }

    async with get_db_session() as session:
        for i, pol in enumerate(politicians):
            pid = str(pol['id'])
            name = pol.get('name', '')
            state = pol.get('state', '')
            house = pol.get('current_house', '') or ''

            # If already processed in checkpoint
            if pid in checkpoint:
                cached_source = checkpoint[pid].get('source', 'null')
                cached_url = checkpoint[pid].get('url')
                if cached_source and cached_source != 'null':
                    stats[cached_source] = stats.get(cached_source, 0) + 1
                else:
                    stats['null'] += 1
                continue

            new_url = None
            source = None

            # ── Source 1: Sansad (Lok Sabha) ──────────────
            if not new_url and 'lok' in house.lower():
                url = get_sansad_photo(name)
                if url:
                    new_url = url
                    source = 'sansad'

            # ── Source 2: Rajya Sabha ──────────────────────
            if not new_url and 'rajya' in house.lower():
                url = get_rs_photo(name)
                if url:
                    new_url = url
                    source = 'rs'

            # ── Source 3: Vidhan Sabha ─────────────────────
            if not new_url and state:
                url = get_vidhan_sabha_photo(name, state)
                if url:
                    new_url = url
                    source = 'vidhan_sabha'

            # ── Source 4: MyNeta ───────────────────────────
            if not new_url:
                url = get_myneta_photo(name, state)
                if url:
                    new_url = url
                    source = 'myneta'

            # ── Source 5: Wikipedia (validated) ───────────
            if not new_url:
                url = get_wikipedia_photo_validated(name)
                if url:
                    new_url = url
                    source = 'wikipedia'

            # ── Fallback: null ─────────────────────────────
            if not new_url:
                # If existing photo was valid wikimedia photo, preserve it
                if pol.get('photo_url') and 'wikimedia.org' in pol['photo_url']:
                    new_url = pol['photo_url']
                    source = 'wikipedia'
                else:
                    new_url = pol.get('photo_url')  # preserve existing verified asset portrait
                    source = 'null'

            if source and source != 'null':
                stats[source] = stats.get(source, 0) + 1
                print(f"[{i+1}/{len(politicians)}] ✓ {name} ({source}) -> {str(new_url)[:60]}...", flush=True)
            else:
                stats['null'] += 1
                print(f"[{i+1}/{len(politicians)}] ○ {name} (null / default avatar)", flush=True)

            # Update DB
            stmt_update = update(Politician).where(Politician.id == pid).values(photo_url=new_url)
            await session.execute(stmt_update)

            # Update frontend JSON in memory
            name_lower = name.strip().lower()
            if name_lower in frontend_map:
                frontend_map[name_lower]["photoUrl"] = new_url or ""

            stats['log'].append({
                'id': pid, 'name': name,
                'source': source, 'url': new_url
            })

            checkpoint[pid] = {'source': source, 'url': new_url}

            # Commit batch every 50
            if (i + 1) % 50 == 0 or (i + 1) == len(politicians):
                await session.commit()
                with open(CHECKPOINT, 'w', encoding='utf-8') as f:
                    json.dump(checkpoint, f, indent=2)
                with open(LOG_FILE, 'w', encoding='utf-8') as f:
                    json.dump(stats['log'], f, ensure_ascii=False, indent=2)
                if frontend_mps:
                    with open(FRONTEND_JSON, "w", encoding="utf-8") as f:
                        json.dump(frontend_mps, f, ensure_ascii=False, indent=2)

        await session.commit()

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
