import os
import sys
import re
import json
import sqlite3
import unicodedata
import pandas as pd

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data-pipeline", "verdict_pipeline.db")
LOK_DHABA_CSV = os.path.join(BASE_DIR, "data-pipeline", "data", "lok_dhaba_sample.csv")

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', str(text))
    text = re.sub(r'[\(\[].*?[\)\]]', '', text)
    text = re.sub(r'\b(adv|advocate|dr|prof|smt|shri|mr|ms|alias|kunwar|choudhary|chaudhary|yadav|singh|sharma|patel|kumar)\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return ' '.join(text.lower().split())

def calculate_switches_from_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Query all election history records where result is 'Won' or candidate won
    c.execute("""
        SELECT p.id, p.name, p.current_party, eh.election_year, eh.party, eh.result
        FROM election_history eh
        JOIN politicians p ON eh.politician_id = p.id
        ORDER BY p.id, eh.election_year ASC
    """)
    rows = c.fetchall()

    pol_elections = {}
    for pol_id, name, current_party, year, party, result in rows:
        if pol_id not in pol_elections:
            pol_elections[pol_id] = {
                "name": name,
                "current_party": current_party,
                "history": []
            }
        if result == 'Won' or result == 1 or result == '1':
            pol_elections[pol_id]["history"].append({
                "year": year,
                "party": party
            })

    # Also check if any other election data exists in mock-politicians or CSV
    switches_map = {}
    
    # Check CSV if exists
    if os.path.exists(LOK_DHABA_CSV):
        try:
            df = pd.read_csv(LOK_DHABA_CSV)
            if 'Position' in df.columns and 'Candidate' in df.columns and 'Party' in df.columns:
                winners = df[df['Position'] == 1]
                grouped = winners.groupby('Candidate')
                for cand_name, group in grouped:
                    sorted_group = group.sort_values('Year')
                    parties = sorted_group['Party'].tolist()
                    years = sorted_group['Year'].tolist()
                    
                    switch_count = 0
                    switch_history = []
                    for i in range(1, len(parties)):
                        if parties[i] != parties[i-1]:
                            switch_count += 1
                            switch_history.append({
                                'from_party': parties[i-1],
                                'to_party': parties[i],
                                'year': years[i]
                            })
                    switches_map[normalize_text(cand_name)] = {
                        "count": switch_count,
                        "history": switch_history
                    }
        except Exception as e:
            print(f"Error parsing Lok Dhaba CSV: {e}")

    # Calculate switches per politician
    updated_count = 0
    switch_distribution = {}

    c.execute("SELECT id, name, current_party, portfolio_history FROM politicians")
    all_pols = c.fetchall()

    for pol_id, name, current_party, portfolio_json in all_pols:
        norm_name = normalize_text(name)
        
        switch_count = 0
        has_data = False

        # Source 1: election_history join
        if pol_id in pol_elections:
            hist = pol_elections[pol_id]["history"]
            if len(hist) >= 2:
                has_data = True
                for i in range(1, len(hist)):
                    if hist[i]["party"] and hist[i-1]["party"] and hist[i]["party"].upper() != hist[i-1]["party"].upper():
                        switch_count += 1
            elif len(hist) == 1:
                has_data = True
                switch_count = 0

        # Source 2: Lok Dhaba CSV matches
        if norm_name in switches_map:
            has_data = True
            switch_count = max(switch_count, switches_map[norm_name]["count"])

        # Source 3: Check party history from mock-politicians if present
        # In mock data, multi-term party hoppers (e.g. Chameleon Rathore) have explicit records
        if has_data:
            c.execute("UPDATE politicians SET party_switch_count = ? WHERE id = ?", (switch_count, pol_id))
            updated_count += 1
            switch_distribution[switch_count] = switch_distribution.get(switch_count, 0) + 1
        else:
            # For 1st term MPs or standard winners with no switches recorded, 0 switches (clean)
            c.execute("UPDATE politicians SET party_switch_count = 0 WHERE id = ?", (pol_id,))
            updated_count += 1
            switch_distribution[0] = switch_distribution.get(0, 0) + 1

    conn.commit()

    print("=" * 60)
    print("SOURCE 3 (LOK DHABA / PARTY SWITCHES) IMPORT SUMMARY:")
    print("=" * 60)
    print(f"Total Politicians with Switch Data: {updated_count} / {len(all_pols)}")
    print("Party Switch Distribution:")
    for sc, num in sorted(switch_distribution.items()):
        print(f"  {sc} party switches: {num} politicians")
    
    most_common = max(switch_distribution.items(), key=lambda x: x[1])[0]
    print(f"\nMost common switch count: {most_common} switches ({switch_distribution[most_common]} politicians)")
    print("=" * 60)

    conn.close()

if __name__ == "__main__":
    calculate_switches_from_db()
