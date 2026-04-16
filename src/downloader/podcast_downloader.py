"""Podcast discovery and download module."""

from __future__ import annotations

import os
import re
import requests
import feedparser
from urllib.parse import urlparse


class PodcastDownloader:
    """Downloads podcast episodes from RSS feeds or direct URLs."""

    def __init__(self, output_dir: str = "output"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def fetch_episodes_from_rss(self, rss_url: str, limit: int = 5) -> list[dict]:
        """Parse an RSS feed and return episode metadata."""
        feed = feedparser.parse(rss_url)
        episodes = []

        for entry in feed.entries[:limit]:
            audio_url = None
            for link in entry.get("links", []):
                if link.get("type", "").startswith("audio/"):
                    audio_url = link["href"]
                    break
            # Fallback: check enclosures
            if not audio_url:
                for enc in entry.get("enclosures", []):
                    if enc.get("type", "").startswith("audio/"):
                        audio_url = enc["href"]
                        break

            if audio_url:
                episodes.append({
                    "title": entry.get("title", "Untitled"),
                    "url": audio_url,
                    "published": entry.get("published", ""),
                    "summary": entry.get("summary", "")[:200],
                })

        return episodes

    def download_audio(self, url: str, filename: str = None) -> str:
        """Download an audio file from a URL. Returns the local file path."""
        if not filename:
            # Extract filename from URL
            parsed = urlparse(url)
            filename = os.path.basename(parsed.path)
            if not filename or "." not in filename:
                filename = "episode.mp3"

        # Sanitize filename
        filename = re.sub(r'[^\w\-.]', '_', filename)
        filepath = os.path.join(self.output_dir, filename)

        if os.path.exists(filepath):
            print(f"  Already downloaded: {filepath}")
            return filepath

        print(f"  Downloading: {url}")
        response = requests.get(url, stream=True, timeout=120)
        response.raise_for_status()

        total = int(response.headers.get("content-length", 0))
        downloaded = 0

        with open(filepath, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total:
                    pct = (downloaded / total) * 100
                    print(f"\r  Progress: {pct:.1f}%", end="", flush=True)

        print(f"\n  Saved to: {filepath}")
        return filepath

    def download_with_ytdlp(self, url: str) -> str:
        """Download audio using yt-dlp (for YouTube, Spotify links, etc.)."""
        import yt_dlp

        output_template = os.path.join(self.output_dir, "%(title)s.%(ext)s")
        opts = {
            "format": "bestaudio/best",
            "outtmpl": output_template,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
            "quiet": True,
        }

        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=True)
            # yt-dlp may change extension after post-processing
            filename = ydl.prepare_filename(info)
            mp3_path = os.path.splitext(filename)[0] + ".mp3"
            return mp3_path

    def list_episodes(self, rss_url: str, limit: int = 10) -> None:
        """Print available episodes from an RSS feed."""
        episodes = self.fetch_episodes_from_rss(rss_url, limit=limit)
        if not episodes:
            print("No episodes found in this feed.")
            return

        print(f"\nFound {len(episodes)} episodes:\n")
        for i, ep in enumerate(episodes, 1):
            print(f"  {i}. {ep['title']}")
            print(f"     Published: {ep['published']}")
            print(f"     URL: {ep['url'][:80]}...")
            print()
