"""
VERDICT Data Integrity Guard
Validates politician records against known hallucination / placeholder patterns
before any insertion or migration to the production database.
"""

import re

SUSPICIOUS_PATTERNS = [
    re.compile(r"['\"][A-Za-z]+['\"]"),  # quoted nicknames like 'Bahubali', 'Chameleon'
    re.compile(r'\b(Col\.|Colonel|Wing Commander|Brig\.|Major Gen\.|Lt\. Gen\.)\b', re.IGNORECASE),
    re.compile(r'\(Retd\.?\)', re.IGNORECASE),
]

# Prohibited placeholder / test names
FORBIDDEN_NAMES = [
    "dr. arvind shrivastava",
    "rameshwar singh",
    "digvijay rathore",
    "jayashree venkataraman",
    "vikramjeet ranawat",
    "devendra deshmukh",
    "aditya kulkarni",
    "nitin gadve",
]

REQUIRED_FIELDS_FOR_LOK_SABHA = ['constituency', 'state']

def validate_politician_record(record: dict) -> tuple[bool, list[str]]:
    """
    Returns (is_valid, list_of_issues).
    Call this before inserting ANY politician record into
    the production database in every import or seed script.
    """
    issues = []
    name = (record.get('name') or record.get('fullName') or '').strip()

    if not name:
        issues.append("Missing politician name")
        return False, issues

    # 1. Quoted nicknames and military flavor titles
    for pattern in SUSPICIOUS_PATTERNS:
        if pattern.search(name):
            issues.append(f"Suspicious pattern or flavor title in name: '{name}'")

    # 2. Hardcoded banned mock prototype names
    norm_name = name.lower()
    for banned in FORBIDDEN_NAMES:
        if banned in norm_name:
            issues.append(f"Forbidden mock/placeholder name detected: '{name}'")

    # 3. Mandatory Lok Sabha constituency and state
    house = record.get('current_house') or record.get('house')
    if house in ('Lok Sabha', None):
        for field in REQUIRED_FIELDS_FOR_LOK_SABHA:
            val = record.get(field) or (record.get(f'current_{field}'))
            if not val:
                issues.append(f"Missing required field for Lok Sabha MP: {field}")

    # 4. Verified data source requirement
    data_source = (record.get('data_source') or '').lower()
    if data_source in ('', 'manual', 'unknown', 'ai_generated', 'test', 'seed'):
        issues.append(f"Untrusted or missing data_source: '{data_source or 'null'}'")

    return len(issues) == 0, issues
