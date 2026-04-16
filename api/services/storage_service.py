"""Cloud storage service — Cloudflare R2 (S3-compatible)."""

from __future__ import annotations

import os
from typing import Optional

import boto3
from botocore.config import Config

# R2 config from environment
R2_ENDPOINT = os.environ.get("R2_ENDPOINT", "")
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY", "")
R2_SECRET_KEY = os.environ.get("R2_SECRET_KEY", "")
R2_BUCKET = os.environ.get("R2_BUCKET", "podparse-media")
R2_PUBLIC_URL = os.environ.get("R2_PUBLIC_URL", "")  # Public URL for the bucket


def _get_client():
    """Get an S3 client configured for Cloudflare R2."""
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def is_r2_configured() -> bool:
    """Check if R2 credentials are set."""
    return bool(R2_ENDPOINT and R2_ACCESS_KEY and R2_SECRET_KEY)


def upload_file(local_path: str, r2_key: str, content_type: str = "audio/mpeg") -> str:
    """Upload a file to R2 and return the public URL.

    Args:
        local_path: Path to the local file
        r2_key: Key (path) in the R2 bucket, e.g. "episodes/1/narrated.mp3"
        content_type: MIME type of the file

    Returns:
        Public URL of the uploaded file
    """
    client = _get_client()
    client.upload_file(
        local_path,
        R2_BUCKET,
        r2_key,
        ExtraArgs={"ContentType": content_type},
    )
    return get_public_url(r2_key)


def get_public_url(r2_key: str) -> str:
    """Get the public URL for a file in R2."""
    if R2_PUBLIC_URL:
        return f"{R2_PUBLIC_URL.rstrip('/')}/{r2_key}"
    return f"{R2_ENDPOINT}/{R2_BUCKET}/{r2_key}"


def delete_file(r2_key: str) -> None:
    """Delete a file from R2."""
    client = _get_client()
    client.delete_object(Bucket=R2_BUCKET, Key=r2_key)
