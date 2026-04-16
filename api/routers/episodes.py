"""Public episode endpoints."""

from __future__ import annotations

import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_optional_user
from ..models import User
from ..schemas import EpisodeDetail, EpisodeListItem, PaginatedEpisodes
from ..services.episode_service import get_episode, list_episodes_done
from ..services.user_service import get_user_episode_states, is_episode_saved, is_episode_liked

router = APIRouter(prefix="/api/episodes", tags=["episodes"])


@router.get("", response_model=PaginatedEpisodes)
def list_done_episodes(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """List episodes that are fully processed (status=done), with optional search."""
    items, total = list_episodes_done(db, page=page, per_page=per_page, search=search)

    # Get user states if logged in
    user_states = {}
    if user and items:
        episode_ids = [ep.id for ep in items]
        user_states = get_user_episode_states(db, user.id, episode_ids)

    episode_items = []
    for ep in items:
        item = EpisodeListItem.model_validate(ep)
        if user and ep.id in user_states:
            item.is_saved = user_states[ep.id]["is_saved"]
            item.is_liked = user_states[ep.id]["is_liked"]
        episode_items.append(item)

    return PaginatedEpisodes(
        items=episode_items,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 0,
    )


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
