"""Transcription module using OpenAI Whisper (local)."""

import os
import json
import whisper


class WhisperTranscriber:
    """Transcribes audio files to text using local Whisper model."""

    MODELS = ["tiny", "base", "small", "medium", "large"]

    def __init__(self, model_name: str = "base"):
        """
        Initialize with a Whisper model.

        Models (speed vs accuracy tradeoff):
          tiny   - fastest, least accurate (~1GB RAM)
          base   - good balance (~1GB RAM)
          small  - better accuracy (~2GB RAM)
          medium - high accuracy (~5GB RAM)
          large  - best accuracy (~10GB RAM)
        """
        if model_name not in self.MODELS:
            raise ValueError(f"Model must be one of: {self.MODELS}")

        print(f"  Loading Whisper model '{model_name}'...")
        self.model = whisper.load_model(model_name)
        self.model_name = model_name
        print(f"  Model loaded.")

    def transcribe(self, audio_path: str, language: str = "en") -> dict:
        """
        Transcribe an audio file.

        Returns dict with:
          - text: full transcription text
          - segments: list of {start, end, text} segments
          - language: detected language
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        print(f"  Transcribing: {audio_path}")
        print(f"  This may take a while depending on file length...")

        result = self.model.transcribe(
            audio_path,
            language=language,
            verbose=False,
        )

        transcript = {
            "text": result["text"].strip(),
            "segments": [
                {
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"].strip(),
                }
                for seg in result["segments"]
            ],
            "language": result["language"],
        }

        print(f"  Transcription complete. {len(transcript['segments'])} segments found.")
        return transcript

    def transcribe_and_save(self, audio_path: str, output_dir: str = None, language: str = "en") -> str:
        """Transcribe and save the result as a text file. Returns the text file path."""
        transcript = self.transcribe(audio_path, language=language)

        if not output_dir:
            output_dir = os.path.dirname(audio_path)

        base_name = os.path.splitext(os.path.basename(audio_path))[0]
        text_path = os.path.join(output_dir, f"{base_name}_transcript.txt")
        json_path = os.path.join(output_dir, f"{base_name}_transcript.json")

        # Save plain text
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(transcript["text"])

        # Save detailed JSON with segments
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(transcript, f, ensure_ascii=False, indent=2)

        print(f"  Transcript saved to: {text_path}")
        print(f"  Detailed JSON saved to: {json_path}")
        return text_path
