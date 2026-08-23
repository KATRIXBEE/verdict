import requests
import os
import re
import time
import json
import sqlite3
import sys

# Ensure UTF-8 output on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

LS_DIR = os.path.join(BASE_DIR, "public", "static", "data", "ls-photos")
RS_DIR = os.path.join(BASE_DIR, "public", "static", "data", "rs-photos")
os.makedirs(LS_DIR, exist_ok=True)
os.makedirs(RS_DIR, exist_ok=True)

CHECKPOINT = os.path.join(BASE_DIR, "scripts", "data", "download_checkpoint.json")
os.makedirs(os.path.join(BASE_DIR, "scripts", "data"), exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; VERDICT/1.0)',
    'Referer': 'https://sansad.in/',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
}

def extract_pcode(photo_url):
    if not photo_url:
        return None, None
    match = re.search(r'(P\d+)\.jpg', photo_url, re.IGNORECASE)
    if not match:
        return None, None
    pcode = match.group(1).upper()
    if 'rs-photos' in photo_url or 'rajya' in photo_url.lower():
        return pcode, 'rajya-sabha'
    return pcode, 'lok-sabha'

def download_photo(pcode, house):
    house_dir = RS_DIR if house == 'rajya-sabha' else LS_DIR
    local_path = os.path.join(house_dir, f"{pcode}.jpg")

    # Skip if already downloaded and valid
    if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
        return True, 'cached'

    # Try list of reliable sources
    sources = []
    if house == 'rajya-sabha':
        sources.append(f"https://righttoinformation.wiki/static/data/rs-photos/{pcode}.jpg")
        sources.append(f"https://sansad.in/getFile/pictures/rajya-sabha/members/{pcode}.jpg")
        sources.append(f"https://righttoinformation.wiki/static/data/ls-photos/{pcode}.jpg")
    else:
        sources.append(f"https://righttoinformation.wiki/static/data/ls-photos/{pcode}.jpg")
        sources.append(f"https://sansad.in/getFile/pictures/lok-sabha/members/{pcode}.jpg")
        sources.append(f"https://righttoinformation.wiki/static/data/rs-photos/{pcode}.jpg")

    for remote_url in sources:
        try:
            res = requests.get(remote_url, headers=HEADERS, timeout=12)
            if res.status_code == 200 and len(res.content) > 1000:
                with open(local_path, 'wb') as f:
                    f.write(res.content)
                return True, 'downloaded'
        except Exception:
            continue

    return False, 'all_sources_failed'

def fetch_politicians():
    politicians = []
    seen_ids = set()

    # 1. From SQLite DB
    db_path = os.path.join(BASE_DIR, "data-pipeline", "verdict_pipeline.db")
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("SELECT id, name, photo_url, current_house FROM politicians")
            rows = c.fetchall()
            for r in rows:
                pid = str(r[0])
                if pid not in seen_ids:
                    seen_ids.add(pid)
                    politicians.append({
                        'id': pid,
                        'name': r[1],
                        'photo_url': r[2],
                        'current_house': r[3]
                    })
            conn.close()
        except Exception as e:
            print(f"Warning reading SQLite DB: {e}")

    # 2. From all-mps.json
    all_mps_path = os.path.join(BASE_DIR, "src", "data", "all-mps.json")
    if os.path.exists(all_mps_path):
        try:
            with open(all_mps_path, "r", encoding="utf-8") as f:
                mps = json.load(f)
            for m in mps:
                pid = str(m.get('id') or m.get('slug'))
                if pid not in seen_ids:
                    seen_ids.add(pid)
                    politicians.append({
                        'id': pid,
                        'name': m.get('fullName', ''),
                        'photo_url': m.get('photoUrl', ''),
                        'current_house': m.get('house', 'Lok Sabha')
                    })
                elif m.get('photoUrl') and not any(p['id'] == pid and p.get('photo_url') for p in politicians):
                    for p in politicians:
                        if p['id'] == pid:
                            p['photo_url'] = m.get('photoUrl')
        except Exception as e:
            print(f"Warning reading all-mps.json: {e}")

    return politicians

def main():
    print("=" * 60)
    print("VERDICT -- Sansad.in & Official MP Photo Downloader")
    print("Downloading all MP photos to public/static/data/")
    print("=" * 60)

    # Load checkpoint
    checkpoint = {}
    if os.path.exists(CHECKPOINT):
        try:
            with open(CHECKPOINT) as f:
                checkpoint = json.load(f)
            done = sum(1 for v in checkpoint.values() if v)
            print(f"Resuming -- {done} already recorded in checkpoint\n")
        except Exception:
            checkpoint = {}

    politicians = fetch_politicians()
    print(f"Found {len(politicians)} total politicians to process\n")

    stats = {'downloaded': 0, 'cached': 0, 'failed': 0, 'no_pcode': 0}

    for i, pol in enumerate(politicians):
        pid = str(pol['id'])
        name = pol.get('name', '')
        photo_url = pol.get('photo_url', '')

        pcode, house = extract_pcode(photo_url)

        if not pcode:
            print(f"[{i+1}/{len(politicians)}] [o] No P-code: {name} -- {photo_url[:40] if photo_url else 'None'}")
            stats['no_pcode'] += 1
            checkpoint[pid] = False
            continue

        success, reason = download_photo(pcode, house)

        if success:
            if reason == 'cached':
                stats['cached'] += 1
            else:
                print(f"[{i+1}/{len(politicians)}] [+] {name} ({pcode}) -- {reason}")
                stats['downloaded'] += 1
        else:
            print(f"[{i+1}/{len(politicians)}] [-] {name} ({pcode}) -- {reason}")
            stats['failed'] += 1

        checkpoint[pid] = success

        # Save checkpoint every 25
        if i % 25 == 0:
            with open(CHECKPOINT, 'w') as f:
                json.dump(checkpoint, f, indent=2)

        # Fast polite delay
        time.sleep(0.04)

    # Final checkpoint save
    with open(CHECKPOINT, 'w') as f:
        json.dump(checkpoint, f, indent=2)

    print("\n" + "=" * 60)
    print(f"Downloaded:  {stats['downloaded']}")
    print(f"Cached:      {stats['cached']}")
    print(f"Failed:      {stats['failed']}")
    print(f"No P-code:   {stats['no_pcode']}")
    print(f"\nPhotos saved to:")
    print(f"  {LS_DIR}/")
    print(f"  {RS_DIR}/")
    ls_count = len([f for f in os.listdir(LS_DIR) if f.endswith('.jpg')])
    rs_count = len([f for f in os.listdir(RS_DIR) if f.endswith('.jpg')])
    print(f"\nFiles on disk: {ls_count} LS + {rs_count} RS = {ls_count+rs_count} total")
    print("=" * 60)

if __name__ == "__main__":
    main()
