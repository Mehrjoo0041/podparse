"""Pydantic schemas for request/response validation."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------- Auth Requests ----------

class RegisterRequest(BaseModel):
    email: str
    display_name: str
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str


# ---------- Auth Responses ----------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    email: str
    display_name: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)


# ---------- Episode Requests ----------

class SubmitEpisodeRequest(BaseModel):
    url: str
    title: Optional[str] = None
    voice: str = "dilara"
    whisper_model: str = "base"
    category: Optional[str] = None


class TranslationUpdateRequest(BaseModel):
    persian_text: str


# ---------- Episode Responses ----------

class EpisodeBase(BaseModel):
    id: int
    title: str
    source_url: str
    source_type: str
    status: str
    podcast_name: Optional[str] = None
    published_date: Optional[str] = None
    summary: Optional[str] = None
    duration_seconds: Optional[float] = None
    voice: str
    whisper_model: str
    category: Optional[str] = None
    cover_color: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EpisodeListItem(EpisodeBase):
    """Used in list endpoints — excludes large text fields."""
    is_saved: Optional[bool] = None
    is_liked: Optional[bool] = None


class EpisodeDetail(EpisodeBase):
    """Full episode detail including text content."""
    error_message: Optional[str] = None
    original_audio_path: Optional[str] = None
    transcript_text: Optional[str] = None
    persian_text: Optional[str] = None
    narrated_audio_path: Optional[str] = None
    is_saved: Optional[bool] = None
    is_liked: Optional[bool] = None


class PaginatedEpisodes(BaseModel):
    items: List[EpisodeListItem]
    total: int
    page: int
    per_page: int
    pages: int
