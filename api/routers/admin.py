"""Admin endpoints for managing episodes."""

import asyncio
import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    EpisodeDetail,
    EpisodeListItem,
    PaginatedEpisodes,
    SubmitEpisodeRequest,
    TranslationUpdateRequest,
)
from ..services.episode_service import (
    create_episode,
    get_episode,
    list_episodes_all,
    update_episode,
)
from ..services.pipeline_service import (
    _detect_source_type,
    narrate_episode,
    process_episode,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/submit", response_model=EpisodeDetail, status_code=201)
async def submit_episode(body: SubmitEpisodeRequest, db: Session = Depends(get_db)):
    """Submit a URL for processing. Starts download + transcription in background."""
    source_type = _detect_source_type(body.url)
    title = body.title or body.url

    episode = create_episode(
        db,
        title=title,
        source_url=body.url,
        source_type=source_type,
        voice=body.voice,
        whisper_model=body.whisper_model,
    )

    # Run the heavy pipeline in a background thread
    asyncio.get_event_loop().call_soon(
        lambda eid=episode.id: asyncio.ensure_future(asyncio.to_thread(process_episode, eid))
    )

    return EpisodeDetail.model_validate(episode)


@router.get("/episodes", response_model=PaginatedEpisodes)
def list_all_episodes(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List ALL episodes regardless of status."""
    items, total = list_episodes_all(db, page=page, per_page=per_page)
    return PaginatedEpisodes(
        items=[EpisodeListItem.model_validate(ep) for ep in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total else 0,
    )


@router.patch("/episodes/{episode_id}/translation", response_model=EpisodeDetail)
async def submit_translation(
    episode_id: int,
    body: TranslationUpdateRequest,
    db: Session = Depends(get_db),
):
    """Submit Persian translation text for an episode, then trigger narration."""
    episode = get_episode(db, episode_id)
    if episode is None:
        raise HTTPException(status_code=404, detail="Episode not found")

    if episode.status not in ("awaiting_translation", "error", "done"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot submit translation while episode is in '{episode.status}' status.",
        )

    update_episode(db, episode, persian_text=body.persian_text, status="narrating")

    # Run narration in background thread (EdgeTTS uses asyncio.run internally)
    asyncio.get_event_loop().call_soon(
        lambda eid=episode.id: asyncio.ensure_future(asyncio.to_thread(narrate_episode, eid))
    )

    return EpisodeDetail.model_validate(episode)


@router.post("/episodes/{episode_id}/retry", response_model=EpisodeDetail)
async def retry_episode(episode_id: int, db: Session = Depends(get_db)):
    """Retry a failed episode from the beginning."""
    episode = get_episode(db, episode_id)
    if episode is None:
        raise HTTPException(status_code=404, detail="Episode not found")

    if episode.status != "error":
        raise HTTPException(status_code=400, detail="Only failed episodes can be retried.")

    update_episode(db, episode, status="pending", error_message=None)

    # If we already have persian_text, skip to narration
    if episode.persian_text:
        asyncio.get_event_loop().call_soon(
            lambda eid=episode.id: asyncio.ensure_future(asyncio.to_thread(narrate_episode, eid))
        )
    else:
        asyncio.get_event_loop().call_soon(
            lambda eid=episode.id: asyncio.ensure_future(asyncio.to_thread(process_episode, eid))
        )

    return EpisodeDetail.model_validate(episode)
