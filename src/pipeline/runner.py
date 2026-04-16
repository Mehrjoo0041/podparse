"""Pipeline runner — orchestrates the full podcast translation workflow."""

import os
import json
from ..downloader import PodcastDownloader
from ..transcriber import WhisperTranscriber
from ..translator import FileTranslator
from ..tts import EdgeTTSNarrator


class PipelineRunner:
    """Runs the full pipeline: Download → Transcribe → Translate → Narrate."""

    def __init__(self, output_dir: str = "output", whisper_model: str = "base", voice: str = "dilara"):
        self.output_dir = os.path.abspath(output_dir)
        os.makedirs(self.output_dir, exist_ok=True)

        self.downloader = PodcastDownloader(output_dir=self.output_dir)
        self.transcriber = None  # Lazy load (heavy model)
        self.translator = FileTranslator(output_dir=self.output_dir)
        self.narrator = EdgeTTSNarrator(voice=voice)

        self.whisper_model = whisper_model

    def _ensure_transcriber(self):
        if self.transcriber is None:
            self.transcriber = WhisperTranscriber(model_name=self.whisper_model)

    def step1_download(self, source: str, episode_index: int = 0) -> str:
        """
        Step 1: Download podcast audio.
        source can be an RSS URL or direct audio/video URL.
        """
        print("\n" + "=" * 50)
        print("STEP 1: DOWNLOAD")
        print("=" * 50)

        if source.endswith(".xml") or "feed" in source or "rss" in source:
            episodes = self.downloader.fetch_episodes_from_rss(source)
            if not episodes:
                raise ValueError("No episodes found in RSS feed.")
            episode = episodes[episode_index]
            print(f"  Episode: {episode['title']}")
            audio_path = self.downloader.download_audio(episode["url"])
        elif any(host in source for host in ["youtube.com", "youtu.be", "spotify.com"]):
            audio_path = self.downloader.download_with_ytdlp(source)
        else:
            audio_path = self.downloader.download_audio(source)

        print(f"  ✓ Audio ready: {audio_path}")
        return audio_path

    def step2_transcribe(self, audio_path: str) -> str:
        """Step 2: Transcribe audio to English text."""
        print("\n" + "=" * 50)
        print("STEP 2: TRANSCRIBE")
        print("=" * 50)

        self._ensure_transcriber()
        text_path = self.transcriber.transcribe_and_save(audio_path, self.output_dir)
        print(f"  ✓ Transcript ready: {text_path}")
        return text_path

    def step3_prepare_translation(self, transcript_path: str) -> str:
        """Step 3: Prepare file for translation."""
        print("\n" + "=" * 50)
        print("STEP 3: PREPARE TRANSLATION")
        print("=" * 50)

        prompt_path = self.translator.prepare_for_translation(transcript_path)

        base_name = os.path.splitext(os.path.basename(transcript_path))[0]
        base_name = base_name.replace("_transcript", "")
        persian_path = os.path.join(self.output_dir, f"{base_name}_persian.txt")

        print(f"\n  ✓ Translation file prepared!")
        print(f"\n  === NEXT STEP (manual) ===")
        print(f"  1. Read the file: {prompt_path}")
        print(f"  2. Translate it to Persian (use Claude Code or any AI)")
        print(f"  3. Save the translation to: {persian_path}")
        print(f"  4. Run: python main.py narrate {persian_path}")
        return prompt_path

    def step4_narrate(self, persian_text_path: str) -> str:
        """Step 4: Convert Persian text to speech."""
        print("\n" + "=" * 50)
        print("STEP 4: NARRATE")
        print("=" * 50)

        output_path = self.narrator.narrate_from_file(persian_text_path)
        print(f"  ✓ Persian audio ready: {output_path}")
        return output_path

    def run_until_translation(self, source: str, episode_index: int = 0) -> dict:
        """Run steps 1-3 (everything before manual translation)."""
        audio_path = self.step1_download(source, episode_index)
        transcript_path = self.step2_transcribe(audio_path)
        prompt_path = self.step3_prepare_translation(transcript_path)

        return {
            "audio_path": audio_path,
            "transcript_path": transcript_path,
            "prompt_path": prompt_path,
        }

    def run_after_translation(self, persian_text_path: str) -> str:
        """Run step 4 (after manual translation is done)."""
        return self.step4_narrate(persian_text_path)

    def get_status(self) -> dict:
        """Check what files exist in the output directory."""
        files = os.listdir(self.output_dir) if os.path.exists(self.output_dir) else []
        return {
            "output_dir": self.output_dir,
            "files": sorted(files),
            "has_audio": any(f.endswith((".mp3", ".wav", ".m4a")) and "narrated" not in f for f in files),
            "has_transcript": any(f.endswith("_transcript.txt") for f in files),
            "has_translation_prompt": any(f.endswith("_to_translate.txt") for f in files),
            "has_persian_text": any(f.endswith("_persian.txt") for f in files),
            "has_narrated_audio": any(f.endswith("_narrated.mp3") for f in files),
        }
