from pydantic import BaseModel, Field


class AnswerCreate(BaseModel):
    answer_text: str = Field(min_length=1, max_length=500)
    is_correct: bool


class QuestionCreate(BaseModel):
    question_text: str = Field(min_length=1, max_length=2000)
    explanation: str | None = Field(None, max_length=2000)
    answers: list[AnswerCreate]


class AnswerResponse(BaseModel):
    id: int
    answer_text: str
    is_correct: bool

    model_config = {"from_attributes": True}


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    explanation: str | None
    answers: list[AnswerResponse]

    model_config = {"from_attributes": True}
