#!/usr/bin/env python3
"""Management CLI for PodParse admin tasks."""

import sys
import click
from dotenv import load_dotenv
load_dotenv()

from api.database import SessionLocal, create_tables
from api.models import User


@click.group()
def cli():
    """PodParse management commands."""
    pass


@cli.command()
@click.argument("email")
def make_admin(email):
    """Promote a user to admin by email."""
    db = SessionLocal()
    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user:
        print(f"User not found: {email}")
        sys.exit(1)
    user.is_admin = True
    db.commit()
    print(f"'{user.display_name}' ({user.email}) is now an admin.")
    db.close()


@cli.command()
@click.argument("email")
def remove_admin(email):
    """Remove admin role from a user."""
    db = SessionLocal()
    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user:
        print(f"User not found: {email}")
        sys.exit(1)
    user.is_admin = False
    db.commit()
    print(f"'{user.display_name}' ({user.email}) is no longer an admin.")
    db.close()


@cli.command()
def list_users():
    """List all users."""
    db = SessionLocal()
    users = db.query(User).all()
    if not users:
        print("No users found.")
        return
    for u in users:
        role = "ADMIN" if u.is_admin else "user"
        print(f"  [{role}] {u.display_name} — {u.email}")
    db.close()


if __name__ == "__main__":
    cli()
