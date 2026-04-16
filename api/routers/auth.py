"""Authentication endpoints — register, login, profile."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import User
from ..schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserProfile,
)
from ..services.auth_service import create_access_token, hash_password, verify_password
from ..services.user_service import create_user, get_user_by_email, update_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user and return a JWT token."""
    existing = get_user_by_email(db, body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = create_user(db, email=body.email, display_name=body.display_name, password=body.password)
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password, return a JWT token."""
    user = get_user_by_email(db, body.email)
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserProfile)
def get_me(user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return UserProfile.model_validate(user)


@router.patch("/me", response_model=UserProfile)
def update_me(
    body: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile."""
    updates = {}
    if body.display_name is not None:
        updates["display_name"] = body.display_name.strip()
    if body.password is not None:
        updates["hashed_password"] = hash_password(body.password)

    if updates:
        user = update_user(db, user, **updates)

    return UserProfile.model_validate(user)
