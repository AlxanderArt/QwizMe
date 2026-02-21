from pydantic import BaseModel, EmailStr, Field


class ClaimAccountRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)


class OnboardingEmailRequest(BaseModel):
    email: EmailStr


class OnboardingVerifyCodeRequest(BaseModel):
    code: str = Field(pattern=r"^\d{6}$")


class OnboardingPasswordRequest(BaseModel):
    password: str = Field(min_length=6)
