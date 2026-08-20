"""
Database Engine and Session Management
Async SQLAlchemy database engine and session provider.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from config import DATABASE_URL
from .models import Base, IPCLookup
from .logger import log_event

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

# Async session factory
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager providing an async SQLAlchemy session with auto-rollback on error.
    """
    session = async_session_factory()
    try:
        yield session
    except Exception as e:
        await session.rollback()
        raise e
    finally:
        await session.close()


# Initial IPC Seed Definitions
SEED_IPC_DATA = [
    ("302", "Murder", "Severe", "Violent Crime"),
    ("376", "Rape", "Severe", "Sexual Offences"),
    ("406", "Criminal breach of trust", "Serious", "Financial Crime"),
    ("420", "Cheating and fraudulent property transfer", "Serious", "Financial Crime"),
    ("147", "Rioting", "Moderate", "Public Order"),
    ("148", "Rioting armed with deadly weapon", "Serious", "Public Order"),
    ("149", "Unlawful assembly", "Moderate", "Public Order"),
    ("188", "Disobedience to public servant order", "Minor", "Public Order"),
    ("120B", "Criminal conspiracy", "Serious", "Conspiracy"),
    ("201", "Causing disappearance of evidence", "Serious", "Obstruction of Justice"),
    ("384", "Extortion", "Serious", "Violent Crime"),
    ("386", "Extortion by putting person in fear of death", "Serious", "Violent Crime"),
    ("409", "Criminal breach of trust by public servant", "Severe", "Corruption"),
    ("411", "Dishonestly receiving stolen property", "Moderate", "Property Offence"),
    ("465", "Forgery", "Serious", "Fraud"),
    ("471", "Using forged document as genuine", "Serious", "Fraud"),
    ("498A", "Cruelty by husband or relatives", "Serious", "Domestic Violence"),
    ("POCSO", "Crime against a child", "Severe", "Child Protection"),
    ("PC Act 7", "Offence relating to bribery", "Severe", "Corruption"),
    ("PC Act 13", "Criminal misconduct by public servant", "Severe", "Corruption"),
]


async def init_db() -> None:
    """
    Initializes database tables and seeds standard lookup tables.
    """
    log_event("db", "Initializing database tables...", level="INFO")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed IPC lookup table
    async with get_db_session() as session:
        for section, plain_english, severity, category in SEED_IPC_DATA:
            stmt = select(IPCLookup).where(IPCLookup.section == section)
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                lookup = IPCLookup(
                    section=section,
                    plain_english=plain_english,
                    severity=severity,
                    category=category,
                )
                session.add(lookup)
        await session.commit()
    log_event("db", "Database initialization complete.", level="INFO")
