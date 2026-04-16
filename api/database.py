"""SQLAlchemy database setup — supports PostgreSQL (Supabase) and SQLite fallback."""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

# Use DATABASE_URL env var for PostgreSQL (Supabase), fall back to SQLite for local dev
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///podcast.db")

# SQLite needs check_same_thread=False; PostgreSQL doesn't
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)
