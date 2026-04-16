"""Pipeline service — wraps existing src/ modules for the API layer."""

from __future__ import annotations

import asyncio
import os
import sys
import traceback
from typing import Optional

from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Episode
from ..services.episode_service import update_episode

# Ensure project root is on the path so src/ imports work
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Lazy imports — these modules are heavy (Whisper loads ML models)
# Imported inside functions so the API server starts fast


def _get_downloader():
    from src.downloader import PodcastDownloader
    return PodcastDownloader


def _get_transcriber():
    from src.transcriber import WhisperTranscriber
    return WhisperTranscriber


def _get_narrator():
    from src.tts import EdgeTTSNarrator
    return EdgeTTSNarrator

MEDIA_DIR = os.path.join(PROJECT_ROOT, "media")


def _is_rss_url(url: str) -> bool:
    lower = url.lower()
    return "feed" in lower or lower.endswith(".xml") or "rss" in lower


def _is_ytdlp_url(url: str) -> bool:
    lower = url.lower()
    return any(host in lower for host in ["youtube.com", "youtu.be", "spotify.com"])


def _detect_source_type(url: str) -> str:
    if _is_rss_url(url):
        return "rss"
    if "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    if "spotify.com" in url:
        return "spotify"
    return "direct"


def _get_episode_dir(episode_id: int) -> str:
    d = os.path.join(MEDIA_DIR, str(episode_id))
    os.makedirs(d, exist_ok=True)
    return d


def _get_audio_duration(path: str) -> Optional[float]:
    """Try to get audio duration in seconds using pydub."""
    try:
        from pydub import AudioSegment
        audio = AudioSegment.from_file(path)
        return len(audio) / 1000.0
    except Exception:
        return None


def process_episode(episode_id: int) -> None:
    """Run download + transcribe in a background thread.

    Called via asyncio.to_thread() from the router.
    Uses its own DB session since it runs in a separate thread.
    """
    db: Session = SessionLocal()
    try:
        episode = db.query(Episode).filter(Episode.id == episode_id).first()
        if episode is None:
            return

        episode_dir = _get_episode_dir(episode_id)
        PodcastDownloader = _get_downloader()
        downloader = PodcastDownloader(output_dir=episode_dir)

        # ---- DOWNLOAD ----
        update_episode(db, episode, status="downloading", error_message=None)
        url = episode.source_url

        if _is_rss_url(url):
            episodes_list = downloader.fetch_episodes_from_rss(url)
            if not episodes_list:
                update_episode(db, episode, status="error", error_message="No episodes found in RSS feed.")
                return
            rss_ep = episodes_list[0]
            # Update metadata from feed if not already set
            updates = {}
            if not episode.title or episode.title == url:
                updates["title"] = rss_ep["title"]
            if rss_ep.get("published"):
                updates["published_date"] = rss_ep["published"]
            if rss_ep.get("summary"):
                updates["summary"] = rss_ep["summary"]
            if updates:
                # Regenerate cover color if title changed
                if "title" in updates:
                    from ..models import generate_cover_color
                    updates["cover_color"] = generate_cover_color(updates["title"])
                update_episode(db, episode, **updates)
            audio_path = downloader.download_audio(rss_ep["url"])
        elif _is_ytdlp_url(url):
            audio_path = downloader.download_with_ytdlp(url)
        else:
            audio_path = downloader.download_audio(url)

        # Get duration
        duration = _get_audio_duration(audio_path)

        # Make the path relative to project root for storage
        rel_audio = os.path.relpath(audio_path, PROJECT_ROOT)
        update_episode(
            db, episode,
            status="transcribing",
            original_audio_path=rel_audio,
            duration_seconds=duration,
        )

        # ---- TRANSCRIBE ----
        WhisperTranscriber = _get_transcriber()
        transcriber = WhisperTranscriber(model_name=episode.whisper_model)
        transcript = transcriber.transcribe(audio_path)
        transcript_text = transcript["text"]

        update_episode(
            db, episode,
            status="awaiting_translation",
            transcript_text=transcript_text,
        )

    except Exception as exc:
        tb = traceback.format_exc()
        try:
            update_episode(db, episode, status="error", error_message=f"{exc}\n{tb}")
        except Exception:
            pass
    finally:
        db.close()


def narrate_episode(episode_id: int) -> None:
    """Run TTS narration in a background thread.

    EdgeTTSNarrator.narrate() uses asyncio.run() internally,
    so this must run in a thread (not in the async event loop).
    """
    db: Session = SessionLocal()
    try:
        episode = db.query(Episode).filter(Episode.id == episode_id).first()
        if episode is None:
            return

        if not episode.persian_text:
            update_episode(db, episode, status="error", error_message="No Persian text provided.")
            return

        update_episode(db, episode, status="narrating", error_message=None)

        episode_dir = _get_episode_dir(episode_id)
        output_path = os.path.join(episode_dir, "narrated.mp3")

        EdgeTTSNarrator = _get_narrator()
        narrator = EdgeTTSNarrator(voice=episode.voice)
        narrator.narrate(episode.persian_text, output_path)

        rel_path = os.path.relpath(output_path, PROJECT_ROOT)
        duration = _get_audio_duration(output_path)

        updates = {"status": "done", "narrated_audio_path": rel_path}
        if duration is not None:
            updates["duration_seconds"] = duration
        update_episode(db, episode, **updates)

    except Exception as exc:
        tb = traceback.format_exc()
        try:
            update_episode(db, episode, status="error", error_message=f"{exc}\n{tb}")
        except Exception:
            pass
    finally:
        db.close()
