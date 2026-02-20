import sys
from pathlib import Path

# Add backend directory to Python path so app package is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: E402, F401
