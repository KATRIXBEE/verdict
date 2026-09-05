import os
import requests
import re
import json
import sqlite3
from datetime import datetime
from pathlib import Path

# Load environment variables from .env.local if not set in os.environ
env_path = Path('.env.local')
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://ksdqughrmrburubgbtba.supabase.co")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

# ─────────────────────────────────────────────
# RED FLAG PATTERN 1: Nicknames in quotes
# Real Indian politicians almost never have
# quoted nicknames like 'Bahubali' or 'Chameleon'
# in their official ECI-registered name
# ─────────────────────────────────────────────
NICKNAME_PATTERN = re.compile(r"['\"]([A-Za-z]+)['\"]")

# ─────────────────────────────────────────────
# RED FLAG PATTERN 2: Suspicious military/retired
# titles combined with politician role — these are
# almost always AI-generated flavor text
# ─────────────────────────────────────────────
SUSPICIOUS_TITLES = [
    'col.', 'colonel', '(retd.)', '(retd)', 'wing commander',
    'brig.', 'brigadier', 'lt. gen.', 'major gen.',
]

# ─────────────────────────────────────────────
# RED FLAG PATTERN 3: Generic overused AI names
# Names that appear suspiciously generic/common
# combined with mismatched constituency data
# ─────────────────────────────────────────────
GENERIC_NAME_PATTERN = re.compile(
    r'^(Ramesh|Suresh|Rajesh|Mahesh|Dinesh) Kumar$', re.IGNORECASE
)

def fetch_supabase_politicians():
    all_politicians = []
    offset = 0
    limit = 1000
    try:
        while True:
            res = requests.get(
                f"{SUPABASE_URL}/rest/v1/politicians"
                f"?select=id,name,slug,current_party,party,constituency,"
                f"state,current_house,photo_url,data_source,created_at,"
                f"mp_code,wikipedia_url"
                f"&limit={limit}&offset={offset}",
                headers=HEADERS,
                timeout=10
            )
            if res.status_code != 200:
                print(f"[WARN] Supabase returned status {res.status_code}: {res.text[:150]}")
                break
            batch = res.json()
            if not batch:
                break
            all_politicians.extend(batch)
            offset += limit
            if len(batch) < limit:
                break
    except Exception as e:
        print(f"[NOTICE] Could not connect to Supabase: {e}")
        print(f"         (If Supabase project is paused, unpause from dashboard: {SUPABASE_URL})")
    return all_politicians

def fetch_local_db_politicians():
    """Fallback / supplementary audit: read from local SQLite pipeline database"""
    all_politicians = []
    db_paths = [
        "data-pipeline/verdict_pipeline.db",
        "verdict_pipeline.db",
        "scripts/verdict_pipeline.db",
    ]
    for db_path in db_paths:
        if os.path.exists(db_path):
            try:
                conn = sqlite3.connect(db_path)
                c = conn.cursor()
                c.execute("""
                    SELECT id, name, slug, current_party, current_constituency,
                           current_state, current_house, photo_url, wikipedia_url,
                           mp_code, created_at
                    FROM politicians
                """)
                for r in c.fetchall():
                    all_politicians.append({
                        'id': r[0],
                        'name': r[1],
                        'slug': r[2],
                        'current_party': r[3],
                        'party': r[3],
                        'constituency': r[4],
                        'state': r[5],
                        'current_house': r[6],
                        'photo_url': r[7],
                        'wikipedia_url': r[8],
                        'mp_code': r[9],
                        'data_source': 'sqlite_pipeline',
                        'created_at': r[10],
                    })
                conn.close()
                break
            except Exception as e:
                print(f"[WARN] SQLite read error for {db_path}: {e}")
    return all_politicians

def fetch_mock_politicians():
    """Extract any static mock politicians from mock-politicians.ts for audit"""
    mock_file = Path("src/data/mock-politicians.ts")
    if not mock_file.exists():
        return []
    
    politicians = []
    try:
        content = mock_file.read_text(encoding='utf-8')
        # Extract blocks with id, fullName, slug, currentParty, house, etc.
        id_matches = re.findall(r'id:\s*["\']([^"\']+)["\'],\s*fullName:\s*["\']([^"\']+)["\']', content)
        for pid, name in id_matches:
            politicians.append({
                'id': pid,
                'name': name,
                'slug': name.lower().replace(' ', '-'),
                'current_party': 'Mock',
                'party': 'Mock',
                'constituency': 'Mock',
                'state': 'Mock',
                'current_house': 'Lok Sabha',
                'photo_url': '',
                'wikipedia_url': '',
                'mp_code': '',
                'data_source': 'mock-politicians.ts',
                'created_at': datetime.now().isoformat(),
            })
    except Exception as e:
        print(f"[WARN] Error reading mock-politicians.ts: {e}")
    return politicians

def flag_suspicious(politicians):
    flagged = []
    seen_ids = set()

    for p in politicians:
        pid = p.get('id')
        if pid in seen_ids:
            continue
        seen_ids.add(pid)

        name = p.get('name', '') or ''
        flags = []

        # Check 1: Quoted nickname in name
        if NICKNAME_PATTERN.search(name):
            flags.append('QUOTED_NICKNAME')

        # Check 2: Suspicious military title
        name_lower = name.lower()
        for title in SUSPICIOUS_TITLES:
            if title in name_lower:
                flags.append(f'SUSPICIOUS_TITLE:{title}')

        # Check 3: No mp_code (real MPs from RTI Wiki/Sansad
        # always have an official MP code)
        if not p.get('mp_code') and p.get('current_house') in ('Lok Sabha', None):
            flags.append('NO_MP_CODE')

        # Check 4: No wikipedia_url AND no photo (real MPs
        # almost always have at least one)
        if not p.get('wikipedia_url') and not p.get('photo_url'):
            flags.append('NO_VERIFICATION_LINKS')

        # Check 5: data_source is null, 'manual', or 'unknown'
        # (as opposed to 'rti_wiki', 'myneta_2024', 'sansad_scrape')
        source = (p.get('data_source') or '').lower()
        if source in ('', 'manual', 'unknown', 'ai_generated', 'test', 'seed', 'mock-politicians.ts', 'null'):
            flags.append(f'SUSPICIOUS_SOURCE:{source or "null"}')

        # Check 6: Generic name pattern with no other verification
        if GENERIC_NAME_PATTERN.match(name) and not p.get('mp_code'):
            flags.append('GENERIC_NAME_NO_VERIFICATION')

        if flags:
            flagged.append({
                'id': p['id'],
                'name': name,
                'party': p.get('current_party') or p.get('party'),
                'constituency': p.get('constituency'),
                'state': p.get('state'),
                'house': p.get('current_house'),
                'data_source': p.get('data_source'),
                'flags': flags,
                'flag_count': len(flags),
            })

    return sorted(flagged, key=lambda x: -x['flag_count'])

def main():
    print("=" * 70)
    print("VERDICT — FABRICATED DATA AUDIT")
    print("=" * 70)

    print("\nFetching all politicians from Supabase...")
    politicians = fetch_supabase_politicians()
    source_desc = "Supabase"

    if not politicians:
        print("[INFO] Supabase returned 0 records (or connection unavailable).")
        print("       Falling back to local database audit (verdict_pipeline.db + mock-politicians)...")
        politicians = fetch_local_db_politicians()
        mock_pols = fetch_mock_politicians()
        # Merge if not already in local db
        existing_names = {p.get('name', '').lower() for p in politicians}
        for mp in mock_pols:
            if mp.get('name', '').lower() not in existing_names:
                politicians.append(mp)
        source_desc = "Local Pipeline SQLite & Mock Data"

    print(f"Total politicians scanned from {source_desc}: {len(politicians)}")

    print("\nScanning for red flags...")
    flagged = flag_suspicious(politicians)

    print(f"\n{'='*70}")
    print(f"FLAGGED: {len(flagged)} suspicious entries out of {len(politicians)}")
    print(f"{'='*70}\n")

    # Categorize by severity
    high_confidence_fake = [f for f in flagged if f['flag_count'] >= 2]
    needs_review = [f for f in flagged if f['flag_count'] == 1]

    print(f"HIGH CONFIDENCE FAKE (2+ red flags): {len(high_confidence_fake)}")
    print("-" * 70)
    for f in high_confidence_fake:
        print(f"  {f['name']} | {f['party']} | {f['constituency']}, {f['state']}")
        print(f"    Flags: {', '.join(f['flags'])}")
        print(f"    ID: {f['id']}")
        print()

    print(f"\nNEEDS MANUAL REVIEW (1 red flag): {len(needs_review)}")
    print("-" * 70)
    for f in needs_review:
        print(f"  {f['name']} | {f['party']} | {f['constituency']}, {f['state']}")
        print(f"    Flags: {', '.join(f['flags'])}")
        print()

    # Save full report
    os.makedirs('scripts/audit', exist_ok=True)
    with open('scripts/audit/fabricated_data_report.json', 'w', encoding='utf-8') as f:
        json.dump({
            'generated_at': datetime.now().isoformat(),
            'source': source_desc,
            'total_politicians': len(politicians),
            'total_flagged': len(flagged),
            'high_confidence_fake': high_confidence_fake,
            'needs_review': needs_review,
        }, f, ensure_ascii=False, indent=2)

    print(f"\nFull report saved to: scripts/audit/fabricated_data_report.json")
    print(f"\nNEXT STEP: Review scripts/audit/fabricated_data_report.json")
    print(f"Then run scripts/verify_against_myneta.py to cross-check")
    print(f"each flagged entry against MyNeta.info before deletion.")

if __name__ == "__main__":
    main()
