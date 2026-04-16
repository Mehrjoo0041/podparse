"""LLM service — content processing with Groq (Llama 3.3 70B)."""

from __future__ import annotations

import os
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
MODEL = "llama-3.3-70b-versatile"


def _get_client():
    from groq import Groq
    return Groq(api_key=GROQ_API_KEY)


def is_llm_configured() -> bool:
    return bool(GROQ_API_KEY)


def process_content(transcript: str, source_title: str = "") -> dict:
    """Process a transcript through the full content pipeline.

    Returns a dict with:
      - persian_content: The full rewritten Persian article
      - summary: Short Persian summary
      - key_points: List of key points in Persian
    """
    client = _get_client()

    prompt = f"""تو یک تحلیلگر و نویسنده محتوای حرفه‌ای فارسی هستی.
متن زیر رونوشت یک پادکست/مقاله انگلیسی است با عنوان "{source_title}".

وظیفه تو:
1. متن را به طور کامل بخوان و درک کن
2. یک مقاله جامع و جذاب فارسی بنویس که شامل بخش‌های زیر باشه:

## ساختار مقاله:

### خلاصه
یک خلاصه ۳-۴ جمله‌ای از کل محتوا

### نکات کلیدی
- مهم‌ترین نکات رو به صورت لیست بنویس (حداقل ۵ نکته)

### تحلیل محتوا
محتوا رو تحلیل کن. چرا این موضوع مهمه؟ چه درس‌هایی می‌تونیم ازش بگیریم؟

### توضیح مفاهیم
اصطلاحات و مفاهیم تخصصی رو به زبان ساده توضیح بده تا همه بفهمن

### دیدگاه و نتیجه‌گیری
یه جمع‌بندی بنویس با دیدگاه تحلیلی. چه کاربردی برای مخاطب فارسی‌زبان داره؟

## قوانین نوشتن:
- فارسی روان و محاوره‌ای بنویس، نه رسمی و خشک
- لحن صمیمی و جذاب داشته باش، مثل اینکه داری برای یک دوست توضیح میدی
- از اصطلاحات فارسی روزمره استفاده کن
- مفاهیم پیچیده رو ساده کن
- اسامی خاص و اصطلاحات تخصصی رو هم فارسی بنویس هم انگلیسیشو توی پرانتز بذار
- کل متن باید حداقل ۱۰۰۰ کلمه باشه

---
متن اصلی:
{transcript}
"""

    # Split into chunks if transcript is very long (Groq has token limits)
    # For now, truncate to ~12000 chars to stay within limits
    if len(prompt) > 15000:
        # Keep the prompt structure but truncate the transcript
        max_transcript_len = 12000
        truncated = transcript[:max_transcript_len] + "\n\n[... ادامه متن حذف شد ...]"
        prompt = prompt.replace(transcript, truncated)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "تو یک نویسنده و تحلیلگر محتوای حرفه‌ای فارسی هستی. مقالات جذاب، روان و تحلیلی به فارسی می‌نویسی."
            },
            {"role": "user", "content": prompt}
        ],
        max_tokens=4000,
        temperature=0.7,
    )

    full_content = response.choices[0].message.content

    # Also generate a short summary separately
    summary_response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "یک خلاصه‌نویس حرفه‌ای فارسی هستی."
            },
            {
                "role": "user",
                "content": f"این متن رو در ۲-۳ جمله کوتاه فارسی خلاصه کن:\n\n{transcript[:3000]}"
            }
        ],
        max_tokens=200,
        temperature=0.5,
    )

    summary = summary_response.choices[0].message.content

    return {
        "persian_content": full_content,
        "summary": summary,
    }


def translate_only(text: str) -> str:
    """Simple translation without analysis — for quick use."""
    client = _get_client()

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "تو یک مترجم حرفه‌ای انگلیسی به فارسی هستی. متن رو به فارسی روان و طبیعی ترجمه کن."
            },
            {
                "role": "user",
                "content": f"این متن رو به فارسی روان ترجمه کن:\n\n{text[:8000]}"
            }
        ],
        max_tokens=4000,
        temperature=0.3,
    )

    return response.choices[0].message.content
