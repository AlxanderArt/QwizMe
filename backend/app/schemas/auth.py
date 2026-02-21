from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: str
    password: str = Field(max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str | None = None
    username: str | None = None
    is_verified: bool
    created_at: datetime
    role: str = "user"
    onboarding_step: int = 5
    first_name: str | None = None
    last_name: str | None = None
    pending_email: str | None = None
    profile_picture_url: str | None = None

    model_config = {"from_attributes": True}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str
