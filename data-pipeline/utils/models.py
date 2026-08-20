"""
SQLAlchemy ORM Models for VERDICT Data Pipeline
Compatible with PostgreSQL (asyncpg) and SQLite (aiosqlite).
"""

import uuid
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Text,
    ForeignKey,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Politician(Base):
    __tablename__ = "politicians"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    name_variants = Column(JSON, default=list)  # List of alternate strings
    slug = Column(String(255), unique=True, nullable=False, index=True)
    photo_url = Column(Text, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(50), nullable=True)
    current_party = Column(String(100), nullable=True, index=True)
    current_constituency = Column(String(150), nullable=True)
    current_state = Column(String(100), nullable=True, index=True)
    current_house = Column(String(50), nullable=True)
    profession = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    education_verification_status = Column(String(50), default="Not Checked")
    wikipedia_url = Column(Text, nullable=True)
    wikipedia_summary = Column(Text, nullable=True)
    official_website = Column(Text, nullable=True)
    social_twitter = Column(String(255), nullable=True)
    social_facebook = Column(String(255), nullable=True)
    verdict_score = Column(Numeric(4, 2), default=5.0)
    data_completeness_percent = Column(Integer, default=0)
    data_sources = Column(JSON, default=list)  # List of contributing sources
    needs_review = Column(Boolean, default=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    elections = relationship("ElectionHistory", back_populates="politician", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="politician", cascade="all, delete-orphan")
    criminal_cases = relationship("CriminalCase", back_populates="politician", cascade="all, delete-orphan")
    parliamentary_records = relationship("ParliamentaryPerformance", back_populates="politician", cascade="all, delete-orphan")
    party_affiliations = relationship("PartyHistory", back_populates="politician", cascade="all, delete-orphan")
    news_mentions = relationship("NewsMention", back_populates="politician", cascade="all, delete-orphan")


class ElectionHistory(Base):
    __tablename__ = "election_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    politician_id = Column(String(36), ForeignKey("politicians.id", ondelete="CASCADE"), nullable=False, index=True)
    election_year = Column(Integer, nullable=False, index=True)
    house = Column(String(50), nullable=False)
    constituency = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False)
    party = Column(String(100), nullable=False)
    votes_received = Column(Integer, nullable=True)
    vote_share_percent = Column(Numeric(5, 2), nullable=True)
    result = Column(String(50), nullable=False)  # Won / Lost / Deposit Forfeited
    total_candidates = Column(Integer, nullable=True)
    runner_up_votes = Column(Integer, nullable=True)
    margin = Column(Integer, nullable=True)
    source = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    politician = relationship("Politician", back_populates="elections")

    __table_args__ = (
        UniqueConstraint("politician_id", "election_year", "constituency", name="uq_pol_election_constituency"),
    )


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    politician_id = Column(String(36), ForeignKey("politicians.id", ondelete="CASCADE"), nullable=False, index=True)
    election_year = Column(Integer, nullable=False)
    movable_assets = Column(BigInteger, nullable=True)
    immovable_assets = Column(BigInteger, nullable=True)
    total_assets = Column(BigInteger, nullable=True)
    total_liabilities = Column(BigInteger, nullable=True)
    net_assets = Column(BigInteger, nullable=True)
    spouse_assets = Column(BigInteger, nullable=True)
    dependent_assets = Column(BigInteger, nullable=True)
    income_sources = Column(Text, nullable=True)
    pan_number_declared = Column(Boolean, default=False)
    source = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    politician = relationship("Politician", back_populates="assets")

    __table_args__ = (
        UniqueConstraint("politician_id", "election_year", name="uq_pol_asset_year"),
    )


class CriminalCase(Base):
    __tablename__ = "criminal_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    politician_id = Column(String(36), ForeignKey("politicians.id", ondelete="CASCADE"), nullable=False, index=True)
    case_number = Column(String(150), nullable=True)
    court_name = Column(String(255), nullable=True)
    court_state = Column(String(100), nullable=True)
    ipc_sections = Column(JSON, default=list)
    ipc_plain_english = Column(JSON, default=list)
    nature_of_offence = Column(Text, nullable=True)
    date_filed = Column(Date, nullable=True)
    current_status = Column(String(100), default="Chargesheet Filed", index=True)
    next_hearing_date = Column(Date, nullable=True)
    severity = Column(String(50), default="Moderate", index=True)
    score_impact = Column(Numeric(4, 2), default=0.0)
    election_year_declared = Column(Integer, nullable=True)
    ecourts_case_id = Column(String(150), nullable=True)
    last_status_check = Column(DateTime, nullable=True)
    source = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    politician = relationship("Politician", back_populates="criminal_cases")


class ParliamentaryPerformance(Base):
    __tablename__ = "parliamentary_performance"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    politician_id = Column(String(36), ForeignKey("politicians.id", ondelete="CASCADE"), nullable=False, index=True)
    term_year_start = Column(Integer, nullable=False)
    term_year_end = Column(Integer, nullable=True)
    house = Column(String(50), nullable=False)
    total_sessions = Column(Integer, nullable=True)
    sessions_attended = Column(Integer, nullable=True)
    attendance_percent = Column(Numeric(5, 2), nullable=True)
    questions_asked_starred = Column(Integer, default=0)
    questions_asked_unstarred = Column(Integer, default=0)
    debates_participated = Column(Integer, default=0)
    private_bills_introduced = Column(Integer, default=0)
    private_bills_passed = Column(Integer, default=0)
    source = Column(String(100), nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    politician = relationship("Politician", back_populates="parliamentary_records")

    __table_args__ = (
        UniqueConstraint("politician_id", "term_year_start", "house", name="uq_pol_term_house"),
    )


class PartyHistory(Base):
    __tablename__ = "party_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    politician_id = Column(String(36), ForeignKey("politicians.id", ondelete="CASCADE"), nullable=False, index=True)
    party_name = Column(String(100), nullable=False)
    joined_date = Column(Date, nullable=True)
    left_date = Column(Date, nullable=True)
    reason_for_leaving = Column(Text, nullable=True)
    source = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    politician = relationship("Politician", back_populates="party_affiliations")


class DataImportLog(Base):
    __tablename__ = "data_import_log"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source = Column(String(100), nullable=False, index=True)
    status = Column(String(50), nullable=False)  # Running / Completed / Failed / Partial
    politicians_processed = Column(Integer, default=0)
    politicians_created = Column(Integer, default=0)
    politicians_updated = Column(Integer, default=0)
    errors = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class IPCLookup(Base):
    __tablename__ = "ipc_lookup"

    section = Column(String(50), primary_key=True)
    plain_english = Column(String(255), nullable=False)
    severity = Column(String(50), nullable=False)  # Minor / Moderate / Serious / Severe
    category = Column(String(100), nullable=False)


class NewsMention(Base):
    __tablename__ = "news_mentions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    politician_id = Column(String(36), ForeignKey("politicians.id", ondelete="CASCADE"), nullable=False, index=True)
    headline = Column(Text, nullable=False)
    source_name = Column(String(150), nullable=False)
    url = Column(Text, unique=True, nullable=False)
    published_date = Column(Date, nullable=True)
    sentiment = Column(String(50), nullable=False)  # Positive / Neutral / Negative
    created_at = Column(DateTime, default=datetime.utcnow)

    politician = relationship("Politician", back_populates="news_mentions")
