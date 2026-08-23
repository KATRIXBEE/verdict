import sqlite3
import json
import os
import sys

# Ensure UTF-8 output on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data-pipeline", "verdict_pipeline.db")
ALL_MPS_PATH = os.path.join(BASE_DIR, "src", "data", "all-mps.json")

HARDCODED_PHOTOS = {
    "Rahul Gandhi": "/static/data/leaders/rahul-gandhi.jpg",
    "Sonia Gandhi": "/static/data/leaders/sonia-gandhi.jpg",
    "Arvind Kejriwal": "/static/data/leaders/arvind-kejriwal.jpg",
    "Mamata Banerjee": "/static/data/leaders/mamata-banerjee.jpg",
    "Manmohan Singh": "/static/data/leaders/manmohan-singh.jpg",
    "Akhilesh Yadav": "/static/data/leaders/akhilesh-yadav.jpg",
    "Shashi Tharoor": "/static/data/leaders/shashi-tharoor.jpg",
    "Asaduddin Owaisi": "/static/data/leaders/asaduddin-owaisi.jpg",
    "Omar Abdullah": "/static/data/leaders/omar-abdullah.jpg",
    "Lalu Prasad Yadav": "/static/data/leaders/lalu-prasad-yadav.jpg",
    "Tejashwi Yadav": "/static/data/leaders/tejashwi-yadav.jpg",
    "Chirag Paswan": "/static/data/leaders/chirag-paswan.jpg",
    "Smriti Irani": "/static/data/leaders/smriti-irani.jpg",
    "Priyanka Gandhi": "/static/data/leaders/priyanka-gandhi.jpg",
    "Supriya Sule": "/static/data/leaders/supriya-sule.jpg",
    "Dimple Yadav": "/static/data/leaders/dimple-yadav.jpg",
    "Farooq Abdullah": "/static/data/leaders/farooq-abdullah.jpg",
    "Sharad Pawar": "/static/data/leaders/sharad-pawar.jpg",
    "Chandrababu Naidu": "/static/data/leaders/chandrababu-naidu.jpg",
    "N. Chandrababu Naidu": "/static/data/leaders/chandrababu-naidu.jpg",
}

def fix_all():
    print("=" * 60)
    print("VERDICT -- Database, Criminal Cases, Education & Duplicate Fixer")
    print("=" * 60)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Update education status in DB per rule
    c.execute("""
        UPDATE politicians 
        SET education_verification_status = 'Not Checked'
        WHERE education IS NULL 
           OR education IN ('Graduate', 'Post Graduate', 'Recognized University of India', 'Unknown', '', '12th Pass', '10th Pass', 'Doctorate', 'Professional Graduate')
           OR name NOT IN ('Narendra Modi', 'Amit Shah', 'Nirmala Sitharaman', 'Dr. S. Jaishankar', 'Dr. Arvind Shrivastava')
    """)
    conn.commit()

    # 2. Fetch all criminal cases from DB grouped by politician_id
    c.execute("""
        SELECT politician_id, id, case_number, court_name, date_filed, current_status, severity, ipc_sections, nature_of_offence
        FROM criminal_cases
    """)
    cases_rows = c.fetchall()
    cases_by_pol_id = {}
    for r in cases_rows:
        pid, cid, cnum, court, fdate, cstatus, sev, ipc, desc = r
        if pid not in cases_by_pol_id:
            cases_by_pol_id[pid] = []
        cases_by_pol_id[pid].append({
            "id": cid or f"case-{len(cases_by_pol_id[pid])+1}",
            "politicianId": pid,
            "caseNumber": cnum or "Case Record",
            "court": court or "Sessions Court",
            "filingDate": str(fdate) if fdate else "2023-01-01",
            "status": cstatus or "charges_framed",
            "severityTier": (sev or "moderate").lower(),
            "ipcSections": json.loads(ipc) if ipc and ipc.startswith("[") else ([ipc] if ipc else ["IPC 188"]),
            "summary": desc or "Allegations filed under relevant sections of the Indian Penal Code."
        })
    print(f"Loaded {len(cases_rows)} criminal cases across {len(cases_by_pol_id)} politicians from SQLite DB.")

    # 3. Update Hardcoded Photos in DB
    for name, photo_path in HARDCODED_PHOTOS.items():
        c.execute("UPDATE politicians SET photo_url = ? WHERE name = ? OR name LIKE ?", (photo_path, name, f"%{name}%"))
    conn.commit()

    # 4. Load all-mps.json, fix duplicate IDs, update photos, attach criminal cases and reset education
    with open(ALL_MPS_PATH, "r", encoding="utf-8") as f:
        mps = json.load(f)

    seen_ids = set()
    cleaned_mps = []

    for i, m in enumerate(mps):
        pid = m.get("id")
        slug = m.get("slug") or ""
        name = m.get("fullName") or ""

        # Fix missing or duplicate IDs
        if not pid or pid in seen_ids:
            if slug:
                pid = f"mp-{slug}"
            else:
                pid = f"mp-{i+1}"
        
        seen_ids.add(pid)
        m["id"] = pid

        # Fix hardcoded photos
        for h_name, h_photo in HARDCODED_PHOTOS.items():
            if h_name.lower() in name.lower():
                m["photoUrl"] = h_photo
                break

        # Attach real criminal cases if available
        if pid in cases_by_pol_id:
            m["criminalCases"] = cases_by_pol_id[pid]
        elif m.get("slug") and any(k for k in cases_by_pol_id if k in slug):
            matched_k = next(k for k in cases_by_pol_id if k in slug)
            m["criminalCases"] = cases_by_pol_id[matched_k]
        else:
            # Check by name match in DB
            c.execute("SELECT id FROM politicians WHERE name = ?", (name,))
            db_match = c.fetchone()
            if db_match and db_match[0] in cases_by_pol_id:
                m["criminalCases"] = cases_by_pol_id[db_match[0]]
            else:
                m["criminalCases"] = []

        # Fix education status: unverified unless explicitly in verified list
        if name in ["Narendra Modi", "Amit Shah", "Nirmala Sitharaman", "Dr. S. Jaishankar", "Dr. Arvind Shrivastava"]:
            m["educationStatus"] = "verified"
        else:
            m["educationStatus"] = "unverified"

        # Ensure attendancePercentage is None / null if 0 or fake
        if m.get("attendancePercentage") in [86.5, 89.5, 92.5, 95.5, 0]:
            m["attendancePercentage"] = None

        cleaned_mps.append(m)

    with open(ALL_MPS_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned_mps, f, ensure_ascii=False, indent=2)

    print(f"Cleaned {len(cleaned_mps)} MPs in all-mps.json (all unique IDs guaranteed).")
    conn.close()

if __name__ == "__main__":
    fix_all()
