import logging
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.config import settings
from app.database import get_db
from app.limiter import limiter
from app.models.answer import Answer
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.user import User
from app.schemas.quiz import QuizResponse
from app.services.mock_ai import generate_quiz_from_image

logger = logging.getLogger("qwizme.ai")

router = APIRouter(prefix="/quizzes", tags=["ai-generate"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


@router.post("/generate-from-image", response_model=QuizResponse)
@limiter.limit("10/hour")
async def generate_from_image(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    media_type = file.content_type or "image/png"
    ext = os.path.splitext(file.filename or "image.png")[1]
    filename = f"{uuid.uuid4().hex}{ext}"

    # Store image: Supabase in production, local in dev
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        try:
            from app.services.storage import upload_to_supabase
            image_ref = upload_to_supabase(filename, contents, media_type)
        except Exception as e:
            logger.error("Supabase upload failed: %s", e)
            raise HTTPException(status_code=500, detail="Failed to store image")
    else:
        filepath = os.path.join(UPLOAD_DIR, filename)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(contents)
        image_ref = filename

    # Generate quiz: real AI if user has key configured, else mock
    if current_user.ai_provider and current_user.ai_api_key_encrypted:
        try:
            from app.services.encryption import decrypt_value
            from app.services.ai_service import generate_quiz
            api_key = decrypt_value(current_user.ai_api_key_encrypted)
            quiz_data = generate_quiz(contents, media_type, current_user.ai_provider, api_key)
        except ValueError as e:
            raise HTTPException(status_code=400, detail="AI configuration error — check your API key in Settings")
        except Exception as e:
            logger.error("AI generation failed: %s", e)
            raise HTTPException(status_code=502, detail="AI service error — check your API key and try again")
    else:
        quiz_data = generate_quiz_from_image(filename)

    quiz = Quiz(
        user_id=current_user.id,
        title=quiz_data["title"],
        source_type="ai_generated",
        image_filename=image_ref,
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
