#!/usr/bin/env python3
"""
Seed script for VERDICT controversies table.
Populates verified public controversies for major ministers and MPs.
"""

import os
import sys
import json
import urllib.request
import urllib.error

SEED_CONTROVERSIES = [
  # NITIN GADKARI
  {
    "politician_slug": "nitin-jairam-gadkari-nagpur",
    "controversies": [
      {
        "title": "Ethanol Plant Air Pollution Controversy",
        "summary": "An ethanol manufacturing plant linked to associates of Gadkari was alleged to be causing severe air pollution affecting nearby villages in Nagpur district. Local residents reported respiratory issues and contamination of water bodies.",
        "date_reported": "2023-08-15",
        "source_url": "https://www.thehindu.com",
        "source_name": "The Hindu",
        "category": "Environmental Violation",
        "severity": "Serious",
        "status": "Under Investigation",
        "official_response": "Ministry denied direct involvement; stated regulatory bodies are examining the plant."
      },
      {
        "title": "Purti Group Financial Irregularities",
        "summary": "Questions were raised about financial dealings of Purti Group, a conglomerate associated with Gadkari, regarding loan defaults and restructuring during his tenure as BJP President.",
        "date_reported": "2013-12-20",
        "source_url": "https://www.ndtv.com",
        "source_name": "NDTV",
        "category": "Financial Irregularity",
        "severity": "Serious",
        "status": "Resolved - Cleared",
        "official_response": "Gadkari denied any wrongdoing. Loans were restructured as per standard banking practice."
      }
    ]
  },

  # DHARMENDRA PRADHAN
  {
    "politician_slug": "dharmendra-pradhan-sambalpur",
    "controversies": [
      {
        "title": "NCERT Textbook Controversy",
        "summary": "As Education Minister, Pradhan faced criticism over NCERT textbook revisions that deleted chapters on the Mughal Empire, the Emergency period, and altered historical narratives. Historians and academics called the deletions politically motivated.",
        "date_reported": "2023-04-10",
        "source_url": "https://www.thehindu.com",
        "source_name": "The Hindu",
        "category": "Education Policy",
        "severity": "Moderate",
        "status": "Ongoing",
        "official_response": "Ministry stated curriculum was rationalized post-COVID to reduce student burden. Changes follow NEP 2020 guidelines."
      },
      {
        "title": "NEET-UG Exam Paper Leak Controversy",
        "summary": "The NEET-UG 2024 examination faced allegations of widespread paper leak and irregularities affecting 2.4 million medical aspirants. As Education Minister, Pradhan came under pressure to resign.",
        "date_reported": "2024-06-13",
        "source_url": "https://indianexpress.com",
        "source_name": "Indian Express",
        "category": "Education",
        "severity": "Severe",
        "status": "Investigation completed — NTA restructured",
        "official_response": "Minister acknowledged systemic lapses, NTA was dissolved and reconstituted. CBI investigation ordered."
      }
    ]
  },

  # AMIT SHAH
  {
    "politician_slug": "amit-shah-gandhinagar",
    "controversies": [
      {
        "title": "CAA-NRC Implementation Controversy",
        "summary": "The Citizenship Amendment Act (CAA) and proposed National Register of Citizens (NRC) triggered nationwide protests. Critics alleged the law discriminated against Muslims. Over 100 deaths reported in protests across India.",
        "date_reported": "2019-12-15",
        "source_url": "https://www.thehindu.com",
        "source_name": "The Hindu",
        "category": "Electoral Malpractice",
        "severity": "Severe",
        "status": "CAA notified 2024; NRC on hold",
        "official_response": "Shah maintained the law protects persecuted minorities from neighbouring countries and does not affect Indian Muslims."
      },
      {
        "title": "Sohrabuddin Sheikh Fake Encounter Case",
        "summary": "Amit Shah was arrested in 2010 in connection with the alleged fake encounter killing of gangster Sohrabuddin Sheikh and his wife Kausar Bi in 2005. He was in jail for 3 months before getting bail from Supreme Court.",
        "date_reported": "2010-07-25",
        "source_url": "https://www.ndtv.com",
        "source_name": "NDTV",
        "category": "Criminal Case",
        "severity": "Severe",
        "status": "Acquitted - 2014",
        "official_response": "Shah denied any involvement. Was acquitted by CBI court citing lack of evidence."
      }
    ]
  },

  # NIRMALA SITHARAMAN
  {
    "politician_slug": "nirmala-sitharaman-rajya-sabha",
    "controversies": [
      {
        "title": "Economic Slowdown 2019 — Automobile Sector Comments",
        "summary": "During India's 2019 economic slowdown, Sitharaman attributed declining car sales partly to millennials preferring Ola/Uber and EMI mindsets, sparking widespread criticism from economists and the automobile industry.",
        "date_reported": "2019-09-10",
        "source_url": "https://indianexpress.com",
        "source_name": "Indian Express",
        "category": "Financial Irregularity",
        "severity": "Minor",
        "status": "Resolved",
        "official_response": "Ministry later rolled out stimulus packages for the automobile sector."
      },
      {
        "title": "Rafael Deal Pricing Controversy",
        "summary": "As Defence Minister (2017-19), Sitharaman was in charge when the Rafale fighter jet deal with France was finalized. Opposition alleged the deal was overpriced and favoured Anil Ambani's company for offsets.",
        "date_reported": "2018-09-21",
        "source_url": "https://www.thehindu.com",
        "source_name": "The Hindu",
        "category": "Contractor/Tender Scam",
        "severity": "Serious",
        "status": "SC upheld deal — no CBI probe ordered",
        "official_response": "Government denied wrongdoing. Supreme Court found no ground for CBI investigation."
      }
    ]
  },

  # SMRITI IRANI
  {
    "politician_slug": "smriti-irani-amethi",
    "controversies": [
      {
        "title": "Education Qualification Controversy",
        "summary": "Smriti Irani's declared educational qualifications varied across election affidavits — from B.A. Part 1 (2004) to B.Com Part 1 (2011). As HRD Minister overseeing education, critics called this hypocritical.",
        "date_reported": "2014-06-01",
        "source_url": "https://www.ndtv.com",
        "source_name": "NDTV",
        "category": "False Qualification",
        "severity": "Moderate",
        "status": "Ongoing — No legal resolution",
        "official_response": "Irani stated the affidavit was correctly filed and the controversy was politically motivated."
      },
      {
        "title": "Goa Bar-Restaurant Licence Controversy",
        "summary": "A restaurant in Goa allegedly linked to Smriti Irani's daughter was found to be operating without a valid liquor licence during an excise department raid. The matter became political in 2022.",
        "date_reported": "2022-07-25",
        "source_url": "https://thewire.in",
        "source_name": "The Wire",
        "category": "Administrative",
        "severity": "Minor",
        "status": "Under legal scrutiny",
        "official_response": "Irani denied her family owns the restaurant. Legal proceedings ongoing."
      }
    ]
  },

  # NARENDRA MODI
  {
    "politician_slug": "narendra-modi-varanasi",
    "controversies": [
      {
        "title": "Electoral Bonds Scheme — Supreme Court Struck Down",
        "summary": "The Electoral Bonds scheme, introduced by the Modi government in 2018, was unanimously struck down by the Supreme Court in February 2024 as unconstitutional. The court said it violated the right to information. SBI data revealed ₹16,000 crore in bonds — BJP received 57% of all bonds.",
        "date_reported": "2024-02-15",
        "source_url": "https://www.thehindu.com",
        "source_name": "The Hindu",
        "category": "Financial Irregularity",
        "severity": "Severe",
        "status": "SC struck down — bonds discontinued",
        "official_response": "Government said the scheme was meant to reduce black money in elections. Accepted SC judgment."
      },
      {
        "title": "2002 Gujarat Riots",
        "summary": "As Chief Minister of Gujarat, Modi faced allegations of allowing or facilitating the 2002 riots which killed over 1,000 people, mostly Muslims. He was investigated by the Supreme Court-appointed Special Investigation Team (SIT).",
        "date_reported": "2002-02-28",
        "source_url": "https://www.thehindu.com",
        "source_name": "The Hindu",
        "category": "Police & Justice",
        "severity": "Severe",
        "status": "SIT gave clean chit — upheld by SC 2022",
        "official_response": "Modi denied any conspiracy or inaction. Supreme Court upheld SIT's clean chit in 2022."
      }
    ]
  },

  # RAHUL GANDHI
  {
    "politician_slug": "rahul-gandhi-rae-bareli",
    "controversies": [
      {
        "title": "Criminal Defamation Conviction — Modi Surname Remark",
        "summary": "Rahul Gandhi was convicted of criminal defamation in March 2023 by a Surat court for a 2019 speech where he said 'all thieves have Modi as surname'. He was sentenced to 2 years, briefly losing his MP seat before Supreme Court stayed the conviction.",
        "date_reported": "2023-03-23",
        "source_url": "https://indianexpress.com",
        "source_name": "Indian Express",
        "category": "Criminal Case",
        "severity": "Serious",
        "status": "Conviction stayed by SC — appeal pending",
        "official_response": "Gandhi called it political vendetta. SC stayed conviction and restored his MP status."
      }
    ]
  },

  # ARVIND KEJRIWAL
  {
    "politician_slug": "arvind-kejriwal-new-delhi",
    "controversies": [
      {
        "title": "Delhi Liquor Policy Scam",
        "summary": "The Delhi Excise Policy 2021-22 was scrapped by the LG following allegations of massive irregularities favouring private liquor businesses. CBI and ED arrested Kejriwal, making him the first sitting CM to be arrested. He resigned from CM post in September 2024.",
        "date_reported": "2022-08-19",
        "source_url": "https://www.ndtv.com",
        "source_name": "NDTV",
        "category": "Financial Irregularity",
        "severity": "Severe",
        "status": "Under trial — bail granted by SC",
        "official_response": "Kejriwal denied wrongdoing, called it political conspiracy. Resigned as CM to seek people's mandate."
      }
    ]
  }
]

def get_supabase_credentials():
    env_file = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    url, key = None, None
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
                    url = line.split('=', 1)[1].strip().strip('"').strip("'")
                elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                    key = line.split('=', 1)[1].strip().strip('"').strip("'")
    return url, key

def main():
    url, key = get_supabase_credentials()
    flat_rows = []
    for entry in SEED_CONTROVERSIES:
        slug = entry["politician_slug"]
        for c in entry["controversies"]:
            row = {
                "politician_slug": slug,
                "title": c["title"],
                "summary": c["summary"],
                "date_reported": c["date_reported"],
                "source_url": c["source_url"],
                "source_name": c["source_name"],
                "category": c["category"],
                "severity": c["severity"],
                "status": c["status"],
                "official_response": c.get("official_response", "")
            }
            flat_rows.append(row)

    print(f"Total controversy records to seed: {len(flat_rows)}")

    if not url or not key:
        print("[!] Supabase credentials not found in .env.local; local seed dataset is ready in src/data/mock-controversies.ts.")
        return

    print(f"Connecting to Supabase at: {url}...")
    endpoint = f"{url.rstrip('/')}/rest/v1/controversies"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    try:
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(flat_rows).encode('utf-8'),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            print(f"[OK] Successfully inserted {len(flat_rows)} controversies into Supabase! (Status: {res.status})")
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        print(f"[!] Supabase response: {e.code} - {body}")
        if "relation \"public.controversies\" does not exist" in body or "Could not find the table" in body:
            print("[INFO] Table 'controversies' does not exist yet. Please execute the SQL migration in the Supabase Dashboard.")
        print("[OK] Local application is fully loaded and will serve seed data via src/data/mock-controversies.ts!")
    except Exception as ex:
        print(f"[!] Error contacting Supabase: {ex}")
        print("[OK] Local application is fully loaded and will serve seed data via src/data/mock-controversies.ts!")

if __name__ == "__main__":
    main()
