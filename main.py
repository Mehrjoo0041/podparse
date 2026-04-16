#!/usr/bin/env python3
"""Podcast Translator CLI — Translate English podcasts to Persian."""

import sys
import os
import click

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.pipeline import PipelineRunner
from src.downloader import PodcastDownloader
from src.tts import EdgeTTSNarrator


@click.group()
def cli():
    """Podcast Translator — Convert English podcasts to Persian audio."""
    pass


@cli.command()
@click.argument("source")
@click.option("--episode", "-e", default=0, help="Episode index from RSS feed (0 = latest)")
@click.option("--model", "-m", default="base", help="Whisper model: tiny, base, small, medium, large")
@click.option("--output", "-o", default="output", help="Output directory")
@click.option("--voice", "-v", default="dilara", help="Persian voice: dilara (female) or farid (male)")
def process(source, episode, model, output, voice):
    """Process a podcast: download, transcribe, and prepare for translation.

    SOURCE can be an RSS feed URL, direct audio URL, or YouTube URL.

    Examples:
        python main.py process "https://example.com/podcast/feed.xml"
        python main.py process "https://example.com/episode.mp3"
        python main.py process "https://youtube.com/watch?v=..."
    """
    runner = PipelineRunner(output_dir=output, whisper_model=model, voice=voice)
    result = runner.run_until_translation(source, episode_index=episode)

    print("\n" + "=" * 50)
    print("DONE! Next steps:")
    print("=" * 50)
    print(f"1. Translate the content in: {result['prompt_path']}")
    print(f"2. Save Persian translation to the _persian.txt file")
    print(f"3. Run: python main.py narrate <persian_file_path>")


@cli.command()
@click.argument("persian_text_path")
@click.option("--voice", "-v", default="dilara", help="Persian voice: dilara (female) or farid (male)")
@click.option("--rate", "-r", default="+0%", help="Speech rate (e.g., '-10%%' slower, '+10%%' faster)")
def narrate(persian_text_path, voice, rate):
    """Generate Persian audio from a translated text file.

    Example:
        python main.py narrate output/episode_persian.txt
    """
    narrator = EdgeTTSNarrator(voice=voice, rate=rate)
    output_path = narrator.narrate_from_file(persian_text_path)
    print(f"\n✓ Persian podcast ready: {output_path}")


@cli.command()
@click.argument("rss_url")
@click.option("--limit", "-l", default=10, help="Number of episodes to show")
def list_episodes(rss_url, limit):
    """List available episodes from a podcast RSS feed.

    Example:
        python main.py list-episodes "https://example.com/podcast/feed.xml"
    """
    downloader = PodcastDownloader()
    downloader.list_episodes(rss_url, limit=limit)


@cli.command()
@click.option("--output", "-o", default="output", help="Output directory")
def status(output):
    """Check the current pipeline status."""
    runner = PipelineRunner(output_dir=output)
    st = runner.get_status()

    print(f"\nOutput directory: {st['output_dir']}")
    print(f"\nFiles:")
    for f in st["files"]:
        print(f"  - {f}")

    print(f"\nPipeline status:")
    steps = [
        ("Audio downloaded", st["has_audio"]),
        ("Transcript ready", st["has_transcript"]),
        ("Translation prepared", st["has_translation_prompt"]),
        ("Persian text ready", st["has_persian_text"]),
        ("Narrated audio ready", st["has_narrated_audio"]),
    ]
    for name, done in steps:
        icon = "✓" if done else "○"
        print(f"  {icon} {name}")


@cli.command()
def voices():
    """List available Persian TTS voices."""
    EdgeTTSNarrator.list_voices()


if __name__ == "__main__":
    cli()
