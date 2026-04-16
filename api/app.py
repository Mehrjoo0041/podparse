"""FastAPI application entry point."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import create_tables
from .routers import admin, auth, episodes, library

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA_DIR = os.path.join(PROJECT_ROOT, "media")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables
    create_tables()
    os.makedirs(MEDIA_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="Podcast Translator API",
    description="Translate English podcasts to Persian",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(episodes.router)
app.include_router(library.router)
app.include_router(admin.router)

# Serve media files
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")
