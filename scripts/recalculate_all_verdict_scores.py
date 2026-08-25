import os
import sys
import json
import sqlite3

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data-pipeline", "verdict_pipeline.db")
ALL_MPS_JSON = os.path.join(BASE_DIR, "src", "data", "all-mps.json")

def get_score_band(score: float) -> str:
    if score >= 8.0:
        return "EXCELLENT"
    if score >= 6.0:
        return "GOOD"
    if score >= 4.0:
        return "AVERAGE"
    if score >= 2.0:
        return "POOR"
    return "VERY POOR"

def calculate_verdict_score(
    criminal_case_count,
    worst_case_severity,
    attendance_percent,
    education_status,
    asset_growth_percent,
    party_switch_count,
    mplads_utilisation_percent
) -> float:
    base = 5.0

    # 1. Criminal cases
    crime_impact = 0.0
    if criminal_case_count is None:
        crime_impact = 0.0
    elif criminal_case_count == 0:
        crime_impact = 1.0
    else:
        sev = (worst_case_severity or "Moderate").lower()
        if "severe" in sev:
            crime_impact = -4.0
        elif "serious" in sev:
            crime_impact = -2.5
        elif "moderate" in sev:
            crime_impact = -1.5
        elif "minor" in sev:
            crime_impact = -0.5 if criminal_case_count <= 2 else -1.5
        else:
            crime_impact = -1.5

    # 2. Attendance
    att_score = 0.0
    if attendance_percent is not None:
        if attendance_percent >= 80.0:
            att_score = 2.0
        elif attendance_percent >= 60.0:
            att_score = 1.0
        elif attendance_percent >= 40.0:
            att_score = 0.0
        else:
            att_score = -1.0

    # 3. Education
    edu = (education_status or "").lower()
    edu_score = 0.0
    if edu == "verified":
        edu_score = 0.5
    elif edu == "suspicious":
        edu_score = -0.5

    # 4. Asset growth
    asset_score = 0.0
    if asset_growth_percent is not None:
        if asset_growth_percent < 200.0:
            asset_score = 1.0
        elif asset_growth_percent <= 400.0:
            asset_score = 0.0
        else:
            asset_score = -2.0

    # 5. Party switches
    switch_score = 0.0
    if party_switch_count is not None:
        if party_switch_count == 0:
            switch_score = 0.5
        elif party_switch_count == 1:
            switch_score = 0.0
        else:
            switch_score = -0.5

    # 6. MPLADS utilisation
    mplads_score = 0.0
    if mplads_utilisation_percent is not None:
        if mplads_utilisation_percent > 80.0:
            mplads_score = 0.5
        elif mplads_utilisation_percent < 30.0:
            mplads_score = -0.5

    raw = base + crime_impact + att_score + edu_score + asset_score + switch_score + mplads_score
    clamped = max(0.0, min(10.0, raw))
    return round(clamped, 1)

def run_score_recalculation():
    print("=" * 60)
    print("FINAL SCORE RECALCULATION FOR ALL 563 POLITICIANS")
    print("=" * 60)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
        SELECT 
            id, name, slug, photo_url, current_party, current_constituency, 
            current_state, current_house, education, education_verification_status,
            attendance_percent, questions_asked, debates_count,
            criminal_case_count, worst_case_severity,
            party_switch_count, asset_growth_percent,
            mplads_allocated, mplads_utilised, mplads_utilisation_percent
        FROM politicians
    """)
    rows = c.fetchall()

    db_map = {}
    for r in rows:
        (
            pol_id, name, slug, photo_url, party, constituency, 
            state, house, education, edu_status,
            att_pct, q_cnt, deb_cnt,
            crime_cnt, worst_sev,
            switch_cnt, asset_growth,
            mplads_alloc, mplads_util, mplads_util_pct
        ) = r

        score = calculate_verdict_score(
            crime_cnt, worst_sev, att_pct, edu_status,
            asset_growth, switch_cnt, mplads_util_pct
        )

        c.execute("UPDATE politicians SET verdict_score = ? WHERE id = ?", (score, pol_id))

        db_map[pol_id] = {
            "id": pol_id,
            "name": name,
            "slug": slug,
            "party": party,
            "constituency": constituency,
            "state": state,
            "house": house,
            "education": education,
            "educationStatus": edu_status or "Not Checked",
            "attendancePercentage": att_pct,
            "questionsAsked": q_cnt,
            "debatesParticipated": deb_cnt,
            "criminalCaseCount": crime_cnt,
            "worstCaseSeverity": worst_sev,
            "partySwitchCount": switch_cnt,
            "assetGrowthPercent": asset_growth,
            "mpladsAllocated": mplads_alloc,
            "mpladsUtilised": mplads_util,
            "mpladsUtilisationPercent": mplads_util_pct,
            "calculatedVerdictScore": score,
            "scoreBand": get_score_band(score)
        }

    conn.commit()

    # Step 7: Update src/data/all-mps.json
    if os.path.exists(ALL_MPS_JSON):
        with open(ALL_MPS_JSON, 'r', encoding='utf-8') as f:
            mps_json = json.load(f)

        updated_mps = []
        for mp in mps_json:
            mp_id = mp.get("id")
            db_data = db_map.get(mp_id)
            if db_data:
                mp["attendancePercentage"] = db_data["attendancePercentage"]
                mp["questionsAsked"] = db_data["questionsAsked"]
                mp["debatesParticipated"] = db_data["debatesParticipated"]
                mp["criminalCaseCount"] = db_data["criminalCaseCount"]
                mp["worstCaseSeverity"] = db_data["worstCaseSeverity"]
                mp["partySwitchCount"] = db_data["partySwitchCount"]
                mp["assetGrowthPercent"] = db_data["assetGrowthPercent"]
                mp["mpladsAllocated"] = db_data["mpladsAllocated"]
                mp["mpladsUtilised"] = db_data["mpladsUtilised"]
                mp["mpladsUtilisationPercent"] = db_data["mpladsUtilisationPercent"]
                mp["calculatedVerdictScore"] = db_data["calculatedVerdictScore"]
                mp["scoreBand"] = db_data["scoreBand"]

                # If criminal_case_count is 0, set empty list so criminal dossier shows clean
                if db_data["criminalCaseCount"] == 0:
                    mp["criminalCases"] = []
            updated_mps.append(mp)

        with open(ALL_MPS_JSON, 'w', encoding='utf-8') as f:
            json.dump(updated_mps, f, ensure_ascii=False, indent=2)
        print(f"Synchronized all {len(updated_mps)} MPs into src/data/all-mps.json.")

    # Verification query
    print("\n" + "=" * 60)
    print("FINAL VERDICT SCORE DISTRIBUTION QUERY:")
    print("=" * 60)
    c.execute("""
        SELECT 
          CAST(FLOOR(verdict_score) AS INTEGER) as score_floor,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM politicians), 1) as percent
        FROM politicians
        GROUP BY FLOOR(verdict_score)
        ORDER BY score_floor
    """)
    dist_rows = c.fetchall()
    for floor_val, cnt, pct in dist_rows:
        band_name = f"Score {floor_val}.0 – {floor_val}.9"
        bar = "#" * int(pct // 2)
        print(f"  {band_name:<18} | Count: {cnt:>3} ({pct:>5.1f}%) | {bar}")

    print("-" * 60)
    c.execute("SELECT AVG(verdict_score), MIN(verdict_score), MAX(verdict_score) FROM politicians")
    avg_s, min_s, max_s = c.fetchone()
    print(f"Total Evaluated: {len(rows)}")
    print(f"Average Score:   {avg_s:.2f} / 10.0")
    print(f"Score Range:     {min_s:.1f} to {max_s:.1f}")
    print("=" * 60)

    conn.close()

if __name__ == "__main__":
    run_score_recalculation()
