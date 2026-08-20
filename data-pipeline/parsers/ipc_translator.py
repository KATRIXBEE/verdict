"""
IPC Section Translator
Normalizes and translates statutory penal sections into plain English, severity tier, and category.
"""

import re
from typing import Dict, Any

# Local In-Memory Cache of IPC & Special Act Sections
IPC_DICTIONARY: Dict[str, Dict[str, str]] = {
    "302": {"plain_english": "Murder", "severity": "Severe", "category": "Violent Crime"},
    "307": {"plain_english": "Attempt to murder", "severity": "Severe", "category": "Violent Crime"},
    "376": {"plain_english": "Rape", "severity": "Severe", "category": "Sexual Offences"},
    "406": {"plain_english": "Criminal breach of trust", "severity": "Serious", "category": "Financial Crime"},
    "420": {"plain_english": "Cheating and fraudulent property transfer", "severity": "Serious", "category": "Financial Crime"},
    "147": {"plain_english": "Rioting", "severity": "Moderate", "category": "Public Order"},
    "148": {"plain_english": "Rioting armed with deadly weapon", "severity": "Serious", "category": "Public Order"},
    "149": {"plain_english": "Unlawful assembly", "severity": "Moderate", "category": "Public Order"},
    "188": {"plain_english": "Disobedience to public servant order", "severity": "Minor", "category": "Public Order"},
    "120B": {"plain_english": "Criminal conspiracy", "severity": "Serious", "category": "Conspiracy"},
    "201": {"plain_english": "Causing disappearance of evidence", "severity": "Serious", "category": "Obstruction of Justice"},
    "323": {"plain_english": "Voluntarily causing hurt", "severity": "Minor", "category": "Violent Crime"},
    "324": {"plain_english": "Causing hurt by dangerous weapons", "severity": "Moderate", "category": "Violent Crime"},
    "325": {"plain_english": "Voluntarily causing grievous hurt", "severity": "Serious", "category": "Violent Crime"},
    "341": {"plain_english": "Wrongful restraint", "severity": "Minor", "category": "Public Order"},
    "342": {"plain_english": "Wrongful confinement", "severity": "Moderate", "category": "Personal Liberty"},
    "353": {"plain_english": "Assault or criminal force to deter public servant", "severity": "Serious", "category": "Public Order"},
    "384": {"plain_english": "Extortion", "severity": "Serious", "category": "Violent Crime"},
    "386": {"plain_english": "Extortion by putting person in fear of death", "severity": "Serious", "category": "Violent Crime"},
    "409": {"plain_english": "Criminal breach of trust by public servant", "severity": "Severe", "category": "Corruption"},
    "411": {"plain_english": "Dishonestly receiving stolen property", "severity": "Moderate", "category": "Property Offence"},
    "465": {"plain_english": "Forgery", "severity": "Serious", "category": "Fraud"},
    "468": {"plain_english": "Forgery for purpose of cheating", "severity": "Serious", "category": "Fraud"},
    "471": {"plain_english": "Using forged document as genuine", "severity": "Serious", "category": "Fraud"},
    "498A": {"plain_english": "Cruelty by husband or relatives", "severity": "Serious", "category": "Domestic Violence"},
    "504": {"plain_english": "Intentional insult to provoke breach of peace", "severity": "Minor", "category": "Public Order"},
    "506": {"plain_english": "Criminal intimidation", "severity": "Moderate", "category": "Threat & Intimidation"},
    "POCSO": {"plain_english": "Protection of Children from Sexual Offences", "severity": "Severe", "category": "Child Protection"},
    "PC ACT 7": {"plain_english": "Offence relating to bribery", "severity": "Severe", "category": "Corruption"},
    "PC ACT 13": {"plain_english": "Criminal misconduct by public servant", "severity": "Severe", "category": "Corruption"},
    "UAPA": {"plain_english": "Unlawful Activities (Prevention) Act", "severity": "Severe", "category": "National Security"},
    "NDPS": {"plain_english": "Narcotic Drugs and Psychotropic Substances Act", "severity": "Severe", "category": "Narcotics"},
}


def normalize_section_code(raw_section: str) -> str:
    """
    Normalizes a messy legal code string e.g. "Section 420 of IPC", "Sec. 302", "IPC 120-B", "POCSO Act".
    """
    cleaned = raw_section.strip().upper()
    cleaned = re.sub(r"\b(SECTION|SEC|IPC|INDIAN PENAL CODE|OF|THE|ACT|U/S|U/SEC)\b", "", cleaned)
    cleaned = re.sub(r"[\.,\(\)]", "", cleaned).strip()

    # Special act matches
    if "POCSO" in raw_section.upper():
        return "POCSO"
    if "PC ACT" in raw_section.upper() or "PREVENTION OF CORRUPTION" in raw_section.upper():
        if "13" in raw_section:
            return "PC ACT 13"
        if "7" in raw_section:
            return "PC ACT 7"
    if "NDPS" in raw_section.upper():
        return "NDPS"
    if "UAPA" in raw_section.upper():
        return "UAPA"

    # Match numeric and suffix patterns (e.g. 120B, 498A)
    match = re.search(r"\b(\d+[A-Z]?)\b", cleaned)
    if match:
        return match.group(1)
    
    return cleaned.strip()


def translate_ipc_section(section_string: str) -> Dict[str, Any]:
    """
    Translates an IPC or statutory penal section string into structured metadata.
    Never returns None.
    """
    if not section_string or not str(section_string).strip():
        return {
            "section": "Unknown",
            "plain_english": "Legal provision — consult official court records for details",
            "severity": "Unknown",
            "category": "Other",
        }

    norm_code = normalize_section_code(str(section_string))

    if norm_code in IPC_DICTIONARY:
        info = IPC_DICTIONARY[norm_code]
        return {
            "section": norm_code,
            "plain_english": info["plain_english"],
            "severity": info["severity"],
            "category": info["category"],
        }

    # Generic fallback
    return {
        "section": str(section_string).strip(),
        "plain_english": f"Legal provision (Section {norm_code}) — consult legal counsel",
        "severity": "Moderate",
        "category": "General Legal Code",
    }
