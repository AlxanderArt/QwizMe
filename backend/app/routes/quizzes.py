from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.answer import Answer
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User
from app.schemas.attempt import AttemptResponse, AttemptSubmit
from app.schemas.quiz import QuizCreate, QuizDetail, QuizListResponse, QuizResponse

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.post("", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def create_quiz(
    data: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quiz = Quiz(
        user_id=current_user.id,
        title=data.title,
        source_type="manual",
    )
    db.add(quiz)
    db.flush()

    for q_data in data.questions:
        correct_index = next(
            (i for i, a in enumerate(q_data.answers) if a.is_correct), 0
        )
        question = Question(
            quiz_id=quiz.id,
            question_text=q_data.question_text,
            explanation=q_data.explanation,
            correct_answer_index=correct_index,
        )
        db.add(question)
        db.flush()

        for answer_data in q_data.answers:
            answer = Answer(
                question_id=question.id,
                answer_text=answer_data.answer_text,
                is_correct=answer_data.is_correct,
            )
            db.add(answer)

    db.commit()
    db.refresh(quiz)

    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        source_type=quiz.source_type,
        question_count=len(data.questions),
        created_at=quiz.created_at,
    )


@router.get("", response_model=QuizListResponse)
def list_quizzes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(func.count(Quiz.id)).filter(Quiz.user_id == current_user.id).scalar() or 0
    quizzes = (
        db.query(Quiz)
        .filter(Quiz.user_id == current_user.id)
        .order_by(Quiz.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return QuizListResponse(
        quizzes=[
            QuizResponse(
                id=q.id,
                title=q.title,
                source_type=q.source_type,
                question_count=len(q.questions),
                created_at=q.created_at,
            )
            for q in quizzes
        ],
        total=total,
        has_more=skip + limit < total,
    )


@router.get("/{quiz_id}", response_model=QuizDetail)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quiz = (
        db.query(Quiz)
        .options(joinedload(Quiz.questions).joinedload(Question.answers))
        .filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()


@router.post("/{quiz_id}/submit", response_model=AttemptResponse)
def submit_quiz(
    quiz_id: int,
    data: AttemptSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quiz = (
        db.query(Quiz)
        .options(joinedload(Quiz.questions).joinedload(Question.answers))
        .filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id)
        .first()
    )
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = sorted(quiz.questions, key=lambda q: q.id)

    if len(data.answers) != len(questions):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(questions)} answers, got {len(data.answers)}",
        )

    score = 0
    for question, selected_index in zip(questions, data.answers):
        answers = sorted(question.answers, key=lambda a: a.id)
        if 0 <= selected_index < len(answers) and answers[selected_index].is_correct:
            score += 1

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score,
        total_questions=len(questions),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return AttemptResponse(
        id=attempt.id,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        score=attempt.score,
        total_questions=attempt.total_questions,
        percentage=round(attempt.score / attempt.total_questions * 100, 1) if attempt.total_questions > 0 else 0,
        completed_at=attempt.completed_at,
    )
