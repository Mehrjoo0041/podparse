"""CRUD operations for users and library (saved/liked)."""

from __future__ import annotations

from typing import Optional, List, Tuple

from sqlalchemy import desc
from sqlalchemy.orm import Session

from ..models import User, SavedEpisode, LikedEpisode, Episode
from .auth_service import hash_password


def create_user(db: Session, email: str, display_name: str, password: str) -> User:
    user = User(
        email=email.lower().strip(),
        display_name=display_name.strip(),
        hashed_password=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower().strip()).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def update_user(db: Session, user: User, **kwargs) -> User:
    for key, value in kwargs.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


# ---- Saved Episodes ----

def save_episode(db: Session, user_id: int, episode_id: int) -> SavedEpisode:
    existing = db.query(SavedEpisode).filter_by(user_id=user_id, episode_id=episode_id).first()
    if existing:
        return existing
    saved = SavedEpisode(user_id=user_id, episode_id=episode_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


def unsave_episode(db: Session, user_id: int, episode_id: int) -> bool:
    row = db.query(SavedEpisode).filter_by(user_id=user_id, episode_id=episode_id).first()
    if row:
        db.delete(row)
        db.commit()
        return True
    return False


def list_saved_episodes(
    db: Session, user_id: int, page: int = 1, per_page: int = 20
) -> Tuple[List[Episode], int]:
    query = (
        db.query(Episode)
        .join(SavedEpisode, SavedEpisode.episode_id == Episode.id)
        .filter(SavedEpisode.user_id == user_id, Episode.status == "done")
    )
    total = query.count()
    items = (
        query.order_by(desc(SavedEpisode.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return items, total


def is_episode_saved(db: Session, user_id: int, episode_id: int) -> bool:
    return db.query(SavedEpisode).filter_by(user_id=user_id, episode_id=episode_id).first() is not None


# ---- Liked Episodes ----

def like_episode(db: Session, user_id: int, episode_id: int) -> LikedEpisode:
    existing = db.query(LikedEpisode).filter_by(user_id=user_id, episode_id=episode_id).first()
    if existing:
        return existing
    liked = LikedEpisode(user_id=user_id, episode_id=episode_id)
    db.add(liked)
    db.commit()
    db.refresh(liked)
    return liked


def unlike_episode(db: Session, user_id: int, episode_id: int) -> bool:
    row = db.query(LikedEpisode).filter_by(user_id=user_id, episode_id=episode_id).first()
    if row:
        db.delete(row)
        db.commit()
        return True
    return False


def list_liked_episodes(
    db: Session, user_id: int, page: int = 1, per_page: int = 20
) -> Tuple[List[Episode], int]:
    query = (
        db.query(Episode)
        .join(LikedEpisode, LikedEpisode.episode_id == Episode.id)
        .filter(LikedEpisode.user_id == user_id, Episode.status == "done")
    )
    total = query.count()
    items = (
        query.order_by(desc(LikedEpisode.created_at))
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return items, total


def is_episode_liked(db: Session, user_id: int, episode_id: int) -> bool:
    return db.query(LikedEpisode).filter_by(user_id=user_id, episode_id=episode_id).first() is not None


def get_user_episode_states(db: Session, user_id: int, episode_ids: List[int]) -> dict:
    """Get saved/liked states for multiple episodes at once."""
    saved_ids = set(
        row[0] for row in
        db.query(SavedEpisode.episode_id)
        .filter(SavedEpisode.user_id == user_id, SavedEpisode.episode_id.in_(episode_ids))
        .all()
    )
    liked_ids = set(
        row[0] for row in
        db.query(LikedEpisode.episode_id)
        .filter(LikedEpisode.user_id == user_id, LikedEpisode.episode_id.in_(episode_ids))
        .all()
    )
    return {
        eid: {"is_saved": eid in saved_ids, "is_liked": eid in liked_ids}
        for eid in episode_ids
    }
