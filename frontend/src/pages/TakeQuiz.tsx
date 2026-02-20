import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import type { QuizDetail, AttemptResponse } from '../lib/types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';

export default function TakeQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/quizzes/${id}`)
      .then((res) => {
        setQuiz(res.data);
        setSelectedAnswers(new Array(res.data.questions.length).fill(-1));
      })
      .catch((err) => {
        setError(
          err.response?.status === 404
            ? 'Quiz not found'
            : err.response?.data?.detail || 'Failed to load quiz'
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelect = (answerIndex: number) => {
    setSelectedAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = answerIndex;
      return copy;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!quiz) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex((i) => i - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < quiz.questions.length - 1) {
        e.preventDefault();
        setCurrentIndex((i) => i + 1);
      } else {
        const num = parseInt(e.key);
        if (num >= 1 && num <= quiz.questions[currentIndex]?.answers.length) {
          e.preventDefault();
          handleSelect(num - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quiz, currentIndex]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (selectedAnswers.some(a => a !== -1) && !submitted) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [selectedAnswers, submitted]);

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    if (selectedAnswers.includes(-1)) {
      setError('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post<AttemptResponse>(`/quizzes/${id}/submit`, {
        answers: selectedAnswers,
      });
      setSubmitted(true);
      navigate(`/quiz/${id}/results`, { state: { attempt: res.data, quiz } });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('This quiz has been deleted');
      } else {
        setError(err.response?.data?.detail || 'Failed to submit');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading quiz..." />;

  if (error && !quiz) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ErrorMessage message={error} />
        <Link to="/dashboard" className="inline-block mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ErrorMessage message="This quiz has no questions" />
        <Link to="/dashboard" className="inline-block mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const answered = selectedAnswers.filter((a) => a !== -1).length;
  const total = quiz.questions.length;
  const progress = (answered / total) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-1 break-words">{quiz.title}</h1>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>
            Question {currentIndex + 1} of {total}
          </span>
          <span>{answered} answered</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={answered} aria-valuemax={total}>
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 lg:p-6 mb-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6 break-words">{question.question_text}</h2>

        <div className="space-y-2 md:space-y-3">
          {question.answers.map((answer, aIndex) => {
            const selected = selectedAnswers[currentIndex] === aIndex;
            return (
              <button
                key={answer.id}
                onClick={() => handleSelect(aIndex)}
                aria-pressed={selected}
                className={`w-full text-left px-3 py-3 min-h-[44px] rounded-lg border-2 transition-all text-sm cursor-pointer break-words focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + aIndex)}.
                </span>
                {answer.answer_text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          aria-label="Previous question"
          className="flex items-center gap-1 px-3 md:px-4 py-2.5 min-h-[44px] text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Question dots */}
        <div className="flex gap-1 flex-wrap justify-center" role="tablist" aria-label="Question navigation">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Question ${i + 1}${selectedAnswers[i] !== -1 ? ' (answered)' : ''}`}
              aria-selected={i === currentIndex}
              role="tab"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] p-1 cursor-pointer"
            >
              <span className={`block w-6 h-6 rounded-full transition-colors ${
                i === currentIndex
                  ? 'bg-indigo-600 ring-2 ring-indigo-300'
                  : selectedAnswers[i] !== -1
                  ? 'bg-indigo-300'
                  : 'bg-gray-300'
              }`} />
            </button>
          ))}
        </div>

        {currentIndex < total - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            aria-label="Next question"
            className="flex items-center gap-1 px-3 md:px-4 py-2.5 min-h-[44px] text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1 px-3 md:px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
