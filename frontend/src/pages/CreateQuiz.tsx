import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { QuestionCreate } from '../lib/types';
import QuestionForm from '../components/QuestionForm';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Save } from 'lucide-react';

const emptyQuestion = (): QuestionCreate => ({
  question_text: '',
  explanation: undefined,
  answers: [
    { answer_text: '', is_correct: true },
    { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false },
  ],
});

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionCreate[]>([emptyQuestion(), emptyQuestion()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuestionChange = (index: number, question: QuestionCreate) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? question : q)));
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} is empty`);
        return;
      }
      const filledAnswers = q.answers.filter((a) => a.answer_text.trim());
      if (filledAnswers.length < 2) {
        setError(`Question ${i + 1} needs at least 2 answers`);
        return;
      }
      if (!q.answers.some((a) => a.is_correct && a.answer_text.trim())) {
        setError(`Question ${i + 1} needs a correct answer`);
        return;
      }
    }

    setLoading(true);
    try {
      const cleanedQuestions = questions.map((q) => ({
        ...q,
        answers: q.answers.filter((a) => a.answer_text.trim()),
      }));
      await api.post('/quizzes', { title, questions: cleanedQuestions });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Quiz</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} />}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Biology Chapter 5 Review"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {questions.map((q, i) => (
          <QuestionForm
            key={i}
            index={i}
            question={q}
            onChange={handleQuestionChange}
            onRemove={handleRemoveQuestion}
            canRemove={questions.length > 2}
          />
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium justify-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Quiz'}
        </button>
      </form>
    </div>
  );
}
