import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.config import settings
from app.database import get_db
from app.models.answer import Answer
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.user import User
from app.schemas.quiz import QuizResponse
from app.services.mock_ai import generate_quiz_from_image

router = APIRouter(prefix="/quizzes", tags=["ai-generate"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


@router.post("/generate-from-image", response_model=QuizResponse)
async def generate_from_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    ext = os.path.splitext(file.filename or "image.png")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(filepath, "wb") as f:
        f.write(contents)

    quiz_data = generate_quiz_from_image(filename)

    quiz = Quiz(
        user_id=current_user.id,
        title=quiz_data["title"],
        source_type="ai_generated",
        image_filename=filename,
    )
    db.add(quiz)
    db.flush()

    for q_data in quiz_data["questions"]:
        question = Question(
            quiz_id=quiz.id,
            question_text=q_data["question_text"],
            explanation=q_data["explanation"],
            correct_answer_index=q_data["correct_answer_index"],
        )
        db.add(question)
        db.flush()

        for a_data in q_data["answers"]:
            answer = Answer(
                question_id=question.id,
                answer_text=a_data["text"],
                is_correct=a_data["is_correct"],
            )
            db.add(answer)

    db.commit()
    db.refresh(quiz)

    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        source_type=quiz.source_type,
        question_count=len(quiz_data["questions"]),
        created_at=quiz.created_at,
    )
