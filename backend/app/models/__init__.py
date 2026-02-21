from app.models.user import User
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.answer import Answer
from app.models.quiz_attempt import QuizAttempt
from app.models.verification_code import VerificationCode

__all_models__ = [User, Quiz, Question, Answer, QuizAttempt, VerificationCode]
__all__ = ["User", "Quiz", "Question", "Answer", "QuizAttempt", "VerificationCode"]
