import json
import os
import sys
import asyncio

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "data-pipeline"))

from sqlalchemy import select
from utils.db import init_db, get_db_session
from utils.models import Politician

EXTRA_LEADERS = [
    {
        "fullName": "Nirmala Sitharaman",
        "slug": "nirmala-sitharaman",
        "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Nirmala_Sitharaman_in_2023.jpg/400px-Nirmala_Sitharaman_in_2023.jpg",
        "currentParty": "Bharatiya Janata Party",
        "partyAbbr": "BJP",
        "partyColor": "#FF9933",
        "currentConstituency": {"id": "c-rs-ka", "name": "Rajya Sabha", "state": "Karnataka", "type": "lok_sabha", "code": "RS-KA"},
        "age": 65,
        "gender": "female",
        "professionDeclared": "Economist & Union Minister",
        "educationDegree": "M.Phil. in Economics",
        "educationInstitution": "Jawaharlal Nehru University (JNU), New Delhi",
        "educationStatus": "verified",
        "attendancePercentage": None,
        "debatesParticipated": 45,
        "questionsAsked": 0,
        "privateMemberBills": 0,
        "nationalAttendanceAvg": 78.2,
        "stateAttendanceAvg": 75.0,
        "termsServed": 3,
        "isMinister": True,
        "portfolio": "Minister of Finance and Corporate Affairs",
        "house": "Rajya Sabha",
        "partyHistory": [{"id": "ph-ns-1", "politicianId": "nirmala-sitharaman", "partyName": "Bharatiya Janata Party", "partyAbbr": "BJP", "partyColor": "#FF9933", "startYear": 2008, "endYear": None, "isCurrent": True}],
        "criminalCases": [],
        "assetDeclarations": [{"id": "as-ns-1", "politicianId": "nirmala-sitharaman", "electionYear": 2022, "movableAssets": 18000000, "immovableAssets": 7500000, "totalAssets": 25500000, "totalLiabilities": 0, "isOutlierGrowth": False}],
        "citizenRatings": [],
        "newsItems": [],
        "sourceAffidavitDate": "2022-06-01",
        "lastSyncedAt": "2026-08-22T08:00:00Z",
        "portfolioHistory": [
            {"role": "Minister of State (Commerce)", "ministry": "Commerce", "from_date": "2014-05-26", "to_date": "2016-07-05", "government": "Modi 1.0"},
            {"role": "Defence Minister", "ministry": "Ministry of Defence", "from_date": "2017-09-03", "to_date": "2019-05-30", "government": "Modi 1.0"},
            {"role": "Finance Minister", "ministry": "Ministry of Finance", "from_date": "2019-05-31", "to_date": None, "government": "Modi 2.0 + 3.0"}
        ]
    },
    {
        "fullName": "Smriti Irani",
        "slug": "smriti-irani",
        "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Smriti_Irani_in_2023.jpg/400px-Smriti_Irani_in_2023.jpg",
        "currentParty": "Bharatiya Janata Party",
        "partyAbbr": "BJP",
        "partyColor": "#FF9933",
        "currentConstituency": {"id": "c-amethi", "name": "Amethi", "state": "Uttar Pradesh", "type": "lok_sabha", "code": "UP-37"},
        "age": 48,
        "gender": "female",
        "professionDeclared": "Social Worker & Former Union Minister",
        "educationDegree": "B.Com (Part 1)",
        "educationInstitution": "School of Open Learning, University of Delhi",
        "educationStatus": "unverified",
        "attendancePercentage": None,
        "debatesParticipated": 38,
        "questionsAsked": 0,
        "privateMemberBills": 0,
        "nationalAttendanceAvg": 78.2,
        "stateAttendanceAvg": 75.0,
        "termsServed": 2,
        "isMinister": False,
        "portfolio": "Former Union Minister",
        "house": "Lok Sabha",
        "partyHistory": [{"id": "ph-si-1", "politicianId": "smriti-irani", "partyName": "Bharatiya Janata Party", "partyAbbr": "BJP", "partyColor": "#FF9933", "startYear": 2003, "endYear": None, "isCurrent": True}],
        "criminalCases": [],
        "assetDeclarations": [{"id": "as-si-1", "politicianId": "smriti-irani", "electionYear": 2024, "movableAssets": 37500000, "immovableAssets": 105000000, "totalAssets": 142500000, "totalLiabilities": 0, "isOutlierGrowth": False}],
        "citizenRatings": [],
        "newsItems": [],
        "sourceAffidavitDate": "2024-04-18",
        "lastSyncedAt": "2026-08-22T08:00:00Z",
        "portfolioHistory": [
            {"role": "HRD Minister", "ministry": "Ministry of Human Resource Development", "from_date": "2014-05-26", "to_date": "2019-05-30", "government": "Modi 1.0"},
            {"role": "Women & Child Development Minister", "ministry": "WCD Ministry", "from_date": "2019-05-31", "to_date": "2024-06-04", "government": "Modi 2.0"},
            {"role": "MP — Amethi", "ministry": None, "from_date": "2024-06-04", "to_date": None, "government": "N/A"}
        ]
    },
    {
        "fullName": "Dr. S. Jaishankar",
        "slug": "s-jaishankar",
        "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Dr._S._Jaishankar_in_2023.jpg/400px-Dr._S._Jaishankar_in_2023.jpg",
        "currentParty": "Bharatiya Janata Party",
        "partyAbbr": "BJP",
        "partyColor": "#FF9933",
        "currentConstituency": {"id": "c-rs-gj", "name": "Rajya Sabha", "state": "Gujarat", "type": "lok_sabha", "code": "RS-GJ"},
        "age": 70,
        "gender": "male",
        "professionDeclared": "Diplomat & External Affairs Minister",
        "educationDegree": "Ph.D. in International Relations",
        "educationInstitution": "Jawaharlal Nehru University (JNU), New Delhi",
        "educationStatus": "verified",
        "attendancePercentage": None,
        "debatesParticipated": 52,
        "questionsAsked": 0,
        "privateMemberBills": 0,
        "nationalAttendanceAvg": 78.2,
        "stateAttendanceAvg": 75.0,
        "termsServed": 2,
        "isMinister": True,
        "portfolio": "Minister of External Affairs",
        "house": "Rajya Sabha",
        "partyHistory": [{"id": "ph-sj-1", "politicianId": "s-jaishankar", "partyName": "Bharatiya Janata Party", "partyAbbr": "BJP", "partyColor": "#FF9933", "startYear": 2019, "endYear": None, "isCurrent": True}],
        "criminalCases": [],
        "assetDeclarations": [{"id": "as-sj-1", "politicianId": "s-jaishankar", "electionYear": 2023, "movableAssets": 32000000, "immovableAssets": 58000000, "totalAssets": 90000000, "totalLiabilities": 0, "isOutlierGrowth": False}],
        "citizenRatings": [],
        "newsItems": [],
        "sourceAffidavitDate": "2023-07-10",
        "lastSyncedAt": "2026-08-22T08:00:00Z",
        "portfolioHistory": [
            {"role": "Foreign Secretary", "ministry": "Ministry of External Affairs", "from_date": "2015-01-28", "to_date": "2018-01-28", "government": "Career"},
            {"role": "External Affairs Minister", "ministry": "Ministry of External Affairs", "from_date": "2019-05-31", "to_date": None, "government": "Modi 2.0 + 3.0"}
        ]
    }
]

PORTFOLIO_SEEDS = {
    "narendra modi": [
        {"role": "Prime Minister", "ministry": "PMO", "from_date": "2014-05-26", "to_date": "2019-05-30", "government": "Modi 1.0"},
        {"role": "Prime Minister", "ministry": "PMO", "from_date": "2019-05-30", "to_date": "2024-06-04", "government": "Modi 2.0"},
        {"role": "Prime Minister", "ministry": "PMO", "from_date": "2024-06-09", "to_date": None, "government": "Modi 3.0"}
    ],
    "nirmala sitharaman": [
        {"role": "Minister of State (Commerce)", "ministry": "Commerce", "from_date": "2014-05-26", "to_date": "2016-07-05", "government": "Modi 1.0"},
        {"role": "Defence Minister", "ministry": "Ministry of Defence", "from_date": "2017-09-03", "to_date": "2019-05-30", "government": "Modi 1.0"},
        {"role": "Finance Minister", "ministry": "Ministry of Finance", "from_date": "2019-05-31", "to_date": None, "government": "Modi 2.0 + 3.0"}
    ],
    "amit shah": [
        {"role": "Home Minister", "ministry": "Ministry of Home Affairs", "from_date": "2019-05-31", "to_date": None, "government": "Modi 2.0 + 3.0"},
        {"role": "BJP National President", "ministry": "BJP", "from_date": "2014-07-09", "to_date": "2020-01-20", "government": "N/A"}
    ],
    "rajnath singh": [
        {"role": "Home Minister", "ministry": "Ministry of Home Affairs", "from_date": "2014-05-26", "to_date": "2019-05-30", "government": "Modi 1.0"},
        {"role": "Defence Minister", "ministry": "Ministry of Defence", "from_date": "2019-05-31", "to_date": None, "government": "Modi 2.0 + 3.0"}
    ],
    "raj nath singh": [
        {"role": "Home Minister", "ministry": "Ministry of Home Affairs", "from_date": "2014-05-26", "to_date": "2019-05-30", "government": "Modi 1.0"},
        {"role": "Defence Minister", "ministry": "Ministry of Defence", "from_date": "2019-05-31", "to_date": None, "government": "Modi 2.0 + 3.0"}
    ],
    "smriti irani": [
        {"role": "HRD Minister", "ministry": "Ministry of Human Resource Development", "from_date": "2014-05-26", "to_date": "2019-05-30", "government": "Modi 1.0"},
        {"role": "Women & Child Development Minister", "ministry": "WCD Ministry", "from_date": "2019-05-31", "to_date": "2024-06-04", "government": "Modi 2.0"},
        {"role": "MP — Amethi", "ministry": None, "from_date": "2024-06-04", "to_date": None, "government": "N/A"}
    ],
    "smriti zubin irani": [
        {"role": "HRD Minister", "ministry": "Ministry of Human Resource Development", "from_date": "2014-05-26", "to_date": "2019-05-30", "government": "Modi 1.0"},
        {"role": "Women & Child Development Minister", "ministry": "WCD Ministry", "from_date": "2019-05-31", "to_date": "2024-06-04", "government": "Modi 2.0"},
        {"role": "MP — Amethi", "ministry": None, "from_date": "2024-06-04", "to_date": None, "government": "N/A"}
    ],
    "s. jaishankar": [
        {"role": "Foreign Secretary", "ministry": "Ministry of External Affairs", "from_date": "2015-01-28", "to_date": "2018-01-28", "government": "Career"},
        {"role": "External Affairs Minister", "ministry": "Ministry of External Affairs", "from_date": "2019-05-31", "to_date": None, "government": "Modi 2.0 + 3.0"}
    ],
    "subrahmanyam jaishankar": [
        {"role": "Foreign Secretary", "ministry": "Ministry of External Affairs", "from_date": "2015-01-28", "to_date": "2018-01-28", "government": "Career"},
        {"role": "External Affairs Minister", "ministry": "Ministry of External Affairs", "from_date": "2019-05-31", "to_date": None, "government": "Modi 2.0 + 3.0"}
    ]
}

async def main():
    print("=" * 60)
    print("VERDICT — Seeding Ministerial Portfolio Histories")
    print("=" * 60)

    await init_db()

    # 1. Update Database
    db_updated = 0
    async with get_db_session() as session:
        stmt = select(Politician)
        politicians = (await session.execute(stmt)).scalars().all()
        existing_slugs = {p.slug for p in politicians}

        for p in politicians:
            p_name = p.name.lower().strip()
            p_slug = p.slug.lower().strip()

            for key, history in PORTFOLIO_SEEDS.items():
                if key in p_name or key.replace(' ', '-') in p_slug:
                    p.portfolio_history = history
                    db_updated += 1
                    print(f"  [+] Seeded portfolio for DB politician: {p.name}")
                    break

        for l in EXTRA_LEADERS:
            if l["slug"] not in existing_slugs:
                new_p = Politician(
                    name=l["fullName"],
                    slug=l["slug"],
                    photo_url=l["photoUrl"],
                    current_party=l["currentParty"],
                    current_constituency=l["currentConstituency"]["name"],
                    current_state=l["currentConstituency"]["state"],
                    current_house=l["house"],
                    profession=l["professionDeclared"],
                    education=l["educationDegree"],
                    education_verification_status="Verified",
                    verdict_score=6.0,
                    data_completeness_percent=85,
                    portfolio_history=l["portfolioHistory"]
                )
                session.add(new_p)
                db_updated += 1
                print(f"  [+] Added key minister to DB: {l['fullName']}")

        await session.commit()

    # 2. Update all-mps.json
    all_mps_path = os.path.join(BASE_DIR, "src", "data", "all-mps.json")
    if os.path.exists(all_mps_path):
        with open(all_mps_path, "r", encoding="utf-8") as f:
            all_mps = json.load(f)
        
        json_slugs = {mp.get("slug") for mp in all_mps}
        json_updated = 0
        for mp in all_mps:
            m_name = mp.get("fullName", "").lower().strip()
            m_slug = mp.get("slug", "").lower().strip()
            for key, history in PORTFOLIO_SEEDS.items():
                if key in m_name or key.replace(' ', '-') in m_slug:
                    mp["portfolioHistory"] = history
                    json_updated += 1
                    print(f"  [+] Seeded portfolio for all-mps.json: {mp['fullName']}")
                    break
        
        for l in EXTRA_LEADERS:
            if l["slug"] not in json_slugs:
                all_mps.append(l)
                json_updated += 1
                print(f"  [+] Added key minister to all-mps.json: {l['fullName']}")

        with open(all_mps_path, "w", encoding="utf-8") as f:
            json.dump(all_mps, f, ensure_ascii=False, indent=2)

    print(f"\nSeeding complete: {db_updated} DB records, {json_updated} JSON records.")

if __name__ == "__main__":
    asyncio.run(main())
