"""File-based translator — works with Claude Code or any manual translation."""

import os
import json
from .base import BaseTranslator


class FileTranslator(BaseTranslator):
    """
    Translator that works through files.

    Workflow:
    1. Reads English text from a file
    2. Saves it in a format ready for translation
    3. You paste it into Claude Code (or any AI) to translate
    4. Save the Persian translation back to a file
    5. Pipeline picks it up and continues

    Later: swap this with APITranslator (Claude API / GPT) for full automation.
    """

    def __init__(self, output_dir: str = "output"):
        self.output_dir = output_dir

    def translate(self, text: str, source_lang: str = "en", target_lang: str = "fa") -> str:
        """Not used directly in file-based mode."""
        raise NotImplementedError(
            "FileTranslator works with files. Use prepare_for_translation() and load_translation() instead."
        )

    def prepare_for_translation(self, transcript_path: str) -> str:
        """
        Read the transcript and create a file ready for translation.
        Returns path to the file that needs to be translated.
        """
        with open(transcript_path, "r", encoding="utf-8") as f:
            english_text = f.read()

        base_name = os.path.splitext(os.path.basename(transcript_path))[0]
        base_name = base_name.replace("_transcript", "")

        # Create a translation prompt file
        prompt_path = os.path.join(self.output_dir, f"{base_name}_to_translate.txt")
        with open(prompt_path, "w", encoding="utf-8") as f:
            f.write("=== TRANSLATION REQUEST ===\n")
            f.write(f"Source: English | Target: Persian (Farsi)\n")
            f.write("Instructions: Translate the following podcast transcript to natural, ")
            f.write("conversational Persian. Keep the tone casual and engaging.\n")
            f.write("=" * 40 + "\n\n")
            f.write(english_text)

        # Create empty file for the translation output
        output_path = os.path.join(self.output_dir, f"{base_name}_persian.txt")
        if not os.path.exists(output_path):
            with open(output_path, "w", encoding="utf-8") as f:
                f.write("")

        print(f"\n  Translation file prepared: {prompt_path}")
        print(f"  Save Persian translation to: {output_path}")
        return prompt_path

    def load_translation(self, episode_name: str) -> str:
        """Load the translated Persian text from file."""
        output_path = os.path.join(self.output_dir, f"{episode_name}_persian.txt")

        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Translation file not found: {output_path}")

        with open(output_path, "r", encoding="utf-8") as f:
            text = f.read().strip()

        if not text:
            raise ValueError(
                f"Translation file is empty: {output_path}\n"
                f"Please translate the content and save it to this file first."
            )

        return text

    def is_translation_ready(self, episode_name: str) -> bool:
        """Check if translation file exists and has content."""
        output_path = os.path.join(self.output_dir, f"{episode_name}_persian.txt")
        if not os.path.exists(output_path):
            return False
        with open(output_path, "r", encoding="utf-8") as f:
            return bool(f.read().strip())
