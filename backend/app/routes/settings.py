import logging
import os
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_active_user
from app.config import settings
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.settings import (
    ChangeEmailRequest,
    ProfileResponse,
    ProfileUpdate,
    UserSettingsResponse,
    UserSettingsUpdate,
)

logger = logging.getLogger("qwizme.settings")

router = APIRouter(prefix="/settings", tags=["settings"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]+$")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_PROFILE_PIC_SIZE = 5 * 1024 * 1024  # 5MB


def _profile_picture_url(user: User) -> str | None:
    if not user.profile_picture:
        return None
    # Full URL means Supabase storage
    if user.profile_picture.startswith("http"):
        return user.profile_picture
    # Local file
    return f"/uploads/{user.profile_picture}"


def _build_profile_response(user: User) -> ProfileResponse:
    return ProfileResponse(
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        email=user.email,
        pending_email=user.pending_email,
        is_verified=user.is_verified,
        profile_picture_url=_profile_picture_url(user),
        created_at=user.created_at,
    )


# ─── AI Configuration (existing, unchanged) ───────────────────────────

@router.get("", response_model=UserSettingsResponse)
def get_settings(current_user: User = Depends(get_current_active_user)):
    return UserSettingsResponse(
        ai_provider=current_user.ai_provider,
        has_api_key=bool(current_user.ai_api_key_encrypted),
        is_verified=current_user.is_verified,
    )


@router.put("", response_model=UserSettingsResponse)
@limiter.limit("10/minute")
def update_settings(
    request: Request,
    data: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if data.ai_provider is not None:
        current_user.ai_provider = data.ai_provider if data.ai_provider else None
        if not data.ai_provider:
            current_user.ai_api_key_encrypted = None

    if data.ai_api_key is not None:
        if data.ai_api_key:
            from app.services.encryption import encrypt_value
            current_user.ai_api_key_encrypted = encrypt_value(data.ai_api_key)
        else:
            current_user.ai_api_key_encrypted = None

    db.commit()
    db.refresh(current_user)

    return UserSettingsResponse(
        ai_provider=current_user.ai_provider,
        has_api_key=bool(current_user.ai_api_key_encrypted),
        is_verified=current_user.is_verified,
    )


# ─── Profile ──────────────────────────────────────────────────────────

@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_active_user)):
    return _build_profile_response(current_user)


@router.put("/profile", response_model=ProfileResponse)
@limiter.limit("10/minute")
def update_profile(
    request: Request,
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if data.first_name is not None:
        current_user.first_name = data.first_name.strip()

    if data.last_name is not None:
        current_user.last_name = data.last_name.strip()

    if data.username is not None:
        username = data.username.strip()
        if not USERNAME_RE.match(username):
            raise HTTPException(
                status_code=400,
                detail="Username can only contain letters, numbers, and underscores",
            )
        existing = (
            db.query(User)
            .filter(func.lower(User.username) == username.lower(), User.id != current_user.id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = username

    db.commit()
    db.refresh(current_user)
    return _build_profile_response(current_user)


# ─── Profile Picture ──────────────────────────────────────────────────

def _delete_old_picture(user: User) -> None:
    """Delete previous profile picture from storage."""
    if not user.profile_picture:
        return
    if user.profile_picture.startswith("http"):
        # Extract filename from Supabase URL
        filename = user.profile_picture.rsplit("/", 1)[-1]
        from app.services.storage import delete_from_supabase, PROFILE_BUCKET
        delete_from_supabase(filename, PROFILE_BUCKET)
    else:
        # Local file
        path = os.path.join(UPLOAD_DIR, user.profile_picture)
        if os.path.exists(path):
            os.remove(path)


@router.post("/profile-picture", response_model=ProfileResponse)
@limiter.limit("5/minute")
async def upload_profile_picture(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not file.content_type or file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")

    contents = await file.read()
    if len(contents) > MAX_PROFILE_PIC_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Resize to 400x400 square using Pillow
    from io import BytesIO
    from PIL import Image

    img = Image.open(BytesIO(contents))
    img = img.convert("RGB")

    # Cover crop from center
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((400, 400), Image.LANCZOS)

    # Save as PNG
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    processed = buf.getvalue()
    filename = f"{uuid.uuid4().hex}.png"

    # Delete old picture
    _delete_old_picture(current_user)

    # Store: Supabase in production, local in dev
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        try:
            from app.services.storage import upload_profile_picture as upload_pp
            url = upload_pp(filename, processed, "image/png")
            current_user.profile_picture = url
        except Exception as e:
            logger.error("Supabase profile picture upload failed: %s", e)
            raise HTTPException(status_code=500, detail="Failed to store image")
    else:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(processed)
        current_user.profile_picture = filename

    db.commit()
    db.refresh(current_user)
    return _build_profile_response(current_user)


@router.delete("/profile-picture", response_model=ProfileResponse)
@limiter.limit("5/minute")
def delete_profile_picture(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _delete_old_picture(current_user)
    current_user.profile_picture = None
    db.commit()
    db.refresh(current_user)
    return _build_profile_response(current_user)


# ─── Email Change ─────────────────────────────────────────────────────

@router.post("/change-email")
@limiter.limit("3/minute")
def request_email_change(
    request: Request,
    data: ChangeEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    new_email = data.email.lower()

    if new_email == (current_user.email or "").lower():
        raise HTTPException(status_code=400, detail="This is already your current email")

    existing = db.query(User).filter(func.lower(User.email) == new_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    current_user.pending_email = data.email
    db.commit()

    if settings.RESEND_API_KEY:
        try:
            from app.auth.jwt_handler import create_purpose_token
            from app.services.email_service import send_email_change_verification
            token = create_purpose_token(current_user.id, "change-email", expires_hours=1)
            send_email_change_verification(data.email, token)
        except Exception as e:
            logger.warning("Failed to send email change verification: %s", e)

    return {"message": "Verification email sent to your new address"}


@router.delete("/change-email")
def cancel_email_change(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    current_user.pending_email = None
    db.commit()
    return {"message": "Email change cancelled"}
