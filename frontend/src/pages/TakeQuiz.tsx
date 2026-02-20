import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { QuizDetail, AttemptResponse } from '../lib/types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function TakeQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/quizzes/${id}`)
      .then((res) => {
        setQuiz(res.data);
        setSelectedAnswers(new Array(res.data.questions.length).fill(-1));
      })
      .catch(() => setError('Quiz not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelect = (answerIndex: number) => {
    setSelectedAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = answerIndex;
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!quiz) return;
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
      navigate(`/quiz/${id}/results`, { state: { attempt: res.data, quiz } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading quiz..." />;
  if (error && !quiz) return <ErrorMessage message={error} />;
  if (!quiz) return null;

  const question = quiz.questions[currentIndex];
  const answered = selectedAnswers.filter((a) => a !== -1).length;
  const total = quiz.questions.length;
  const progress = (answered / total) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{quiz.title}</h1>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>
            Question {currentIndex + 1} of {total}
          </span>
          <span>{answered} answered</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{question.question_text}</h2>

        <div className="space-y-3">
          {question.answers.map((answer, aIndex) => {
            const selected = selectedAnswers[currentIndex] === aIndex;
            return (
              <button
                key={answer.id}
                onClick={() => handleSelect(aIndex)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm cursor-pointer ${
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-1.5">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                i === currentIndex
                  ? 'bg-indigo-600'
                  : selectedAnswers[i] !== -1
                  ? 'bg-indigo-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentIndex < total - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}
