"""Personal library endpoints — saved and liked episodes."""

from __future__ import annotations

import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import User, Episode
from ..schemas import EpisodeListItem, PaginatedEpisodes
from ..services.user_service import (
    save_episode,
    unsave_episode,
    list_saved_episodes,
    like_episode,
    unlike_episode,
    list_liked_episodes,
)

router = APIRouter(prefix="/api/library", tags=["library"])


# ---- Saved Episodes ----

@router.get("/saved", response_model=PaginatedEpisodes)
def get_saved(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the current user's saved episodes."""
    items, total = list_saved_episodes(db, user.id, page=page, per_page=per_page)
    return PaginatedEpisodes(
        items=[EpisodeListItem(is_saved=True, **{
            k: getattr(ep, k) for k in EpisodeListItem.model_fields if k not in ("is_saved", "is_liked")
        }) for ep in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 0,
    )


@router.post("/saved/{episode_id}", status_code=201)
def add_saved(
    episode_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save (bookmark) an episode."""
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    save_episode(db, user.id, episode_id)
    return {"detail": "Episode saved"}


@router.delete("/saved/{episode_id}")
def remove_saved(
    episode_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a saved episode."""
    unsave_episode(db, user.id, episode_id)
    return {"detail": "Episode unsaved"}


# ---- Liked Episodes ----

@router.get("/liked", response_model=PaginatedEpisodes)
def get_liked(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the current user's liked episodes."""
    items, total = list_liked_episodes(db, user.id, page=page, per_page=per_page)
    return PaginatedEpisodes(
        items=[EpisodeListItem(is_liked=True, **{
            k: getattr(ep, k) for k in EpisodeListItem.model_fields if k not in ("is_saved", "is_liked")
        }) for ep in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 0,
    )


@router.post("/liked/{episode_id}", status_code=201)
def add_liked(
    episode_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Like an episode."""
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    like_episode(db, user.id, episode_id)
    return {"detail": "Episode liked"}


@router.delete("/liked/{episode_id}")
def remove_liked(
    episode_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a liked episode."""
    unlike_episode(db, user.id, episode_id)
    return {"detail": "Episode unliked"}
