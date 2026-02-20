from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quizzes.id", ondelete="CASCADE"), index=True)
    question_text: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    correct_answer_index: Mapped[int] = mapped_column()

    quiz: Mapped["Quiz"] = relationship(back_populates="questions")  # noqa: F821
    answers: Mapped[list["Answer"]] = relationship(back_populates="question", cascade="all, delete-orphan")  # noqa: F821
