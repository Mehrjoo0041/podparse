"""SQLAlchemy ORM models."""

from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, Text, Integer, Float, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def generate_cover_color(title: str) -> str:
    """Generate a deterministic muted pastel hex color from a title string."""
    digest = hashlib.md5(title.encode("utf-8")).hexdigest()
    hue = int(digest[:3], 16) % 360
    sat = 40 + (int(digest[3:5], 16) % 21)
    light = 75 + (int(digest[5:7], 16) % 11)

    s = sat / 100
    l = light / 100
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((hue / 60) % 2 - 1))
    m = l - c / 2

    if hue < 60:
        r, g, b = c, x, 0
    elif hue < 120:
        r, g, b = x, c, 0
    elif hue < 180:
        r, g, b = 0, c, x
    elif hue < 240:
        r, g, b = 0, x, c
    elif hue < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x

    r = int((r + m) * 255)
    g = int((g + m) * 255)
    b = int((b + m) * 255)

    return f"#{r:02x}{g:02x}{b:02x}"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(200), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    saved_episodes: Mapped[List["SavedEpisode"]] = relationship("SavedEpisode", back_populates="user", cascade="all, delete-orphan")
    liked_episodes: Mapped[List["LikedEpisode"]] = relationship("LikedEpisode", back_populates="user", cascade="all, delete-orphan")


class Episode(Base):
    __tablename__ = "episodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source_url: Mapped[str] = mapped_column(String(2000), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")

    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    original_audio_path: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    transcript_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    persian_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    narrated_audio_path: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    podcast_name: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    published_date: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    voice: Mapped[str] = mapped_column(String(50), nullable=False, default="dilara")
    whisper_model: Mapped[str] = mapped_column(String(50), nullable=False, default="base")

    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    cover_color: Mapped[str] = mapped_column(String(7), nullable=False, default="#c4b5d0")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class SavedEpisode(Base):
    __tablename__ = "saved_episodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    episode_id: Mapped[int] = mapped_column(ForeignKey("episodes.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    user: Mapped["User"] = relationship("User", back_populates="saved_episodes")
    episode: Mapped["Episode"] = relationship("Episode")

    __table_args__ = (UniqueConstraint("user_id", "episode_id"),)


class ListenEvent(Base):
    __tablename__ = "listen_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    episode_id: Mapped[int] = mapped_column(ForeignKey("episodes.id"), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    listened_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    user: Mapped["User"] = relationship("User")
    episode: Mapped["Episode"] = relationship("Episode")


class LikedEpisode(Base):
    __tablename__ = "liked_episodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    episode_id: Mapped[int] = mapped_column(ForeignKey("episodes.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    user: Mapped["User"] = relationship("User", back_populates="liked_episodes")
    episode: Mapped["Episode"] = relationship("Episode")

    __table_args__ = (UniqueConstraint("user_id", "episode_id"),)
