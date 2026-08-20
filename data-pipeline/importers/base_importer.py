"""
Base Importer & Entity Matching Engine
Implements deduplication, name normalization, transaction safety, and import log auditing.
"""

import re
import unicodedata
from datetime import datetime
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from utils.models import Politician, DataImportLog
from utils.logger import log_event


def normalize_name(raw_name: str) -> str:
    """
    Normalizes a politician name string:
    - Lowercase
    - Removes honorifics/titles: Shri, Smt, Dr, Prof, Adv, Er, Kunwar, Justice, Col, Capt
    - Strips accents and punctuation
    - Collapses whitespace
    """
    if not raw_name:
        return ""

    # Normalize unicode
    text = unicodedata.normalize("NFKD", str(raw_name))
    text = text.encode("ascii", "ignore").decode("utf-8").lower()

    # Remove titles & honorifics
    titles_pattern = r"\b(shri|smt|shrimati|dr|prof|adv|er|advocate|doctor|kunwar|justice|col|capt|major|yogi|thakur|pandit|kumar|kumari)\b"
    text = re.sub(titles_pattern, "", text)

    # Remove punctuation
    text = re.sub(r"[\.,\(\)\[\]\-_'/\"&]", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


def create_slug(name: str, state: Optional[str] = None, constituency: Optional[str] = None) -> str:
    """
    Generates a clean URL-safe slug from name + optional state or constituency.
    """
    base = normalize_name(name).replace(" ", "-")
    if not base:
        base = "politician"

    suffix = ""
    if state and state.lower() != "national":
        suffix += f"-{re.sub(r'[^a-z0-9]', '', state.lower())}"
    elif constituency and constituency.lower() != "unknown":
        suffix += f"-{re.sub(r'[^a-z0-9]', '', constituency.lower())}"

    slug = f"{base}{suffix}".strip("-")
    return re.sub(r"-+", "-", slug)


class BaseImporter:
    """
    Base class for all data pipeline importers.
    """

    def __init__(self, source_name: str):
        self.source_name = source_name
        self.import_log: Optional[DataImportLog] = None

    async def start_import_log(self, session: AsyncSession) -> DataImportLog:
        """
        Creates a new running entry in data_import_log.
        """
        self.import_log = DataImportLog(
            source=self.source_name,
            status="Running",
            politicians_processed=0,
            politicians_created=0,
            politicians_updated=0,
            started_at=datetime.utcnow(),
        )
        session.add(self.import_log)
        await session.commit()
        return self.import_log

    async def finish_import_log(
        self,
        session: AsyncSession,
        status: str = "Completed",
        errors: Optional[str] = None,
    ) -> None:
        """
        Finalizes the data_import_log record.
        """
        if self.import_log:
            self.import_log.status = status
            self.import_log.errors = errors
            self.import_log.completed_at = datetime.utcnow()
            await session.commit()

    async def find_matching_politician(
        self,
        session: AsyncSession,
        name: str,
        state: Optional[str] = None,
        constituency: Optional[str] = None,
    ) -> Tuple[Optional[Politician], bool]:
        """
        Finds an existing politician record using 3-step fuzzy and exact matching:
        1. Exact match on slug
        2. Match on normalized name + state + constituency
        3. Match on name variants
        Returns (Politician instance, is_confident_match)
        """
        norm_incoming = normalize_name(name)
        if not norm_incoming:
            return None, False

        # 1. Check generated slug
        test_slug = create_slug(name, state, constituency)
        stmt_slug = select(Politician).where(Politician.slug == test_slug)
        res = await session.execute(stmt_slug)
        match = res.scalar_one_or_none()
        if match:
            return match, True

        # 2. Query candidates by state if available
        query = select(Politician)
        if state:
            query = query.where(
                or_(
                    Politician.current_state.ilike(f"%{state}%"),
                    Politician.current_state.is_(None),
                )
            )
        
        candidates_res = await session.execute(query)
        candidates = candidates_res.scalars().all()

        for cand in candidates:
            cand_norm = normalize_name(cand.name)
            # Exact normalized name match
            if cand_norm == norm_incoming:
                # Check constituency match
                if constituency and cand.current_constituency:
                    if normalize_name(cand.current_constituency) == normalize_name(constituency):
                        return cand, True
                # Match on state
                if state and cand.current_state:
                    if normalize_name(cand.current_state) == normalize_name(state):
                        return cand, True
                return cand, False  # Name matches, constituency differs (needs review)

            # Check recorded variants
            variants = [normalize_name(v) for v in (cand.name_variants or [])]
            if norm_incoming in variants:
                return cand, True

        return None, False

    def update_politician_field(self, politician: Politician, field_name: str, new_val: Any, source: str) -> bool:
        """
        Updates a field on a politician only if new_val is non-null.
        Appends source to data_sources.
        """
        if new_val is None or str(new_val).strip() == "":
            return False

        curr_val = getattr(politician, field_name, None)
        # Update field
        setattr(politician, field_name, new_val)

        # Track sources
        sources = list(politician.data_sources or [])
        if source not in sources:
            sources.append(source)
            politician.data_sources = sources

        politician.last_updated = datetime.utcnow()
        return True
