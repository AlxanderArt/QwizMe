import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { AttemptResponse, QuizDetail } from '../lib/types';
import ScoreDisplay from '../components/ScoreDisplay';
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

export default function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { attempt, quiz } = (location.state as { attempt: AttemptResponse; quiz: QuizDetail }) || {};

  useEffect(() => {
    if (!attempt || !quiz) {
      navigate('/dashboard', { replace: true });
    }
  }, [attempt, quiz, navigate]);

  if (!attempt || !quiz) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quiz Results</h1>

      <ScoreDisplay
        score={attempt.score}
        total={attempt.total_questions}
        percentage={attempt.percentage}
      />

      {/* Answer Review */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Answer Review</h2>

        {quiz.questions.map((question, qIndex) => {
          return (
            <div key={question.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-sm font-medium text-gray-400 mt-0.5">Q{qIndex + 1}</span>
                <p className="font-medium text-gray-900 break-words">{question.question_text}</p>
              </div>

              <div className="space-y-2 ml-3 md:ml-7">
                {question.answers.map((answer) => {
                  const isCorrect = answer.is_correct;
                  return (
                    <div
                      key={answer.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        isCorrect
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'text-gray-600'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 shrink-0" />
                      )}
                      {answer.answer_text}
                    </div>
                  );
                })}
              </div>

              {question.explanation && (
                <p className="mt-3 ml-3 md:ml-7 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  {question.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => navigate(`/quiz/${quiz.id}`)}
          className="flex items-center gap-2 flex-1 justify-center py-3 min-h-[44px] bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 flex-1 justify-center py-3 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
