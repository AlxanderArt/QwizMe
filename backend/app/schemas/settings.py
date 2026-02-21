from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserSettingsResponse(BaseModel):
    ai_provider: str | None
    has_api_key: bool
    is_verified: bool

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    ai_provider: Literal["claude", "openai"] | None = None
    ai_api_key: str | None = Field(None, max_length=1000)


class ProfileResponse(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    email: str | None = None
    pending_email: str | None = None
    is_verified: bool
    profile_picture_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    username: str | None = Field(None, min_length=3, max_length=50)


class ChangeEmailRequest(BaseModel):
    email: EmailStr


class ConfirmEmailChangeRequest(BaseModel):
    token: str
