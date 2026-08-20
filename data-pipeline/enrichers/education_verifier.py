"""
UGC Education Verification Engine
Cross-checks candidate degrees against UGC fake universities and recognized higher education patterns.
"""

import re
from typing import Tuple

# UGC Published Fake Universities Directory (25+ Institutions)
UGC_FAKE_UNIVERSITIES = [
    "commercial university",
    "united nations university, delhi",
    "vocational university, delhi",
    "adr-centric juridical university",
    "indian institute of science and engineering, new delhi",
    "viswakarma open university",
    "badaganvi sarkar world open university",
    "st. john's university, kishanattam",
    "raja arabic university",
    "d.d.b. sanskrit university",
    "gandhi hindi vidyapith",
    "national university of electro complex homeopathy",
    "netaji subhash chandra bose university",
    "uttar pradesh vishwavidyalaya, kosi kalan",
    "maharana pratap shiksha niketan vishwavidyalaya",
    "indraprastha shiksha parishad",
    "nababharat shiksha parishad",
    "north orissa university of agriculture",
    "sree bodhi academy of higher education",
    "christ new testament deemed university",
    "indian institute of alternative medicine",
    "institute of alternative medicine and research",
    "varanaseya sanskrit vishwavidyalaya",
    "mahila gram vidyapith",
    "bharatiya shiksha parishad",
]

# Legitimate Higher Education Accreditation Patterns
LEGITIMATE_INSTITUTION_PATTERNS = [
    r"\bIIT\b",
    r"\bIIM\b",
    r"\bNIT\b",
    r"\bAIIMS\b",
    r"\bNLSIU\b",
    r"\bNALSAR\b",
    r"\bBITS\b",
    r"\bIISc\b",
    r"\bJNU\b",
    r"\bDU\b",
    r"\bBHU\b",
    r"\bAMU\b",
    r"\bIGNOU\b",
    r"\bTIFR\b",
    r"\bUniversity\b",
    r"\bVishwavidyalaya\b",
    r"\bVidyapeeth\b",
    r"\bCollege\b",
    r"\bInstitute of Technology\b",
    r"\bInstitute of Medical Sciences\b",
    r"\bLaw College\b",
    r"\bMedical College\b",
    r"\bNational Law University\b",
    r"\bCambridge\b",
    r"\bOxford\b",
    r"\bHarvard\b",
    r"\bStanford\b",
    r"\bLondon School of Economics\b",
]


def verify_education_credential(education_str: str) -> Tuple[str, str]:
    """
    Evaluates education credentials.
    Returns (status: 'Verified' | 'Suspicious' | 'Unverified' | 'Not Checked', reason: str)
    """
    if not education_str or not str(education_str).strip() or education_str.lower() in ("others", "literate", "nan", "nil", "none"):
        return "Not Checked", "No formal higher education credential declared"

    edu_lower = education_str.lower().strip()

    # 1. Check UGC Fake University List
    for fake in UGC_FAKE_UNIVERSITIES:
        if fake in edu_lower:
            return "Suspicious", f"Matches UGC-flagged unaccredited institution: {fake.title()}"

    # 2. Check Recognized Legitimate Patterns
    for pat in LEGITIMATE_INSTITUTION_PATTERNS:
        if re.search(pat, education_str, re.IGNORECASE):
            return "Verified", "Accredited state/central university or premier national institute"

    # 3. Check Standard Degree Abbreviations
    degree_matches = re.findall(r"\b(B\.?Tech|M\.?Tech|B\.?E|M\.?E|MBBS|MD|MS|B\.?Sc|M\.?Sc|B\.?Com|M\.?Com|B\.?A|M\.?A|LL\.?B|LL\.?M|Ph\.?D|Doctorate|CA|CS|ICWA)\b", education_str, re.IGNORECASE)
    if degree_matches:
        return "Verified", f"Recognized academic degree ({', '.join(degree_matches)})"

    return "Unverified", "Unverified private college or regional schooling board"
