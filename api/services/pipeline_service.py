"""Pipeline service — wraps existing src/ modules for the API layer."""

from __future__ import annotations

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
    """Run the full pipeline: download -> transcribe -> LLM process -> narrate.

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

        # ---- STEP 1: DOWNLOAD ----
        update_episode(db, episode, status="downloading", error_message=None)
        url = episode.source_url

        if _is_rss_url(url):
            episodes_list = downloader.fetch_episodes_from_rss(url)
            if not episodes_list:
                update_episode(db, episode, status="error", error_message="No episodes found in RSS feed.")
                return
            rss_ep = episodes_list[0]
            updates = {}
            if not episode.title or episode.title == url:
                updates["title"] = rss_ep["title"]
            if rss_ep.get("published"):
                updates["published_date"] = rss_ep["published"]
            if rss_ep.get("summary"):
                updates["summary"] = rss_ep["summary"]
            if updates:
                if "title" in updates:
                    from ..models import generate_cover_color
                    updates["cover_color"] = generate_cover_color(updates["title"])
                update_episode(db, episode, **updates)
            audio_path = downloader.download_audio(rss_ep["url"])
        elif _is_ytdlp_url(url):
            audio_path = downloader.download_with_ytdlp(url)
        else:
            audio_path = downloader.download_audio(url)

        duration = _get_audio_duration(audio_path)
        rel_audio = os.path.relpath(audio_path, PROJECT_ROOT)
        update_episode(
            db, episode,
            status="transcribing",
            original_audio_path=rel_audio,
            duration_seconds=duration,
        )

        # ---- STEP 2: TRANSCRIBE ----
        WhisperTranscriber = _get_transcriber()
        transcriber = WhisperTranscriber(model_name=episode.whisper_model)
        transcript = transcriber.transcribe(audio_path)
        transcript_text = transcript["text"]

        update_episode(
            db, episode,
            status="processing",
            transcript_text=transcript_text,
        )

        # ---- STEP 3: LLM CONTENT PROCESSING ----
        from .llm_service import is_llm_configured, process_content

        if is_llm_configured():
            result = process_content(
                transcript=transcript_text,
                source_title=episode.title or "",
            )
            persian_text = result["persian_content"]
            summary = result.get("summary", "")

            update_episode(
                db, episode,
                status="narrating",
                persian_text=persian_text,
                summary=summary if summary else episode.summary,
            )

            # ---- STEP 4: NARRATE ----
            _run_narration(db, episode, episode_id)

        else:
            # No LLM configured — fall back to awaiting manual translation
            update_episode(db, episode, status="awaiting_translation")

    except Exception as exc:
        tb = traceback.format_exc()
        try:
            update_episode(db, episode, status="error", error_message=f"{exc}\n{tb}")
        except Exception:
            pass
    finally:
        db.close()


def _run_narration(db: Session, episode: Episode, episode_id: int) -> None:
    """Run TTS narration step."""
    episode_dir = _get_episode_dir(episode_id)
    output_path = os.path.join(episode_dir, "narrated.mp3")

    EdgeTTSNarrator = _get_narrator()
    narrator = EdgeTTSNarrator(voice=episode.voice)
    narrator.narrate(episode.persian_text, output_path)

    duration = _get_audio_duration(output_path)

    from .storage_service import is_r2_configured, upload_file
    if is_r2_configured():
        r2_key = f"episodes/{episode_id}/narrated.mp3"
        audio_url = upload_file(output_path, r2_key)
        try:
            os.remove(output_path)
        except OSError:
            pass
    else:
        audio_url = os.path.relpath(output_path, PROJECT_ROOT)

    updates = {"status": "done", "narrated_audio_path": audio_url}
    if duration is not None:
        updates["duration_seconds"] = duration
    update_episode(db, episode, **updates)


def narrate_episode(episode_id: int) -> None:
    """Run TTS narration in a background thread (for manual translation flow).

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
        _run_narration(db, episode, episode_id)

    except Exception as exc:
        tb = traceback.format_exc()
        try:
            update_episode(db, episode, status="error", error_message=f"{exc}\n{tb}")
        except Exception:
            pass
    finally:
        db.close()
