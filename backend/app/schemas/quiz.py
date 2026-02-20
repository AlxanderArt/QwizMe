from datetime import datetime

from pydantic import BaseModel

from app.schemas.question import AnswerResponse, QuestionCreate, QuestionResponse


class QuizCreate(BaseModel):
    title: str
    questions: list[QuestionCreate]


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
