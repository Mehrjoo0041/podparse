"""Public episode endpoints."""

from __future__ import annotations

import math
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_optional_user
from ..models import User, Episode
from ..schemas import EpisodeDetail, EpisodeListItem, PaginatedEpisodes
from ..services.episode_service import get_episode, list_episodes_done
from ..services.user_service import get_user_episode_states, is_episode_saved, is_episode_liked

router = APIRouter(prefix="/api/episodes", tags=["episodes"])


def _annotate_items(db: Session, items: list, user: Optional[User]) -> List[EpisodeListItem]:
    """Add is_saved/is_liked to episode list items."""
    user_states = {}
    if user and items:
        episode_ids = [ep.id for ep in items]
        user_states = get_user_episode_states(db, user.id, episode_ids)

    result = []
    for ep in items:
        item = EpisodeListItem.model_validate(ep)
        if user and ep.id in user_states:
            item.is_saved = user_states[ep.id]["is_saved"]
            item.is_liked = user_states[ep.id]["is_liked"]
        result.append(item)
    return result


@router.get("", response_model=PaginatedEpisodes)
def list_done_episodes(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """List episodes that are fully processed, with optional search and category filter."""
    query = db.query(Episode).filter(Episode.status == "done")

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(Episode.title.ilike(pattern), Episode.podcast_name.ilike(pattern))
        )
    if category:
        query = query.filter(Episode.category == category)

    total = query.count()
    items = query.order_by(desc(Episode.created_at)).offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedEpisodes(
        items=_annotate_items(db, items, user),
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 0,
    )


@router.get("/recent", response_model=PaginatedEpisodes)
def list_recent_episodes(
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """List the most recently added episodes."""
    query = db.query(Episode).filter(Episode.status == "done")
    total = query.count()
    items = query.order_by(desc(Episode.created_at)).limit(per_page).all()

    return PaginatedEpisodes(
        items=_annotate_items(db, items, user),
        total=total,
        page=1,
        per_page=per_page,
        pages=1,
    )


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    """List all categories with episode counts."""
    results = (
        db.query(Episode.category, func.count(Episode.id))
        .filter(Episode.status == "done", Episode.category.isnot(None))
        .group_by(Episode.category)
        .order_by(func.count(Episode.id).desc())
        .all()
    )
    return [{"name": cat, "count": count} for cat, count in results]


@router.get("/{episode_id}", response_model=EpisodeDetail)
def get_episode_detail(
    episode_id: int,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """Get full episode detail by ID."""
    episode = get_episode(db, episode_id)
    if episode is None:
        raise HTTPException(status_code=404, detail="Episode not found")

    detail = EpisodeDetail.model_validate(episode)
    if user:
        detail.is_saved = is_episode_saved(db, user.id, episode_id)
        detail.is_liked = is_episode_liked(db, user.id, episode_id)

    return detail
