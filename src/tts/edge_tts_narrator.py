"""Text-to-Speech module using Microsoft Edge-TTS (free)."""

import os
import asyncio
import edge_tts


class EdgeTTSNarrator:
    """Generates Persian speech from text using Edge-TTS."""

    # Available Persian voices
    PERSIAN_VOICES = {
        "dilara": "fa-IR-DilaraNeural",   # Female
        "farid": "fa-IR-FaridNeural",     # Male
    }

    def __init__(self, voice: str = "dilara", rate: str = "+0%", volume: str = "+0%"):
        """
        Initialize the narrator.

        Args:
            voice: 'dilara' (female) or 'farid' (male)
            rate: Speech rate adjustment (e.g., '-10%' slower, '+10%' faster)
            volume: Volume adjustment
        """
        if voice not in self.PERSIAN_VOICES:
            raise ValueError(f"Voice must be one of: {list(self.PERSIAN_VOICES.keys())}")

        self.voice = self.PERSIAN_VOICES[voice]
        self.voice_name = voice
        self.rate = rate
        self.volume = volume

    async def _generate_audio(self, text: str, output_path: str) -> str:
        """Generate audio file from text (async)."""
        communicate = edge_tts.Communicate(
            text=text,
            voice=self.voice,
            rate=self.rate,
            volume=self.volume,
        )
        await communicate.save(output_path)
        return output_path

    def narrate(self, text: str, output_path: str) -> str:
        """
        Convert Persian text to speech and save as MP3.

        Args:
            text: Persian text to narrate
            output_path: Where to save the audio file

        Returns:
            Path to the generated audio file
        """
        if not text.strip():
            raise ValueError("Text is empty — nothing to narrate.")

        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

        print(f"  Generating Persian audio with voice '{self.voice_name}'...")
        asyncio.run(self._generate_audio(text, output_path))
        print(f"  Audio saved to: {output_path}")
        return output_path

    def narrate_from_file(self, text_path: str, output_dir: str = None) -> str:
        """Read Persian text from file and generate audio."""
        with open(text_path, "r", encoding="utf-8") as f:
            text = f.read().strip()

        if not output_dir:
            output_dir = os.path.dirname(text_path)

        base_name = os.path.splitext(os.path.basename(text_path))[0]
        base_name = base_name.replace("_persian", "")
        output_path = os.path.join(output_dir, f"{base_name}_narrated.mp3")

        return self.narrate(text, output_path)

    @staticmethod
    def list_voices():
        """Print available Persian voices."""
        print("\nAvailable Persian voices:")
        for name, voice_id in EdgeTTSNarrator.PERSIAN_VOICES.items():
            print(f"  {name}: {voice_id}")
