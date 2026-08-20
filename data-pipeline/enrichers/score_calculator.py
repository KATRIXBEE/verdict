"""
VERDICT Score & Data Completeness Engine
Calculates the 0.0–10.0 algorithmic VERDICT Score and data completeness percentages.
"""

from typing import Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
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
        assets: List[Asset],
        cases: List[CriminalCase],
        parl_records: List[ParliamentaryPerformance],
        party_records: List[PartyHistory],
    ) -> float:
        """
        Calculates VERDICT Score out of 10.0 according to official rules.
        """
        # Baseline Points (4.0 pts)
        base_score = 4.0

        # 1. Attendance Score (max 2.0 pts)
        attendance_score = 1.0  # Default neutral
        if parl_records and parl_records[0].attendance_percent is not None:
            att = float(parl_records[0].attendance_percent)
            if att >= 80.0:
                attendance_score = 2.0
            elif att >= 60.0:
                attendance_score = 1.5
            elif att >= 40.0:
                attendance_score = 1.0
            else:
                attendance_score = 0.5

        # 2. Asset Growth Score (max 2.0 pts)
        asset_score = 1.0  # Default neutral
        valid_assets = sorted([a for a in assets if a.total_assets and a.total_assets > 0], key=lambda x: x.election_year)
        if len(valid_assets) >= 2:
            earliest = float(valid_assets[0].total_assets)
            latest = float(valid_assets[-1].total_assets)
            if earliest > 0:
                growth_pct = ((latest - earliest) / earliest) * 100.0
                if growth_pct < 200.0:
                    asset_score = 2.0
                elif growth_pct <= 400.0:
                    asset_score = 1.0
                else:
                    asset_score = 0.0

        # 3. Criminal Case Deductions (starts at 0, max deduction -4.0)
        crime_deductions = 0.0
        severity_map = {
            "Minor": 0.5,
            "Moderate": 1.5,
            "Serious": 2.5,
            "Severe": 4.0,
        }

        for c in cases:
            status = (c.current_status or "").lower()
            if "acquit" in status or "dismiss" in status or "withdrawn" in status:
                continue

            sev = c.severity or "Moderate"
            ded = severity_map.get(sev, 1.5)

            if "convict" in status:
                ded *= 2.0  # Double deduction for conviction

            crime_deductions -= ded

        # Deduction capped at -4.0
        crime_deductions = max(-4.0, crime_deductions)

        # 4. Education Score (max 0.5 pts)
        edu_status = politician.education_verification_status or "Not Checked"
        if edu_status == "Verified":
            edu_score = 0.5
        elif edu_status == "Suspicious":
            edu_score = 0.0
        else:
            edu_score = 0.25  # Unverified / Not Checked

        # 5. Questions Asked Score (max 1.0 pts)
        questions_score = 0.5  # Default neutral
        if parl_records:
            total_q = (parl_records[0].questions_asked_starred or 0) + (parl_records[0].questions_asked_unstarred or 0)
            if total_q > 100:
                questions_score = 1.0
            elif total_q >= 50:
                questions_score = 0.75
            elif total_q >= 10:
                questions_score = 0.5
            else:
                questions_score = 0.25

        # 6. Party Loyalty Score (max 0.5 pts)
        # Number of switches
        switches = max(0, len(party_records) - 1) if party_records else 0
        if switches == 0:
            loyalty_score = 0.5
        elif switches == 1:
            loyalty_score = 0.35
        elif switches == 2:
            loyalty_score = 0.2
        else:
            loyalty_score = 0.0

        # Calculate Sum
        raw_total = base_score + attendance_score + asset_score + crime_deductions + edu_score + questions_score + loyalty_score
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
            len(assets) > 0,
            len(cases) > 0 or politician.education_verification_status != "Not Checked",
            len(parl_records) > 0,
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

                # Verify education if not verified
                if pol.education and pol.education_verification_status == "Not Checked":
                    status, _ = verify_education_credential(pol.education)
                    pol.education_verification_status = status

                score = self.calculate_politician_score(
                    pol,
                    pol.assets,
                    pol.criminal_cases,
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

            await session.commit()

        if stats["processed"] > 0:
            stats["average_score"] = round(total_score / stats["processed"], 2)
            stats["average_completeness"] = round(total_comp / stats["processed"], 1)

        log_event("score_calculator", f"Scores recalculation complete: {stats}", level="INFO")
        return stats
