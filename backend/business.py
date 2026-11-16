"""Extension point for this application's business API and write validation.

Keep router paths relative; app.py mounts these under /api/business behind
installation authentication. Do not import PB services or contact external APIs.
"""

from fastapi import APIRouter

router = APIRouter()


def validate_data(value: dict) -> dict:
    """Validate this app's domain constraints; raise ValueError for invalid data."""
    return value
