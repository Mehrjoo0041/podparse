"""CRUD operations for episodes."""

from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from ..models import Episode, generate_cover_color


def create_episode(
    db: Session,
    *,
    title: str,
    source_url: str,
    source_type: str,
    voice: str = "dilara",
    whisper_model: str = "base",
    podcast_name: Optional[str] = None,
    published_date: Optional[str] = None,
    summary: Optional[str] = None,
    category: Optional[str] = None,
) -> Episode:
    episode = Episode(
        title=title,
        source_url=source_url,
        source_type=source_type,
        voice=voice,
        whisper_model=whisper_model,
        podcast_name=podcast_name,
        published_date=published_date,
        summary=summary,
        category=category,
        cover_color=generate_cover_color(title),
        status="pending",
    )
    db.add(episode)
    db.commit()
    db.refresh(episode)
    return episode


def get_episode(db: Session, episode_id: int) -> Optional[Episode]:
    return db.query(Episode).filter(Episode.id == episode_id).first()


def list_episodes_done(
    db: Session, *, page: int = 1, per_page: int = 20, search: Optional[str] = None
) -> Tuple[List[Episode], int]:
    query = db.query(Episode).filter(Episode.status == "done")
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(Episode.title.ilike(pattern), Episode.podcast_name.ilike(pattern))
        )
    total = query.count()
    items = (
        query.order_by(desc(Episode.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return items, total


def list_episodes_all(
    db: Session, *, page: int = 1, per_page: int = 20
) -> Tuple[List[Episode], int]:
    query = db.query(Episode)
    total = query.count()
    items = (
        query.order_by(desc(Episode.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return items, total


def update_episode(db: Session, episode: Episode, **kwargs) -> Episode:
    for key, value in kwargs.items():
        setattr(episode, key, value)
    db.commit()
    db.refresh(episode)
    return episode
