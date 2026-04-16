"""Analytics endpoints for admin dashboard."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_admin_user, get_current_user
from ..models import User, Episode, SavedEpisode, LikedEpisode, ListenEvent

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
def get_dashboard(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Get full analytics dashboard data. Admin only."""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # --- Users ---
    total_users = db.query(func.count(User.id)).scalar()
    new_users_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar()
    new_users_month = db.query(func.count(User.id)).filter(User.created_at >= month_ago).scalar()
    admin_count = db.query(func.count(User.id)).filter(User.is_admin == True).scalar()

    # --- Episodes ---
    total_episodes = db.query(func.count(Episode.id)).scalar()
    done_episodes = db.query(func.count(Episode.id)).filter(Episode.status == "done").scalar()
    processing_episodes = db.query(func.count(Episode.id)).filter(
        Episode.status.in_(["pending", "downloading", "transcribing", "processing", "narrating"])
    ).scalar()
    error_episodes = db.query(func.count(Episode.id)).filter(Episode.status == "error").scalar()

    # --- Engagement ---
    total_saves = db.query(func.count(SavedEpisode.id)).scalar()
    total_likes = db.query(func.count(LikedEpisode.id)).scalar()
    total_listens = db.query(func.count(ListenEvent.id)).scalar()
    completed_listens = db.query(func.count(ListenEvent.id)).filter(ListenEvent.completed == True).scalar()
    listens_week = db.query(func.count(ListenEvent.id)).filter(ListenEvent.created_at >= week_ago).scalar()

    # --- Users with engagement (active users) ---
    active_users_week = db.query(func.count(func.distinct(ListenEvent.user_id))).filter(
        ListenEvent.created_at >= week_ago
    ).scalar()
    active_users_month = db.query(func.count(func.distinct(ListenEvent.user_id))).filter(
        ListenEvent.created_at >= month_ago
    ).scalar()

    # --- Users who saved at least one episode ---
    users_with_saves = db.query(func.count(func.distinct(SavedEpisode.user_id))).scalar()
    users_with_likes = db.query(func.count(func.distinct(LikedEpisode.user_id))).scalar()

    # --- Top episodes by listens ---
    top_episodes_q = (
        db.query(
            Episode.id,
            Episode.title,
            Episode.cover_color,
            func.count(ListenEvent.id).label("listen_count"),
            func.count(func.nullif(ListenEvent.completed, False)).label("completed_count"),
        )
        .join(ListenEvent, ListenEvent.episode_id == Episode.id)
        .group_by(Episode.id)
        .order_by(func.count(ListenEvent.id).desc())
        .limit(5)
        .all()
    )
    top_episodes = [
        {
            "id": ep.id,
            "title": ep.title,
            "cover_color": ep.cover_color,
            "listens": ep.listen_count,
            "completed": ep.completed_count,
        }
        for ep in top_episodes_q
    ]

    # --- Recent users ---
    recent_users_q = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_users = [
        {
            "id": u.id,
            "display_name": u.display_name,
            "email": u.email,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in recent_users_q
    ]

    # --- Daily listens for last 7 days ---
    daily_listens = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(func.count(ListenEvent.id)).filter(
            and_(ListenEvent.created_at >= day_start, ListenEvent.created_at < day_end)
        ).scalar()
        daily_listens.append({
            "date": day_start.strftime("%m/%d"),
            "count": count,
        })

    completion_rate = round((completed_listens / total_listens * 100), 1) if total_listens > 0 else 0

    return {
        "users": {
            "total": total_users,
            "new_week": new_users_week,
            "new_month": new_users_month,
            "admins": admin_count,
            "active_week": active_users_week,
            "active_month": active_users_month,
            "with_saves": users_with_saves,
            "with_likes": users_with_likes,
        },
        "episodes": {
            "total": total_episodes,
            "done": done_episodes,
            "processing": processing_episodes,
            "error": error_episodes,
        },
        "engagement": {
            "total_listens": total_listens,
            "listens_week": listens_week,
            "completed_listens": completed_listens,
            "completion_rate": completion_rate,
            "total_saves": total_saves,
            "total_likes": total_likes,
        },
        "top_episodes": top_episodes,
        "recent_users": recent_users,
        "daily_listens": daily_listens,
    }


@router.post("/listen")
def record_listen(
    episode_id: int,
    completed: bool = False,
    listened_seconds: float = 0,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record a listen event. Called by the frontend audio player."""
    event = ListenEvent(
        user_id=user.id,
        episode_id=episode_id,
        completed=completed,
        listened_seconds=listened_seconds,
    )
    db.add(event)
    db.commit()
    return {"detail": "Listen recorded"}
