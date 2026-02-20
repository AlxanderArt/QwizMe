from pydantic import BaseModel


class AnswerCreate(BaseModel):
    answer_text: str
    is_correct: bool


class QuestionCreate(BaseModel):
    question_text: str
    explanation: str | None = None
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
