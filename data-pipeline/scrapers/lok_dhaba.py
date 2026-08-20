"""
Lok Dhaba (TCPD / Ashoka University) Dataset Parser
Parses historical Indian election dataset CSVs into structured records.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
from utils.logger import log_event


class LokDhabaParser:
    """
    Parses Lok Dhaba election result CSV dumps.
    """

    def __init__(self, csv_file_path: str):
        self.csv_path = Path(csv_file_path)

    def parse(self) -> List[Dict[str, Any]]:
        """
        Parses the CSV file and returns standardized election records.
        """
        if not self.csv_path.exists():
            log_event("lok_dhaba", f"CSV file not found at {self.csv_path}", level="ERROR")
            return []

        log_event("lok_dhaba", f"Loading Lok Dhaba CSV from {self.csv_path}", level="INFO")
        
        # Read CSV with pandas
        try:
            df = pd.read_csv(self.csv_path, low_memory=False)
        except Exception as e:
            log_event("lok_dhaba", f"Failed to read CSV: {e}", level="ERROR", error=str(e))
            return []

        records: List[Dict[str, Any]] = []

        # Standardize column names
        cols = {c.lower().strip().replace(" ", "_"): c for c in df.columns}

        # Identify key columns
        cand_col = cols.get("candidate") or cols.get("candidate_name") or cols.get("name")
        party_col = cols.get("party") or cols.get("party_name") or cols.get("party_abbr")
        const_col = cols.get("constituency_name") or cols.get("constituency")
        state_col = cols.get("state_name") or cols.get("state")
        year_col = cols.get("year") or cols.get("election_year")
        votes_col = cols.get("votes") or cols.get("valid_votes")
        pos_col = cols.get("position") or cols.get("rank")
        margin_col = cols.get("margin")
        gender_col = cols.get("gender") or cols.get("sex")
        age_col = cols.get("age")
        edu_col = cols.get("my_neta_education") or cols.get("education")
        assets_col = cols.get("assets") or cols.get("total_assets")
        crime_col = cols.get("criminal_cases") or cols.get("crime_count")

        for idx, row in df.iterrows():
            name = str(row[cand_col]).strip() if cand_col and pd.notna(row[cand_col]) else None
            if not name or name.upper() in ("NOTA", "NONE OF THE ABOVE", "NAN", ""):
                continue

            constituency = str(row[const_col]).strip() if const_col and pd.notna(row[const_col]) else "Unknown"
            state = str(row[state_col]).strip() if state_col and pd.notna(row[state_col]) else "National"
            party = str(row[party_col]).strip() if party_col and pd.notna(row[party_col]) else "IND"
            
            try:
                year = int(row[year_col]) if year_col and pd.notna(row[year_col]) else 2024
            except (ValueError, TypeError):
                year = 2024

            # Position & Result
            position = 1
            try:
                if pos_col and pd.notna(row[pos_col]):
                    position = int(row[pos_col])
            except (ValueError, TypeError):
                position = 1

            result = "Won" if position == 1 else "Lost"
            if position > 4:
                result = "Deposit Forfeited"

            votes = None
            try:
                if votes_col and pd.notna(row[votes_col]):
                    votes = int(float(row[votes_col]))
            except (ValueError, TypeError):
                pass

            margin = None
            try:
                if margin_col and pd.notna(row[margin_col]):
                    margin = int(float(row[margin_col]))
            except (ValueError, TypeError):
                pass

            # Optional demographic fields
            gender = str(row[gender_col]).strip().capitalize() if gender_col and pd.notna(row[gender_col]) else None
            education = str(row[edu_col]).strip() if edu_col and pd.notna(row[edu_col]) else None
            
            total_assets = None
            try:
                if assets_col and pd.notna(row[assets_col]):
                    total_assets = int(float(row[assets_col]))
            except (ValueError, TypeError):
                pass

            criminal_cases_count = 0
            try:
                if crime_col and pd.notna(row[crime_col]):
                    criminal_cases_count = int(float(row[crime_col]))
            except (ValueError, TypeError):
                pass

            records.append({
                "name": name,
                "constituency": constituency,
                "state": state,
                "party": party,
                "election_year": year,
                "house": "Lok Sabha",
                "result": result,
                "position": position,
                "votes_received": votes,
                "margin": margin,
                "gender": gender,
                "education": education,
                "total_assets": total_assets,
                "criminal_cases_count": criminal_cases_count,
                "source": "Lok Dhaba (Ashoka TCPD)",
            })

        log_event("lok_dhaba", f"Successfully extracted {len(records)} candidate records from CSV", level="INFO")
        return records
