import logging
import re

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_onboarding_user
from app.auth.jwt_handler import create_access_token, create_purpose_token
from app.auth.passwords import hash_password
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.auth import Token
from app.schemas.onboarding import (
    ClaimAccountRequest,
    OnboardingEmailRequest,
    OnboardingPasswordRequest,
    OnboardingVerifyCodeRequest,
)

logger = logging.getLogger("qwizme.onboarding")

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


def _generate_username(db: Session, first_name: str, last_name: str) -> str:
    base = re.sub(r"[^a-z0-9]", "", f"{first_name}{last_name}".lower())
    if not base:
        base = "user"
    candidate = base
    counter = 1
    while db.query(User).filter(User.username == candidate).first():
        candidate = f"{base}{counter}"
        counter += 1
    return candidate


@router.post("/claim")
@limiter.limit("5/minute")
def claim_account(request: Request, data: ClaimAccountRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        func.lower(User.first_name) == data.first_name.strip().lower(),
        func.lower(User.last_name) == data.last_name.strip().lower(),
        User.onboarding_step == 0,
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="No account found with that name")

    user.onboarding_step = 1
    db.commit()

    onboarding_token = create_purpose_token(user.id, "onboarding", expires_hours=2)
    return {
        "onboarding_token": onboarding_token,
        "first_name": user.first_name,
    }


@router.get("/status")
def onboarding_status(user: User = Depends(get_onboarding_user)):
    return {
        "onboarding_step": user.onboarding_step,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }


@router.post("/email")
@limiter.limit("5/minute")
def set_email(
    request: Request,
    data: OnboardingEmailRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_onboarding_user),
):
    if user.onboarding_step != 1:
        raise HTTPException(status_code=400, detail="Invalid onboarding step")

    # Check email uniqueness
    existing = db.query(User).filter(
        func.lower(User.email) == data.email.lower(),
        User.id != user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    user.email = data.email
    user.onboarding_step = 2
    db.commit()

    # Send verification code
    from app.config import settings
    if settings.RESEND_API_KEY:
        try:
            from app.services.email_service import send_verification_code_email
            from app.services.verification import store_code
            code = store_code(db, user.id, "onboarding-email")
            send_verification_code_email(data.email, code)
        except Exception as e:
            logger.warning("Failed to send verification code to user %d: %s", user.id, e)

    return {"message": "Verification code sent"}


@router.post("/verify-code")
@limiter.limit("10/minute")
def verify_code_endpoint(
    request: Request,
    data: OnboardingVerifyCodeRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_onboarding_user),
):
    if user.onboarding_step != 2:
        raise HTTPException(status_code=400, detail="Invalid onboarding step")

    from app.services.verification import verify_code
    if not verify_code(db, user.id, "onboarding-email", data.code):
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    user.is_verified = True
    user.onboarding_step = 3
    db.commit()

    return {"message": "Email verified"}


@router.post("/resend-code")
@limiter.limit("3/minute")
def resend_code(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_onboarding_user),
):
    if user.onboarding_step != 2:
        raise HTTPException(status_code=400, detail="Invalid onboarding step")

    from app.config import settings
    if settings.RESEND_API_KEY:
        try:
            from app.services.email_service import send_verification_code_email
            from app.services.verification import store_code
            code = store_code(db, user.id, "onboarding-email")
            send_verification_code_email(user.email, code)
        except Exception as e:
            logger.warning("Failed to resend verification code to user %d: %s", user.id, e)

    return {"message": "New verification code sent"}


@router.post("/password", response_model=Token)
@limiter.limit("5/minute")
def set_password(
    request: Request,
    data: OnboardingPasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_onboarding_user),
):
    if user.onboarding_step != 3:
        raise HTTPException(status_code=400, detail="Invalid onboarding step")

    user.password_hash = hash_password(data.password)
    user.username = _generate_username(db, user.first_name or "", user.last_name or "")
    user.onboarding_step = 5
    db.commit()

    access_token = create_access_token({"sub": user.id})
    return Token(access_token=access_token)
