from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User
from app.schemas.attempt import AttemptResponse, StatsResponse

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    total_quizzes = db.query(func.count(Quiz.id)).filter(Quiz.user_id == current_user.id).scalar() or 0

    attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.completed_at.desc())
        .all()
    )

    total_taken = len(attempts)

    if total_taken > 0:
        percentages = [
            (a.score / a.total_questions * 100) if a.total_questions > 0 else 0
            for a in attempts
        ]
        avg_score = round(sum(percentages) / len(percentages), 1)
        best_score = round(max(percentages), 1)
    else:
        avg_score = 0.0
        best_score = 0.0

    recent = (
        db.query(QuizAttempt)
        .options(joinedload(QuizAttempt.quiz))
        .filter(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.completed_at.desc())
        .limit(10)
        .all()
    )
    recent_responses = []
    for a in recent:
        recent_responses.append(
            AttemptResponse(
                id=a.id,
                quiz_id=a.quiz_id,
                quiz_title=a.quiz.title if a.quiz else "Deleted Quiz",
                score=a.score,
                total_questions=a.total_questions,
                percentage=round(a.score / a.total_questions * 100, 1) if a.total_questions > 0 else 0,
                completed_at=a.completed_at,
            )
        )

    return StatsResponse(
        total_quizzes_created=total_quizzes,
        total_quizzes_taken=total_taken,
        average_score=avg_score,
        best_score=best_score,
        recent_attempts=recent_responses,
    )
