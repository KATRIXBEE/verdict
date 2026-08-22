import requests
import csv
import io
import json
import os
import sys
import asyncio
from datetime import datetime

# Add project root and data-pipeline to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "data-pipeline"))

from sqlalchemy import select, text
from utils.db import init_db, get_db_session, engine
from utils.models import Politician

LS_CSV = "https://righttoinformation.wiki/static/data/csv/lok-sabha-members.csv"
RS_CSV = "https://righttoinformation.wiki/static/data/csv/rajya-sabha-members.csv"
BILLS_CSV = "https://righttoinformation.wiki/static/data/csv/parliament-bills-2020-2026.csv"
LS_JSON = "https://righttoinformation.wiki/static/data/ls-mps.json?v=1"
RS_JSON = "https://righttoinformation.wiki/static/data/rs-mps.json?v=8"

CACHE_DIR = os.path.join(BASE_DIR, "scripts", "data", "rti_cache")
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "scripts", "data"), exist_ok=True)

HEADERS = {
    'User-Agent': 'VERDICT-CivicTech/1.0 (katrixbee@gmail.com)'
}


def download_csv(url, cache_name):
    cache_path = os.path.join(CACHE_DIR, cache_name)
    if os.path.exists(cache_path):
        print(f"  Loading from cache: {cache_name}")
        with open(cache_path, encoding='utf-8') as f:
            return list(csv.DictReader(f))
    
    print(f"  Downloading: {url}")
    try:
        res = requests.get(url, headers=HEADERS, timeout=30)
        res.raise_for_status()
        
        with open(cache_path, 'w', encoding='utf-8') as f:
            f.write(res.text)
        
        reader = csv.DictReader(io.StringIO(res.text))
        return list(reader)
    except Exception as e:
        print(f"  Failed downloading {url}: {e}")
        return []


def download_json(url, cache_name):
    cache_path = os.path.join(CACHE_DIR, cache_name)
    if os.path.exists(cache_path):
        print(f"  Loading from cache: {cache_name}")
        with open(cache_path, encoding='utf-8') as f:
            return json.load(f)
    
    print(f"  Downloading: {url}")
    try:
        res = requests.get(url, headers=HEADERS, timeout=30)
        res.raise_for_status()
        data = res.json()
        
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return data
    except Exception as e:
        print(f"  Failed downloading {url}: {e}")
        return []


def normalise(name):
    if not name:
        return ''
    cleaned = str(name)
    for t in ['Dr.', 'Dr ', 'Smt.', 'Smt ', 'Shri ', 'Prof.',
              'Adv.', 'Er.', 'Mr.', 'Mrs.', 'Ms.', 'Col.', 'Gen.',
              '(Dr.)', '(Adv.)', 'Kumar', 'Singh', 'Chaudhary']:
        cleaned = cleaned.replace(t, '')
    # Remove special chars and extra spaces
    cleaned = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in cleaned)
    return ' '.join(cleaned.lower().split())


def clean_exact_name(name):
    if not name:
        return ''
    cleaned = str(name)
    for t in ['Dr.', 'Dr ', 'Smt.', 'Smt ', 'Shri ', 'Prof.',
              'Adv.', 'Er.', 'Mr.', 'Mrs.', 'Ms.', 'Col.', 'Gen.',
              '(Dr.)', '(Adv.)']:
        cleaned = cleaned.replace(t, '')
    cleaned = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in cleaned)
    return ' '.join(cleaned.lower().split())


async def ensure_db_columns():
    """Ensure newly added columns exist in sqlite if not already present."""
    async with engine.begin() as conn:
        for col_def in [
            ("portfolio_history", "JSON"),
            ("email", "VARCHAR(255)"),
            ("mp_code", "VARCHAR(100)")
        ]:
            try:
                await conn.execute(text(f"ALTER TABLE politicians ADD COLUMN {col_def[0]} {col_def[1]}"))
            except Exception:
                pass  # Column already exists


async def main_async():
    print("=" * 60)
    print("VERDICT — RTI Wiki Data Importer")
    print("Source: righttoinformation.wiki (CC-BY 4.0)")
    print("=" * 60)

    # 1. Download all datasets
    print("\nDownloading Lok Sabha members...")
    ls_members = download_csv(LS_CSV, "ls_members.csv")
    print(f"  Got {len(ls_members)} Lok Sabha MPs")

    print("Downloading Rajya Sabha members...")
    rs_members = download_csv(RS_CSV, "rs_members.csv")
    print(f"  Got {len(rs_members)} Rajya Sabha MPs")

    print("Downloading Parliament Bills...")
    bills = download_csv(BILLS_CSV, "bills.csv")
    print(f"  Got {len(bills)} bills")

    # Try JSON sources too — may have more fields
    ls_json = []
    rs_json = []
    try:
        ls_json = download_json(LS_JSON, "ls_mps.json")
        rs_json = download_json(RS_JSON, "rs_mps.json")
        print(f"  JSON: {len(ls_json) if isinstance(ls_json, list) else '?'} LS")
        print(f"  JSON: {len(rs_json) if isinstance(rs_json, list) else '?'} RS")
    except Exception as e:
        print(f"  JSON download failed (CSV is sufficient): {e}")

    # Build photo lookup from RTI Wiki data
    # Key: normalised name -> photo URL + full data
    photo_map = {}
    full_data_map = {}

    def extract_record_data(mp, house_type):
        name = (mp.get('name') or mp.get('Name') or mp.get('mp_name') or '').strip()
        photo = (mp.get('official photo URL') or 
                 mp.get('photo_url') or 
                 mp.get('photo') or 
                 mp.get('Image') or 
                 mp.get('image_url') or '').strip()
        wiki = (mp.get('Wikipedia URL') or 
                mp.get('wikipedia_url') or 
                mp.get('wikipedia') or '').strip()
        portfolio = (mp.get('ministerial portfolio') or 
                     mp.get('portfolio') or 
                     mp.get('Ministerial Portfolio') or '').strip()
        
        return {
            'name': name,
            'photo_url': photo or None,
            'wikipedia_url': wiki or None,
            'constituency': mp.get('constituency') or mp.get('Constituency') or None,
            'state': mp.get('state') or mp.get('State') or None,
            'party': mp.get('party') or mp.get('Party') or None,
            'dob': mp.get('DOB') or mp.get('dob') or mp.get('Date of Birth') or None,
            'age': mp.get('age') or mp.get('Age') or None,
            'profession': mp.get('profession') or mp.get('Profession') or None,
            'qualification': mp.get('qualification') or mp.get('Qualification') or mp.get('education') or None,
            'terms_served': mp.get('terms served') or mp.get('terms_served') or mp.get('Terms') or None,
            'email': mp.get('email') or mp.get('Email') or None,
            'phone': mp.get('phone') or mp.get('mobile') or mp.get('Phone') or None,
            'ministerial_portfolio': portfolio or None,
            'role': mp.get('role') or None,
            'term_end': mp.get('term-end date') or mp.get('Term End') or None,
            'house': house_type,
            'mp_code': mp.get('MP code') or mp.get('mp_code') or mp.get('Code') or None,
        }

    # Process LS CSV
    for mp in ls_members:
        data = extract_record_data(mp, 'Lok Sabha')
        if data['name']:
            k_exact = clean_exact_name(data['name'])
            k_norm = normalise(data['name'])
            if data['photo_url']:
                photo_map[k_exact] = data['photo_url']
                photo_map[k_norm] = data['photo_url']
            full_data_map[k_exact] = data
            full_data_map[k_norm] = data

    # Process RS CSV
    for mp in rs_members:
        data = extract_record_data(mp, 'Rajya Sabha')
        if data['name']:
            k_exact = clean_exact_name(data['name'])
            k_norm = normalise(data['name'])
            if data['photo_url']:
                if k_exact not in photo_map:
                    photo_map[k_exact] = data['photo_url']
                if k_norm not in photo_map:
                    photo_map[k_norm] = data['photo_url']
            if k_exact not in full_data_map:
                full_data_map[k_exact] = data
            if k_norm not in full_data_map:
                full_data_map[k_norm] = data

    # Process JSON datasets if available
    if isinstance(ls_json, list):
        for mp in ls_json:
            data = extract_record_data(mp, 'Lok Sabha')
            if data['name']:
                k_exact = clean_exact_name(data['name'])
                k_norm = normalise(data['name'])
                if data['photo_url']:
                    photo_map[k_exact] = data['photo_url']
                    photo_map[k_norm] = data['photo_url']
                if k_exact not in full_data_map or not full_data_map[k_exact].get('photo_url'):
                    full_data_map[k_exact] = data
                if k_norm not in full_data_map or not full_data_map[k_norm].get('photo_url'):
                    full_data_map[k_norm] = data

    if isinstance(rs_json, list):
        for mp in rs_json:
            data = extract_record_data(mp, 'Rajya Sabha')
            if data['name']:
                k_exact = clean_exact_name(data['name'])
                k_norm = normalise(data['name'])
                if data['photo_url']:
                    photo_map[k_exact] = data['photo_url']
                    photo_map[k_norm] = data['photo_url']
                if k_exact not in full_data_map or not full_data_map[k_exact].get('photo_url'):
                    full_data_map[k_exact] = data
                if k_norm not in full_data_map or not full_data_map[k_norm].get('photo_url'):
                    full_data_map[k_norm] = data

    print(f"\nPhoto map built: {len(photo_map)} politician keys with photos")

    # Save data files for other scripts to use
    with open(os.path.join(BASE_DIR, "scripts", "data", "rti_photo_map.json"), 'w', encoding='utf-8') as f:
        json.dump(photo_map, f, ensure_ascii=False, indent=2)
    
    with open(os.path.join(BASE_DIR, "scripts", "data", "rti_full_data.json"), 'w', encoding='utf-8') as f:
        json.dump(full_data_map, f, ensure_ascii=False, indent=2)

    with open(os.path.join(BASE_DIR, "scripts", "data", "bills_data.json"), 'w', encoding='utf-8') as f:
        json.dump(bills, f, ensure_ascii=False, indent=2)

    print(f"Data saved to scripts/data/")

    # 2. Update Database & all-mps.json
    await init_db()
    await ensure_db_columns()

    # Load all-mps.json for frontend sync
    all_mps_path = os.path.join(BASE_DIR, "src", "data", "all-mps.json")
    all_mps = []
    if os.path.exists(all_mps_path):
        with open(all_mps_path, "r", encoding="utf-8") as f:
            all_mps = json.load(f)

    all_mps_by_name = {}
    for mp_obj in all_mps:
        all_mps_by_name[clean_exact_name(mp_obj["fullName"])] = mp_obj
        all_mps_by_name[normalise(mp_obj["fullName"])] = mp_obj

    total_updated = 0
    photos_found = 0
    still_no_photo = 0

    async with get_db_session() as session:
        stmt = select(Politician)
        result = await session.execute(stmt)
        politicians = result.scalars().all()
        print(f"\nEvaluating {len(politicians)} politicians in database...")

        for pol in politicians:
            p_name = pol.name
            k_exact = clean_exact_name(p_name)
            k_norm = normalise(p_name)

            # Match lookup
            matched_data = full_data_map.get(k_exact) or full_data_map.get(k_norm)
            
            # Partial matching if not found
            if not matched_data:
                for map_k, map_val in full_data_map.items():
                    if not map_k or len(map_k) < 4:
                        continue
                    if map_k in k_exact or k_exact in map_k or map_k in k_norm or k_norm in map_k:
                        matched_data = map_val
                        break

            # Check direct photo map
            direct_photo = photo_map.get(k_exact) or photo_map.get(k_norm)
            if not direct_photo and matched_data:
                direct_photo = matched_data.get('photo_url')

            updated_fields = []

            if direct_photo:
                pol.photo_url = direct_photo
                updated_fields.append("photo_url (RTI official)")
                photos_found += 1
            elif pol.photo_url:
                photos_found += 1
            else:
                still_no_photo += 1

            if matched_data:
                if not pol.wikipedia_url and matched_data.get('wikipedia_url'):
                    pol.wikipedia_url = matched_data['wikipedia_url']
                    updated_fields.append("wikipedia_url")
                if not pol.profession and matched_data.get('profession'):
                    pol.profession = matched_data['profession']
                    updated_fields.append("profession")
                if not pol.education and matched_data.get('qualification'):
                    pol.education = matched_data['qualification']
                    updated_fields.append("education")
                if hasattr(pol, 'email') and not pol.email and matched_data.get('email'):
                    pol.email = matched_data['email']
                    updated_fields.append("email")
                if hasattr(pol, 'mp_code') and not pol.mp_code and matched_data.get('mp_code'):
                    pol.mp_code = matched_data['mp_code']
                    updated_fields.append("mp_code")

            if updated_fields:
                total_updated += 1

            # Sync with all-mps frontend array
            frontend_match = all_mps_by_name.get(k_exact) or all_mps_by_name.get(k_norm)
            if frontend_match:
                if pol.photo_url:
                    frontend_match["photoUrl"] = pol.photo_url
                if pol.profession:
                    frontend_match["professionDeclared"] = pol.profession
                if pol.education:
                    frontend_match["educationDegree"] = pol.education

        await session.commit()

    # Save updated all-mps.json
    if all_mps:
        with open(all_mps_path, "w", encoding="utf-8") as f:
            json.dump(all_mps, f, ensure_ascii=False, indent=2)
        print(f"Synced {len(all_mps)} MPs to src/data/all-mps.json")

    print("\n" + "=" * 60)
    print("RESULTS SUMMARY")
    print("=" * 60)
    print(f"Total politicians in DB:       {len(politicians)}")
    print(f"Politicians updated:           {total_updated}")
    print(f"Politicians with photos now:   {photos_found}")
    print(f"Politicians still without:     {still_no_photo}")
    print("=" * 60)
    print("Run complete. Check scripts/data/rti_photo_map.json")
    print("RTI Wiki provides official government photos —")
    print("these are the same photos on sansad.in and")
    print("rajyasabha.nic.in, sourced directly from their APIs.")


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
