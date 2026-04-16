"""Base translator interface."""

from __future__ import annotations

from abc import ABC, abstractmethod


class BaseTranslator(ABC):
    """Abstract base class for translators. Swap implementations easily."""

    @abstractmethod
    def translate(self, text: str, source_lang: str = "en", target_lang: str = "fa") -> str:
        """Translate text from source language to target language."""
        pass

    def translate_segments(self, segments: list[dict], source_lang: str = "en", target_lang: str = "fa") -> list[dict]:
        """Translate a list of segments, preserving timing info."""
        translated = []
        for seg in segments:
            translated_text = self.translate(seg["text"], source_lang, target_lang)
            translated.append({
                **seg,
                "original_text": seg["text"],
                "text": translated_text,
            })
        return translated
