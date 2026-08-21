import requests
import time
import json
import os
import sys
from pathlib import Path

# Add project root and data-pipeline to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
PIPELINE_DIR = PROJECT_ROOT / "data-pipeline"
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PIPELINE_DIR))

# Reconfigure stdout for Windows UTF-8
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from config import DATABASE_URL
from utils.db import init_db, get_db_session
from utils.models import Politician
from sqlalchemy import select, update
import asyncio

CHECKPOINT_FILE = "scripts/data/image_fix_checkpoint.json"
LOG_FILE = "scripts/data/image_fix_log.json"
FRONTEND_JSON = "src/data/all-mps.json"

os.makedirs("scripts/data", exist_ok=True)

HEADERS = {
    'User-Agent': 'VERDICT-CivicTech/1.0 (Educational research project; contact: katrixbee@gmail.com)'
}

# Hardcoded Wikipedia page titles for major politicians
# whose names need exact matching
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
    "Uddhav Thackeray": "Uddhav_Thackeray",
    "Sharad Pawar": "Sharad_Pawar",
    "Omar Abdullah": "Omar_Abdullah_(politician)",
    "Farooq Abdullah": "Farooq_Abdullah",
    "Hemant Soren": "Hemant_Soren",
    "Bhupesh Baghel": "Bhupesh_Baghel",
    "Asaduddin Owaisi": "Asaduddin_Owaisi",
    "Supriya Sule": "Supriya_Sule",
    "Dimple Yadav": "Dimple_Yadav",
    "Hema Malini": "Hema_Malini",
    "Kangana Ranaut": "Kangana_Ranaut",
    "Manoj Tiwari": "Manoj_Tiwari_(politician)",
    "Chirag Paswan": "Chirag_Paswan",
    "Ram Vilas Paswan": "Ram_Vilas_Paswan",
    "Piyush Goyal": "Piyush_Goyal",
    "S. Jaishankar": "S._Jaishankar",
    "Dharmendra Pradhan": "Dharmendra_Pradhan",
    "Jyotiraditya Scindia": "Jyotiraditya_Scindia",
    "Shivraj Singh Chouhan": "Shivraj_Singh_Chouhan",
    "Devendra Fadnavis": "Devendra_Fadnavis",
    "Eknath Shinde": "Eknath_Shinde",
    "Pushkar Singh Dhami": "Pushkar_Singh_Dhami",
    "Bhajan Lal Sharma": "Bhajan_Lal_Sharma",
    "Mohan Yadav": "Mohan_Yadav_(politician)",
    "Vishnu Deo Sai": "Vishnu_Deo_Sai",
    "Shashi Tharoor": "Shashi_Tharoor",
    "Kiren Rijiju": "Kiren_Rijiju",
    "Manish Tewari": "Manish_Tewari",
    "Tejasvi Surya": "Tejasvi_Surya",
    "Mahua Moitra": "Mahua_Moitra",
    "Abhishek Banerjee": "Abhishek_Banerjee",
    "Shatrughan Prasad Sinha": "Shatrughan_Sinha",
    "Praveen Khandelwal": "Praveen_Khandelwal",
    "Dayanidhi Maran": "Dayanidhi_Maran",
    "Harsimrat Kaur Badal": "Harsimrat_Kaur_Badal",
    "Giriraj Singh": "Giriraj_Singh",
    "Jagadish Shettar": "Jagadish_Shettar",
}


def clean_name_for_wiki(name):
    """Remove titles and format for Wikipedia URL"""
    if not name:
        return None
    # Remove common Indian political titles
    for title in ['Dr.', 'Dr ', 'Smt.', 'Smt ', 'Shri ', 'Shri.',
                  'Prof.', 'Prof ', 'Adv.', 'Adv ', 'Er.', 'Er ',
                  'Gen.', 'Col.', 'Lt.', 'Capt.', 'Maj.']:
        name = name.replace(title, '').strip()
    return name.replace(' ', '_')


def get_wikipedia_image(name):
    """
    Try multiple Wikipedia search strategies to find
    a high quality image for the politician.
    Returns image URL or None.
    """
    time.sleep(0.5)  # Polite request delay

    # Check hardcoded overrides first
    wiki_title = WIKI_OVERRIDES.get(name)

    if not wiki_title:
        wiki_title = clean_name_for_wiki(name)

    if not wiki_title:
        return None

    # Strategy 1: Direct Wikipedia REST API summary
    attempts = [
        wiki_title,
        f"{wiki_title}_politician",
        f"{wiki_title}_(politician)",
        f"{wiki_title}_India",
        f"{wiki_title}_(Indian_politician)",
    ]

    for attempt in attempts:
        try:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{attempt}"
            res = requests.get(url, headers=HEADERS, timeout=8)

            if res.status_code == 200:
                data = res.json()
                thumbnail = data.get('thumbnail', {})
                if thumbnail and thumbnail.get('source'):
                    img_url = thumbnail['source']
                    # Upgrade to larger image size (400px)
                    import re
                    img_url = re.sub(r'/\d+px-', '/400px-', img_url)
                    return img_url
                # Page exists but no image
                break

        except Exception as e:
            time.sleep(1)
            continue

    # Strategy 2: Wikipedia API pageimages
    try:
        api_url = (
            f"https://en.wikipedia.org/w/api.php"
            f"?action=query"
            f"&titles={wiki_title}"
            f"&prop=pageimages"
            f"&format=json"
            f"&pithumbsize=400"
        )
        res = requests.get(api_url, headers=HEADERS, timeout=8)
        if res.status_code == 200:
            data = res.json()
            pages = data.get('query', {}).get('pages', {})
            for page_id, page in pages.items():
                if page_id != '-1' and 'thumbnail' in page:
                    return page['thumbnail'].get('source')
    except Exception as e:
        pass

    return None


async def async_main():
    print("=" * 60, flush=True)
    print("VERDICT — Image Fix Script", flush=True)
    print("Replacing bad photos with Wikipedia images", flush=True)
    print("=" * 60, flush=True)

    await init_db()

    # Load checkpoint
    checkpoint = {}
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, encoding='utf-8') as f:
            checkpoint = json.load(f)
        print(f"Resuming from checkpoint — {len(checkpoint)} already processed", flush=True)

    # 1. Fetch all politicians from DB
    async with get_db_session() as session:
        stmt = select(Politician.id, Politician.name, Politician.photo_url)
        results_db = (await session.execute(stmt)).all()
        politicians = [{"id": str(r[0]), "name": r[1], "photo_url": r[2]} for r in results_db]

    print(f"Total politicians to process: {len(politicians)}", flush=True)

    results = {
        'updated': 0,
        'already_good': 0,
        'no_image_found': 0,
        'errors': 0,
        'log': []
    }

    # Load frontend JSON for simultaneous in-memory update
    frontend_mps = []
    if os.path.exists(FRONTEND_JSON):
        with open(FRONTEND_JSON, "r", encoding="utf-8") as f:
            frontend_mps = json.load(f)

    frontend_map = {m["fullName"].lower(): m for m in frontend_mps}

    for i, politician in enumerate(politicians):
        pid = str(politician['id'])
        name = politician['name']
        old_url = politician.get('photo_url')

        # Skip if already processed in a previous run
        if pid in checkpoint:
            print(f"[{i+1}/{len(politicians)}] Skipping (cached): {name}", flush=True)
            continue

        print(f"[{i+1}/{len(politicians)}] Processing: {name}", flush=True)

        try:
            new_url = get_wikipedia_image(name)

            if new_url:
                # 2. Update photo_url in DB
                async with get_db_session() as session:
                    stmt_update = update(Politician).where(Politician.id == pid).values(photo_url=new_url)
                    await session.execute(stmt_update)
                    await session.commit()

                # Also update frontend JSON
                if name.lower() in frontend_map:
                    frontend_map[name.lower()]["photoUrl"] = new_url

                print(f"    ✓ Updated: {new_url[:60]}...", flush=True)
                results['updated'] += 1
                results['log'].append({
                    'name': name,
                    'old': old_url,
                    'new': new_url,
                    'status': 'updated'
                })
            else:
                print(f"    ○ No Wikipedia image found — keeping existing", flush=True)
                results['no_image_found'] += 1
                results['log'].append({
                    'name': name,
                    'old': old_url,
                    'new': None,
                    'status': 'no_image_found'
                })

        except Exception as e:
            print(f"    ✗ Error: {e}", flush=True)
            results['errors'] += 1

        # Save checkpoint after every item
        checkpoint[pid] = True
        with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
            json.dump(checkpoint, f, indent=2)

        # Save frontend JSON periodically
        if (i + 1) % 25 == 0 or (i + 1) == len(politicians):
            with open(FRONTEND_JSON, "w", encoding="utf-8") as f:
                json.dump(list(frontend_map.values()), f, ensure_ascii=False, indent=2)

    # Save final frontend JSON and log
    with open(FRONTEND_JSON, "w", encoding="utf-8") as f:
        json.dump(list(frontend_map.values()), f, ensure_ascii=False, indent=2)

    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(results['log'], f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60, flush=True)
    print(f"DONE", flush=True)
    print(f"Images updated:       {results['updated']}", flush=True)
    print(f"No image found:       {results['no_image_found']}", flush=True)
    print(f"Errors:               {results['errors']}", flush=True)
    print(f"Full log saved to:    {LOG_FILE}", flush=True)
    print("=" * 60, flush=True)


def main():
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
