from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class CreateAccountRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)


class CreateAccountBulkRequest(BaseModel):
    accounts: list[CreateAccountRequest] = Field(max_length=100)


class AdminAccountResponse(BaseModel):
    id: int
    first_name: str | None
    last_name: str | None
    onboarding_step: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PromoteRequest(BaseModel):
    user_id: int
    role: Literal["admin", "user"]
