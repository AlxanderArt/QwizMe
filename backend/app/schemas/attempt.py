from datetime import datetime

from pydantic import BaseModel, Field


class AttemptSubmit(BaseModel):
    answers: list[int] = Field(min_length=1, max_length=500)


class AttemptResponse(BaseModel):
    id: int
    quiz_id: int
    quiz_title: str
    score: int
    total_questions: int
    percentage: float
    completed_at: datetime


class StatsResponse(BaseModel):
    total_quizzes_created: int
    total_quizzes_taken: int
    average_score: float
    best_score: float
    recent_attempts: list[AttemptResponse]
