import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.jwt_handler import create_access_token, create_purpose_token, decode_purpose_token
from app.auth.passwords import hash_password, verify_password
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    NameLogin,
    ResetPasswordRequest,
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
    VerifyEmailRequest,
)

logger = logging.getLogger("qwizme")

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(func.lower(User.email) == data.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send verification email if Resend is configured
    from app.config import settings
    if settings.RESEND_API_KEY:
        try:
            from app.services.email_service import send_verification_email
            verification_token = create_purpose_token(user.id, "verify-email", expires_hours=72)
            send_verification_email(user.email, verification_token)
        except Exception as e:
            logger.warning("Failed to send verification email to user %d: %s", user.id, e)

    token = create_access_token({"sub": user.id})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id})
    return Token(access_token=token)


@router.post("/login-name", response_model=Token)
@limiter.limit("5/minute")
def login_with_name(request: Request, data: NameLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        func.lower(User.first_name) == data.first_name.strip().lower(),
        func.lower(User.last_name) == data.last_name.strip().lower(),
    ).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid name or password")

    token = create_access_token({"sub": user.id})
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Always return success to not leak whether email exists
    user = db.query(User).filter(func.lower(User.email) == data.email.lower()).first()
    if user:
        from app.config import settings
        if settings.RESEND_API_KEY:
            try:
                from app.services.email_service import send_reset_email
                reset_token = create_purpose_token(user.id, "reset-password", expires_hours=1)
                send_reset_email(user.email, reset_token)
            except Exception as e:
                logger.warning("Failed to send reset email: %s", e)
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_purpose_token(data.token, "reset-password")
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successfully"}


@router.post("/verify-email")
@limiter.limit("5/minute")
def verify_email(request: Request, data: VerifyEmailRequest, db: Session = Depends(get_db)):
    payload = decode_purpose_token(data.token, "verify-email")
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}
