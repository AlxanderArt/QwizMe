from typing import Literal

from pydantic import BaseModel


class UserSettingsResponse(BaseModel):
    ai_provider: str | None
    has_api_key: bool
    is_verified: bool

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    ai_provider: Literal["claude", "openai"] | None = None
    ai_api_key: str | None = None
