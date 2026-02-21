from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.question import AnswerResponse, QuestionCreate, QuestionResponse


class QuizCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    questions: list[QuestionCreate] = Field(min_length=1, max_length=50)


class QuizResponse(BaseModel):
    id: int
    title: str
    source_type: str
    question_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class QuizDetail(BaseModel):
    id: int
    title: str
    source_type: str
    image_filename: str | None
    created_at: datetime
    questions: list[QuestionResponse]

    model_config = {"from_attributes": True}


class QuizListResponse(BaseModel):
    quizzes: list[QuizResponse]
    total: int
    has_more: bool
