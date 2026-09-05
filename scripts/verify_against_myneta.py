import json
import requests
import time
import re
import os
import sys
from bs4 import BeautifulSoup

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

def normalise(name):
    if not name:
        return ''
    # strip quoted nicknames
    name = re.sub(r"['\"]([^'\"]+)['\"]", '', name)
    # strip common honorifics and titles
    for t in [
        'Dr.', 'Col.', 'Smt.', 'Shri ', 'Prof.', '(Retd.)', '(Retd)',
        'Adv.', 'Er.', 'Justice', 'Chhatrapati', 'Shrimant', 'Kunwar',
        'Shri', 'Smt', 'Dr', 'Prof', 'Adv'
    ]:
        name = name.replace(t, '')
    # strip punctuation and extra whitespace
    name = re.sub(r"[.,()[\]\-_'\"/&]", ' ', name)
    return re.sub(r'\s+', ' ', name).strip().lower()

def check_rti_wiki(name, constituency):
    """Check against the local RTI Wiki cache (908 politicians)"""
    try:
        with open('scripts/data/rti_full_data.json', encoding='utf-8') as f:
            rti_data = json.load(f)
    except FileNotFoundError:
        return {'found': False, 'source': 'RTI Wiki', 'error': 'file_not_found'}

    norm_name = normalise(name)
    norm_const = normalise(constituency)
    for key, entry in rti_data.items():
        norm_key = normalise(key)
        actual_const = normalise(entry.get('constituency', ''))
        # If name matches, check if constituency matches or is not conflicting
        if norm_name and (norm_name == norm_key):
            if not norm_const or norm_const in actual_const or actual_const in norm_const:
                return {
                    'found': True,
                    'source': 'RTI Wiki',
                    'actual_name': entry.get('name'),
                    'actual_constituency': entry.get('constituency'),
                    'actual_party': entry.get('party'),
                }
    return {'found': False, 'source': 'RTI Wiki'}

def check_myneta_winners_local(name, constituency):
    """Check against local MyNeta 2024 winners dataset (483 winners)"""
    try:
        with open('scripts/data/myneta_winners_2024.json', encoding='utf-8') as f:
            winners = json.load(f)
    except FileNotFoundError:
        return {'found': False, 'source': 'MyNeta Winners 2024 Local'}

    norm_name = normalise(name)
    norm_const = normalise(constituency)
    for w in winners:
        w_norm = normalise(w.get('name', ''))
        w_const = normalise(w.get('constituency', ''))
        # Require strong name similarity AND constituency alignment
        if norm_name and (norm_name == w_norm or norm_name in w_norm or w_norm in norm_name):
            if not norm_const or norm_const in w_const or w_const in norm_const:
                return {
                    'found': True,
                    'source': 'MyNeta Winners 2024 Local',
                    'actual_name': w.get('name'),
                    'actual_constituency': w.get('constituency'),
                    'actual_party': w.get('party'),
                    'url': w.get('url'),
                }
    return {'found': False, 'source': 'MyNeta Winners 2024 Local'}

def check_all_mps_local(name, constituency):
    """Check against verified ECI all-mps.json dataset (546 MPs)"""
    try:
        with open('src/data/all-mps.json', encoding='utf-8') as f:
            all_mps = json.load(f)
    except FileNotFoundError:
        return {'found': False, 'source': 'ECI all-mps.json'}

    norm_name = normalise(name)
    norm_const = normalise(constituency)
    for mp in all_mps:
        mp_name = normalise(mp.get('fullName') or mp.get('name', ''))
        mp_const = normalise(mp.get('currentConstituency', {}).get('name', '') if isinstance(mp.get('currentConstituency'), dict) else str(mp.get('currentConstituency', '')))
        if norm_name and (norm_name == mp_name or norm_name in mp_name or mp_name in norm_name):
            if not norm_const or norm_const in mp_const or mp_const in norm_const:
                return {
                    'found': True,
                    'source': 'ECI all-mps.json',
                    'actual_name': mp.get('fullName') or mp.get('name'),
                    'actual_constituency': mp_const,
                    'actual_party': mp.get('partyAbbr') or mp.get('currentParty'),
                }
    return {'found': False, 'source': 'ECI all-mps.json'}

def check_myneta_search(name):
    """Live search on MyNeta as secondary/final online verification"""
    try:
        time.sleep(1.0)
        norm_name = normalise(name)
        search_query = norm_name.replace(' ', '+')
        search_url = f"https://www.myneta.info/candidate/?action=show&type=name&name={search_query}"
        res = requests.get(search_url, headers=HEADERS, timeout=12)
        if res.status_code != 200:
            return {'found': False, 'source': 'MyNeta.info Live', 'status': res.status_code}
        soup = BeautifulSoup(res.content, 'html.parser')

        candidates = soup.find_all('a', href=re.compile(r'candidate_id=\d+'))

        matches = []
        for c in candidates[:5]:
            text = c.get_text(strip=True)
            if text:
                matches.append(text)

        return {
            'found': len(matches) > 0,
            'source': 'MyNeta.info Live',
            'possible_matches': matches,
        }
    except Exception as e:
        return {'found': False, 'source': 'MyNeta.info Live', 'error': str(e)}

def main():
    print("=" * 70)
    print("VERDICT — CROSS-VERIFICATION AGAINST GROUND TRUTH SOURCES")
    print("=" * 70)

    report_path = 'scripts/audit/fabricated_data_report.json'
    if not os.path.exists(report_path):
        print(f"[ERROR] {report_path} not found. Run scripts/audit_fabricated_data.py first.")
        return

    with open(report_path, encoding='utf-8') as f:
        report = json.load(f)

    all_flagged = report.get('high_confidence_fake', []) + report.get('needs_review', [])
    print(f"Loaded {len(all_flagged)} flagged entries for verification.\n")

    verification_results = []

    for idx, entry in enumerate(all_flagged, 1):
        name = entry['name']
        constituency = entry.get('constituency', '') or ''
        party = entry.get('party', '') or ''

        print(f"[{idx}/{len(all_flagged)}] Checking: {name} ({constituency}, {party})")

        # 1. Check RTI Wiki cache
        rti_check = check_rti_wiki(name, constituency)
        
        # 2. Check MyNeta 2024 winners local
        myneta_local_check = None
        if not rti_check.get('found'):
            myneta_local_check = check_myneta_winners_local(name, constituency)

        # 3. Check ECI all-mps.json local
        eci_check = None
        if not rti_check.get('found') and not (myneta_local_check and myneta_local_check.get('found')):
            eci_check = check_all_mps_local(name, constituency)

        # 4. Live MyNeta check if not found in local datasets
        myneta_live_check = None
        if (
            not rti_check.get('found') and
            not (myneta_local_check and myneta_local_check.get('found')) and
            not (eci_check and eci_check.get('found'))
        ):
            print(f"    Searching MyNeta.info live...")
            myneta_live_check = check_myneta_search(name)

        confirmed_real = (
            rti_check.get('found') or
            (myneta_local_check and myneta_local_check.get('found')) or
            (eci_check and eci_check.get('found')) or
            (myneta_live_check and myneta_live_check.get('found'))
        )

        verified_via = None
        if rti_check.get('found'):
            verified_via = 'RTI Wiki Cache'
        elif myneta_local_check and myneta_local_check.get('found'):
            verified_via = 'MyNeta 2024 Winners (Local)'
        elif eci_check and eci_check.get('found'):
            verified_via = 'ECI Form 26 Archive (all-mps.json)'
        elif myneta_live_check and myneta_live_check.get('found'):
            verified_via = 'MyNeta.info Live Directory'

        verdict = 'CONFIRMED_REAL' if confirmed_real else 'LIKELY_FABRICATED'
        status_symbol = '[REAL]' if confirmed_real else '[FABRICATED]'
        print(f"    -> {status_symbol} (Via: {verified_via or 'NO MATCH'})")

        verification_results.append({
            **entry,
            'rti_wiki_check': rti_check,
            'myneta_local_check': myneta_local_check,
            'eci_check': eci_check,
            'myneta_live_check': myneta_live_check,
            'verified_via': verified_via,
            'final_verdict': verdict,
        })

    # Save verification results
    os.makedirs('scripts/audit', exist_ok=True)
    with open('scripts/audit/verification_results.json', 'w', encoding='utf-8') as f:
        json.dump(verification_results, f, ensure_ascii=False, indent=2)

    confirmed_fake = [r for r in verification_results if r['final_verdict'] == 'LIKELY_FABRICATED']
    confirmed_real = [r for r in verification_results if r['final_verdict'] == 'CONFIRMED_REAL']

    print(f"\n{'='*70}")
    print("VERIFICATION COMPLETE")
    print(f"{'='*70}")
    print(f"CONFIRMED REAL (keep):        {len(confirmed_real)}")
    print(f"LIKELY FABRICATED (delete):   {len(confirmed_fake)}")
    print(f"\nFabricated entries to be removed ({len(confirmed_fake)}):")
    for f in confirmed_fake:
        print(f"  [X] {f['name']} | {f['party']} | {f['constituency']} (Flags: {', '.join(f.get('flags', []))})")

    print(f"\nFull verification saved to: scripts/audit/verification_results.json")
    print(f"\nNEXT STEP: Review the list above, then generate review report:")
    print(f"scripts/audit/FABRICATED_DATA_REVIEW.md")

if __name__ == "__main__":
    main()
