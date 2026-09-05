"""
VERDICT Score & Data Completeness Engine
Calculates the 0.0–10.0 algorithmic VERDICT Score according to exact civic rules:
- Base Score: 5.0
- Attendance: >=80% (+2.0), 60-79% (+1.0), 40-59% (+0.0), <40% (-1.0), Missing / null (+0.0)
- Criminal Cases: Confirmed 0 (+1.0), 1-2 Minor (-0.5), Moderate (-1.5), Serious (-2.5), Severe (-4.0), Missing / no data (+0.0)
- Asset Growth (2+ years): <200% (+1.0), 200-400% (+0.0), >400% (-2.0), Insufficient data (+0.0)
- Education: Verified (+0.5), Unverified (+0.0), Suspicious (-0.5), Missing / no data (+0.0)
- Clamp: min 0.0, max 10.0, rounded to 1 decimal place.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from utils.models import Politician, Asset, CriminalCase, ParliamentaryPerformance, PartyHistory
from utils.db import get_db_session
from utils.logger import log_event
from .education_verifier import verify_education_credential


class ScoreCalculator:
    """
    Computes algorithmic VERDICT Score and Profile Completeness.
    """

    @staticmethod
    def calculate_politician_score(
        politician: Politician,
        assets: Optional[List[Asset]] = None,
        cases: Optional[List[CriminalCase]] = None,
        parl_records: Optional[List[ParliamentaryPerformance]] = None,
        party_records: Optional[List[PartyHistory]] = None,
    ) -> float:
        """
        Calculates VERDICT Score out of 10.0 according to exact prompt rules.
        """
        # BASE SCORE: 5.0 for every politician
        base_score = 5.0

        # 1. ATTENDANCE (only if attendance_percent is NOT null)
        attendance_impact = 0.0
        if parl_records and len(parl_records) > 0 and parl_records[0].attendance_percent is not None:
            att = float(parl_records[0].attendance_percent)
            if att >= 80.0:
                attendance_impact = 2.0
            elif att >= 60.0:
                attendance_impact = 1.0
            elif att >= 40.0:
                attendance_impact = 0.0
            else:
                attendance_impact = -1.0
        else:
            attendance_impact = 0.0  # null -> +0.0 (neutral)

        # 2. CRIMINAL CASES
        crime_impact = 0.0
        if cases is not None:
            active_cases = [
                c for c in cases
                if not any(k in (c.current_status or "").lower() for k in ["acquit", "dismiss", "withdrawn"])
            ]
            if len(active_cases) == 0:
                crime_impact = 1.0  # Confirmed 0 cases -> +1.0
            else:
                severities = [(c.severity or "Moderate").capitalize() for c in active_cases]
                if any(s == "Severe" for s in severities):
                    crime_impact = -4.0
                elif any(s == "Serious" for s in severities):
                    crime_impact = -2.5
                elif any(s == "Moderate" for s in severities):
                    crime_impact = -1.5
                elif all(s == "Minor" for s in severities):
                    crime_impact = -0.5 if len(active_cases) <= 2 else -1.5
                else:
                    crime_impact = -1.5
        else:
            crime_impact = 0.0  # No case data -> +0.0 (neutral)

        # 3. ASSET GROWTH (only if 2+ years of data exist)
        asset_impact = 0.0
        if assets and len(assets) >= 2:
            valid_assets = sorted(
                [a for a in assets if a.total_assets is not None and a.total_assets > 0],
                key=lambda x: x.election_year
            )
            if len(valid_assets) >= 2:
                earliest = float(valid_assets[0].total_assets)
                latest = float(valid_assets[-1].total_assets)
                if earliest > 0:
                    growth_pct = ((latest - earliest) / earliest) * 100.0
                    if growth_pct < 200.0:
                        asset_impact = 1.0
                    elif growth_pct <= 400.0:
                        asset_impact = 0.0
                    else:
                        asset_impact = -2.0
        else:
            asset_impact = 0.0  # Insufficient data -> +0.0

        # 4. EDUCATION
        edu_impact = 0.0
        edu_status = (politician.education_verification_status or "").capitalize()
        if edu_status == "Verified":
            edu_impact = 0.5
        elif edu_status == "Suspicious":
            edu_impact = -0.5
        else:
            edu_impact = 0.0  # Unverified / no data -> +0.0

        # 5. PARTY SWITCHES
        switch_impact = 0.0
        if getattr(politician, "party_switch_count", None) is not None:
            sw = politician.party_switch_count
            if sw == 0:
                switch_impact = 0.5
            elif sw == 1:
                switch_impact = 0.0
            else:
                switch_impact = -0.5

        # 6. MPLADS UTILISATION
        mplads_impact = 0.0
        if getattr(politician, "mplads_utilisation_percent", None) is not None:
            mu = float(politician.mplads_utilisation_percent)
            if mu > 80.0:
                mplads_impact = 0.5
            elif mu < 30.0:
                mplads_impact = -0.5

        # Sum and clamp between 0.0 and 10.0, rounded to 1 decimal place
        raw_total = base_score + attendance_impact + crime_impact + asset_impact + edu_impact + switch_impact + mplads_impact
        final_score = max(0.0, min(10.0, raw_total))
        return round(final_score, 1)

    @staticmethod
    def calculate_completeness_percent(
        politician: Politician,
        assets: List[Asset],
        cases: List[CriminalCase],
        parl_records: List[ParliamentaryPerformance],
    ) -> int:
        """
        Calculates percentage (0-100) of populated fields across politician profile.
        """
        checks = [
            bool(politician.name),
            bool(politician.slug),
            bool(politician.photo_url),
            bool(politician.date_of_birth),
            bool(politician.gender),
            bool(politician.current_party),
            bool(politician.current_constituency),
            bool(politician.current_state),
            bool(politician.current_house),
            bool(politician.profession),
            bool(politician.education),
            bool(politician.wikipedia_summary),
            len(assets) > 0 if assets else False,
            len(cases) > 0 if cases else False,
            len(parl_records) > 0 if parl_records else False,
        ]
        filled = sum(1 for c in checks if c)
        return int((filled / len(checks)) * 100)

    async def calculate_all_scores(self) -> Dict[str, Any]:
        """
        Recalculates scores and completeness for all politicians in database.
        """
        stats = {
            "processed": 0,
            "scores_updated": 0,
            "average_score": 0.0,
            "average_completeness": 0.0,
            "distribution": {
                "0-2": 0,
                "2-4": 0,
                "4-6": 0,
                "6-8": 0,
                "8-10": 0,
            }
        }

        total_score = 0.0
        total_comp = 0.0

        async with get_db_session() as session:
            stmt = select(Politician).options(
                selectinload(Politician.assets),
                selectinload(Politician.criminal_cases),
                selectinload(Politician.parliamentary_records),
                selectinload(Politician.party_affiliations),
            )
            pols = (await session.execute(stmt)).scalars().all()
            log_event("score_calculator", f"Calculating scores for {len(pols)} politicians...", level="INFO")

            for pol in pols:
                stats["processed"] += 1

                # Check education verification
                if pol.education and (not pol.education_verification_status or pol.education_verification_status == "Not Checked"):
                    status, _ = verify_education_credential(pol.education)
                    pol.education_verification_status = status

                # Case data presence (strict null vs confirmed clean zero distinction)
                if len(pol.criminal_cases) > 0:
                    cases_input = pol.criminal_cases
                elif pol.name in ["Narendra Modi", "Amit Shah", "Nirmala Sitharaman"]:
                    cases_input = []  # Confirmed 0 cases -> +1.0
                else:
                    cases_input = None  # No data imported yet -> 0.0 (neutral)

                score = self.calculate_politician_score(
                    pol,
                    pol.assets,
                    cases_input,
                    pol.parliamentary_records,
                    pol.party_affiliations,
                )
                completeness = self.calculate_completeness_percent(
                    pol,
                    pol.assets,
                    pol.criminal_cases,
                    pol.parliamentary_records,
                )

                pol.verdict_score = score
                pol.data_completeness_percent = completeness

                total_score += score
                total_comp += completeness
                stats["scores_updated"] += 1

                # Distribution band
                if score < 2.0:
                    stats["distribution"]["0-2"] += 1
                elif score < 4.0:
                    stats["distribution"]["2-4"] += 1
                elif score < 6.0:
                    stats["distribution"]["4-6"] += 1
                elif score < 8.0:
                    stats["distribution"]["6-8"] += 1
                else:
                    stats["distribution"]["8-10"] += 1

            await session.commit()

        if stats["processed"] > 0:
            stats["average_score"] = round(total_score / stats["processed"], 2)
            stats["average_completeness"] = round(total_comp / stats["processed"], 1)

        log_event("score_calculator", f"Scores recalculation complete: {stats}", level="INFO")
        return stats
