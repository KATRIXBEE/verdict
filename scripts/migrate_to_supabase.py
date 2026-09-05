import os
import json
import sqlite3
import re
import time
import requests
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.data_integrity_guard import validate_politician_record

SUPABASE_URL = "https://ksdqughrmrburubgbtba.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZHF1Z2hybXJidXJ1YmdidGJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY4NTczNywiZXhwIjoyMTAzMjYxNzM3fQ.egQKQ3mCJR_iup3nuJhTkrRC6J9oviTggQ_h0i9U6pE")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal"
}

def make_slug(name, constituency=""):
    text = f"{name} {constituency}".lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', '-', text.strip())
    return text[:200]

def find_local_data():
    """Find politician data in all possible locations"""
    json_paths = [
        "src/data/all-mps.json",
        "src/data/politicians.json",
        "scripts/data/mps_2024_raw.json",
        "scripts/data/all-mps.json",
        "data/all-mps.json",
        "data/politicians.json",
        "public/data/politicians.json",
    ]

    for path in json_paths:
        if Path(path).exists():
            print(f"  Found JSON: {path}")
            with open(path, encoding='utf-8') as f:
                data = json.load(f)
            
            if isinstance(data, list) and len(data) > 0:
                return data, path
            if isinstance(data, dict):
                for key in ['politicians','data','results','mps','members']:
                    if key in data and isinstance(data[key], list):
                        return data[key], path
    
    sqlite_paths = [
        "verdict_pipeline.db",
        "verdict.db",
        "data-pipeline/verdict_pipeline.db",
        "scripts/verdict_pipeline.db",
        "data/verdict.db",
        "local.db",
    ]
    
    for path in sqlite_paths:
        if Path(path).exists():
            print(f"  Found SQLite: {path}")
            conn = sqlite3.connect(path)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [r[0] for r in cur.fetchall()]
            print(f"  Tables: {tables}")
            
            for table in ['politicians', 'mps', 'members', 'candidates']:
                if table in tables:
                    cur.execute(f"SELECT * FROM {table}")
                    rows = [dict(r) for r in cur.fetchall()]
                    conn.close()
                    return rows, path
            conn.close()
    
    return [], None

def clean_politician(raw):
    """Map any field names to the Supabase schema columns"""
    name = (raw.get('name') or raw.get('Name') or raw.get('full_name') or raw.get('fullName') or '').strip()
    constituency = (raw.get('constituency') or raw.get('Constituency') or raw.get('current_constituency') or raw.get('currentConstituency') or '').strip()
    
    if not name:
        return None
    
    slug = raw.get('slug') or make_slug(name, constituency)
    
    raw_score = raw.get('verdict_score') or raw.get('score') or raw.get('calculated_verdict_score') or raw.get('calculatedVerdictScore')
    try:
        score = float(raw_score) if raw_score else 5.0
        score = max(0.0, min(10.0, score))
    except (TypeError, ValueError):
        score = 5.0
    
    photo = (raw.get('photo_url') or raw.get('photo') or raw.get('image_url') or raw.get('photoUrl'))
    
    return {
        'name': name,
        'slug': slug,
        'current_party': (raw.get('current_party') or raw.get('currentParty') or raw.get('party') or raw.get('Party')),
        'party': (raw.get('party') or raw.get('Party') or raw.get('current_party') or raw.get('currentParty')),
        'current_constituency': constituency or None,
        'constituency': constituency or None,
        'current_state': (raw.get('state') or raw.get('State') or raw.get('current_state') or raw.get('currentState')),
        'state': (raw.get('state') or raw.get('State')),
        'current_house': (raw.get('current_house') or raw.get('currentHouse') or raw.get('house') or 'Lok Sabha'),
        'photo_url': photo,
        'education': raw.get('education') or raw.get('Education') or raw.get('educationDegree'),
        'education_verification_status': (
            raw.get('education_verification_status') or raw.get('educationStatus') or 'Not Checked'
        ),
        'profession': raw.get('profession') or raw.get('Profession') or raw.get('professionDeclared'),
        'verdict_score': round(score, 1),
        'criminal_case_count': raw.get('criminal_case_count') if raw.get('criminal_case_count') is not None else (len(raw.get('criminalCases', [])) if isinstance(raw.get('criminalCases'), list) else None),
        'worst_case_severity': raw.get('worst_case_severity') or raw.get('worstCaseSeverity'),
        'attendance_percent': raw.get('attendance_percent') if raw.get('attendance_percent') is not None else raw.get('attendancePercentage'),
        'questions_asked': raw.get('questions_asked') if raw.get('questions_asked') is not None else raw.get('questionsAsked'),
        'asset_growth_percent': raw.get('asset_growth_percent'),
        'party_switch_count': raw.get('party_switch_count') if raw.get('party_switch_count') is not None else raw.get('partySwitchCount'),
        'mplads_utilisation_percent': raw.get('mplads_utilisation_percent') if raw.get('mplads_utilisation_percent') is not None else raw.get('mpladsUtilisationPercent'),
        'total_assets': raw.get('total_assets'),
        'liabilities': raw.get('liabilities'),
        'election_year': raw.get('election_year') or 2024,
        'terms_served': raw.get('terms_served') or raw.get('termsServed'),
        'bio_summary': raw.get('bio_summary') or raw.get('wikipedia_summary') or raw.get('bioSummary'),
        'wikipedia_url': raw.get('wikipedia_url') or raw.get('wiki_url') or raw.get('wikipediaUrl'),
        'mp_code': raw.get('mp_code') or raw.get('MP_code') or raw.get('mpCode'),
        'data_source': raw.get('data_source') or 'migration',
        'data_completeness_percent': raw.get('data_completeness_percent') or 85,
    }

def upsert_batch(politicians, batch_num, total_batches):
    """Upsert a batch of politicians to Supabase"""
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/politicians",
        headers=HEADERS,
        json=politicians,
        timeout=30
    )
    
    if response.status_code in (200, 201):
        print(f"  Batch {batch_num}/{total_batches}: {len(politicians)} inserted ✓")
        return True
    else:
        print(f"  Batch {batch_num}/{total_batches}: ERROR {response.status_code}")
        print(f"  {response.text[:300]}")
        return False

def test_connection():
    """Test Supabase connection"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/politicians?limit=1",
            headers=HEADERS,
            timeout=10
        )
        return response.status_code in (200, 201)
    except Exception as e:
        print(f"  Connection error: {e}")
        return False

def get_current_count():
    """Get count of politicians currently in Supabase"""
    try:
        response = requests.head(
            f"{SUPABASE_URL}/rest/v1/politicians?select=*",
            headers={**HEADERS, "Prefer": "count=exact"},
            timeout=10
        )
        content_range = response.headers.get('content-range', '')
        if '/' in content_range:
            return int(content_range.split('/')[1])
        return 0
    except:
        return 0

def main():
    print("=" * 60)
    print("VERDICT — Supabase Data Migration")
    print(f"Target: {SUPABASE_URL}")
    print("=" * 60)
    
    if not SERVICE_KEY:
        print("\nERROR: SUPABASE_SERVICE_ROLE_KEY not set")
        return
    
    print("\n1. Testing Supabase connection...")
    if not test_connection():
        print("  Notice: Database table may need to be initialized via SQL schema first.")
        return
    print("  Connected successfully")
    
    current = get_current_count()
    print(f"  Politicians currently in Supabase: {current}")
    
    print("\n2. Finding local politician data...")
    politicians_raw, source_path = find_local_data()
    
    if not politicians_raw:
        print("  No local data found!")
        return
    
    print(f"  Found {len(politicians_raw)} politicians in {source_path}")
    
    print("\n3. Cleaning and mapping data fields...")
    cleaned = []
    skipped = 0
    
    for raw in politicians_raw:
        clean = clean_politician(raw)
        if clean:
            is_valid, issues = validate_politician_record(clean)
            if not is_valid:
                print(f"  [GUARD REJECTED] {clean.get('name')}: {', '.join(issues)}")
                skipped += 1
                continue
            cleaned.append(clean)
        else:
            skipped += 1
    
    print(f"  Valid records: {len(cleaned)}")
    print(f"  Skipped: {skipped}")
    
    if not cleaned:
        print("  Nothing to migrate")
        return
    
    print("\n4. Sample record (verify field mapping):")
    sample = cleaned[0]
    for key, val in list(sample.items())[:8]:
        if val is not None:
            print(f"  {key}: {str(val)[:60]}")
    
    print(f"\n5. Migrating {len(cleaned)} politicians to Supabase...")
    BATCH_SIZE = 50
    batches = [cleaned[i:i+BATCH_SIZE] for i in range(0, len(cleaned), BATCH_SIZE)]
    
    success_count = 0
    for i, batch in enumerate(batches, 1):
        ok = upsert_batch(batch, i, len(batches))
        if ok:
            success_count += len(batch)
        time.sleep(0.3)
    
    final_count = get_current_count()
    
    print("\n" + "=" * 60)
    print("Migration complete!")
    print(f"  Attempted: {len(cleaned)}")
    print(f"  Successful: {success_count}")
    print(f"  Total in Supabase now: {final_count}")
    print("=" * 60)

if __name__ == "__main__":
    main()
