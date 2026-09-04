import os
import json
import requests
from datetime import date

def get_env_var(key):
    val = os.environ.get(key)
    if val:
        return val
    env_file = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith(f"{key}="):
                    return line.split('=', 1)[1].strip().strip('"').strip("'")
    return ""

SUPABASE_URL = get_env_var("NEXT_PUBLIC_SUPABASE_URL") or "https://ksdqughrmrburubgbtba.supabase.co"
SERVICE_KEY = get_env_var("SUPABASE_SERVICE_ROLE_KEY")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal"
}

def main():
    print("Taking daily score snapshot...")
    today = date.today().isoformat()
    snapshots = []

    # 1. Try Supabase first
    politicians = []
    if SERVICE_KEY:
        try:
            res = requests.get(
                f"{SUPABASE_URL}/rest/v1/politicians"
                f"?select=id,slug,verdict_score,criminal_case_count,attendance_percent",
                headers=HEADERS,
                timeout=10
            )
            if res.status_code == 200:
                politicians = res.json()
        except Exception as e:
            print(f"Supabase request failed ({e}), falling back to local dataset...")

    # Fallback to local dataset if Supabase returned nothing
    if not politicians:
        mock_file = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'all-mps.json')
        if os.path.exists(mock_file):
            with open(mock_file, 'r', encoding='utf-8') as f:
                politicians = json.load(f)

    for p in politicians:
        score = p.get('verdict_score') or p.get('calculatedVerdictScore')
        if score is None:
            continue
        p_id = p.get('id')
        p_slug = p.get('slug')
        cases = p.get('criminal_case_count') or p.get('criminalCaseCount') or 0
        attendance = p.get('attendance_percent') or p.get('attendancePercentage')

        snapshots.append({
            "politician_id": p_id,
            "politician_slug": p_slug,
            "verdict_score": float(score),
            "criminal_case_count": cases,
            "attendance_percent": float(attendance) if attendance is not None else None,
            "snapshot_date": today,
        })

    # Try inserting to Supabase if connected
    if SERVICE_KEY and politicians:
        try:
            for i in range(0, len(snapshots), 100):
                batch = snapshots[i:i+100]
                requests.post(
                    f"{SUPABASE_URL}/rest/v1/score_snapshots",
                    headers=HEADERS,
                    json=batch,
                    timeout=10
                )
        except Exception as e:
            print(f"Notice: Supabase remote insert error: {e}")

    # Also save to local snapshot cache so SSR/fallback API routes have data
    cache_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(cache_dir, exist_ok=True)
    cache_path = os.path.join(cache_dir, 'score_snapshots.json')

    existing_snapshots = []
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                existing_snapshots = json.load(f)
        except Exception:
            existing_snapshots = []

    # Merge by politician_id and snapshot_date
    seen = {(s.get("politician_id"), s.get("snapshot_date")) for s in existing_snapshots}
    for s in snapshots:
        key = (s.get("politician_id"), s.get("snapshot_date"))
        if key not in seen:
            existing_snapshots.append(s)
            seen.add(key)

    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(existing_snapshots, f, indent=2)

    print(f"Snapshot complete: {len(snapshots)} politicians recorded for {today}")

if __name__ == "__main__":
    main()
