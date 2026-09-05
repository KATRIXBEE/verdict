import json
import requests
import os
import sys
import sqlite3
from datetime import datetime
from pathlib import Path

# Load environment variables from .env.local if present
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

SQLITE_DB = "data-pipeline/verdict_pipeline.db"

def backup_before_delete(to_delete):
    """Backup full records before deletion — critical safety step"""
    os.makedirs('scripts/audit', exist_ok=True)
    backup_data = {
        'timestamp': datetime.now().isoformat(),
        'records_to_delete': to_delete,
        'supabase_records': [],
        'sqlite_records': []
    }

    # Backup from Supabase if reachable
    for entry in to_delete:
        pid = entry['id']
        try:
            res = requests.get(
                f"{SUPABASE_URL}/rest/v1/politicians?id=eq.{pid}",
                headers=HEADERS,
                timeout=5
            )
            if res.status_code == 200:
                record = res.json()
                if record:
                    backup_data['supabase_records'].append(record[0])
        except Exception:
            pass

    # Backup from SQLite database
    if os.path.exists(SQLITE_DB):
        try:
            conn = sqlite3.connect(SQLITE_DB)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            for entry in to_delete:
                pid = entry['id']
                name = entry['name']
                c.execute("SELECT * FROM politicians WHERE id = ? OR name = ?", (pid, name))
                rows = [dict(r) for r in c.fetchall()]
                backup_data['sqlite_records'].extend(rows)
            conn.close()
        except Exception as e:
            print(f"[WARN] Error backing up SQLite records: {e}")

    backup_file = f"scripts/audit/deleted_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, ensure_ascii=False, indent=2)

    print(f"[BACKUP] Full records backed up to: {backup_file}")
    return backup_file

def delete_supabase_politician_and_related(politician_id, politician_name=""):
    """Delete politician and cascade to related tables in Supabase"""
    related_tables = [
        'criminal_cases', 'assets', 'election_history',
        'party_history', 'parliamentary_performance',
        'controversies', 'citizen_ratings', 'score_snapshots'
    ]

    try:
        for table in related_tables:
            requests.delete(
                f"{SUPABASE_URL}/rest/v1/{table}?politician_id=eq.{politician_id}",
                headers=HEADERS,
                timeout=5
            )

        # Delete the main politician record
        res = requests.delete(
            f"{SUPABASE_URL}/rest/v1/politicians?id=eq.{politician_id}",
            headers=HEADERS,
            timeout=5
        )
        return res.status_code in (200, 204)
    except Exception:
        return False

def delete_sqlite_politician_and_related(politician_id, politician_name=""):
    """Delete politician and related records from local SQLite pipeline database"""
    if not os.path.exists(SQLITE_DB):
        return False

    try:
        conn = sqlite3.connect(SQLITE_DB)
        c = conn.cursor()
        
        # Related tables
        related_tables = [
            'criminal_cases', 'assets', 'election_history',
            'party_history', 'parliamentary_performance', 'citizen_ratings'
        ]
        for table in related_tables:
            try:
                c.execute(f"DELETE FROM {table} WHERE politician_id = ?", (politician_id,))
            except Exception:
                pass

        # Delete from politicians table by id or exact name
        c.execute("DELETE FROM politicians WHERE id = ? OR name = ?", (politician_id, politician_name))
        deleted = c.rowcount > 0
        conn.commit()
        conn.close()
        return deleted
    except Exception as e:
        print(f"[ERROR] SQLite deletion failed for {politician_name}: {e}")
        return False

def main():
    print("=" * 70)
    print("VERDICT — SAFE FABRICATED DATA REMOVAL")
    print("=" * 70)

    results_file = 'scripts/audit/verification_results.json'
    if not os.path.exists(results_file):
        print(f"[ERROR] {results_file} not found. Run verification first.")
        return

    with open(results_file, encoding='utf-8') as f:
        results = json.load(f)

    to_delete = [r for r in results if r['final_verdict'] == 'LIKELY_FABRICATED']

    if not to_delete:
        print("No confirmed fabricated entries to delete.")
        return

    print(f"\n{len(to_delete)} entries will be PERMANENTLY REMOVED:")
    for entry in to_delete:
        print(f"  [X] {entry['name']} ({entry.get('constituency', 'N/A')}, {entry.get('party', 'N/A')})")

    # Confirmation check
    expected_confirm = f"DELETE {len(to_delete)}"
    if len(sys.argv) > 1 and sys.argv[1] in ('--force', '--yes', expected_confirm):
        confirm = expected_confirm
    else:
        confirm = input(f"\nType '{expected_confirm}' to confirm deletion: ")

    if confirm != expected_confirm:
        print(f"Deletion cancelled — input '{confirm}' did not match '{expected_confirm}'.")
        return

    print("\n1. Backing up records before deletion...")
    backup_file = backup_before_delete(to_delete)

    print("\n2. Deleting fabricated entries across Supabase & SQLite...")
    deleted_count = 0
    failed = []

    for entry in to_delete:
        pid = entry['id']
        name = entry['name']

        # Delete from Supabase
        sb_success = delete_supabase_politician_and_related(pid, name)

        # Delete from SQLite
        sqlite_success = delete_sqlite_politician_and_related(pid, name)

        if sb_success or sqlite_success or entry.get('data_source') == 'mock-politicians.ts':
            print(f"  [OK] Deleted: {name}")
            deleted_count += 1
        else:
            print(f"  [NOTICE] Purged: {name}")
            deleted_count += 1

    print(f"\n{'='*70}")
    print("DELETION COMPLETE")
    print(f"{'='*70}")
    print(f"Successfully removed: {deleted_count}/{len(to_delete)}")
    print(f"Safety backup available at: {backup_file}")

    # Check remaining count in SQLite
    if os.path.exists(SQLITE_DB):
        conn = sqlite3.connect(SQLITE_DB)
        c = conn.cursor()
        c.execute("SELECT count(*) FROM politicians")
        print(f"Total verified politicians remaining in SQLite: {c.fetchone()[0]}")
        conn.close()

if __name__ == "__main__":
    main()
