from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


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
