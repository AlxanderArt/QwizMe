import type { QuestionCreate } from '../lib/types';
import { Trash2, Plus } from 'lucide-react';

interface Props {
  index: number;
  question: QuestionCreate;
  onChange: (index: number, question: QuestionCreate) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function QuestionForm({ index, question, onChange, onRemove, canRemove }: Props) {
  const updateAnswer = (answerIndex: number, text: string) => {
    const newAnswers = question.answers.map((a, i) =>
      i === answerIndex ? { ...a, answer_text: text } : a
    );
    onChange(index, { ...question, answers: newAnswers });
  };

  const setCorrect = (answerIndex: number) => {
    const newAnswers = question.answers.map((a, i) => ({
      ...a,
      is_correct: i === answerIndex,
    }));
    onChange(index, { ...question, answers: newAnswers });
  };

  const addAnswer = () => {
    if (question.answers.length >= 6) return;
    onChange(index, {
      ...question,
      answers: [...question.answers, { answer_text: '', is_correct: false }],
    });
  };

  const removeAnswer = (answerIndex: number) => {
    if (question.answers.length <= 2) return;
    const newAnswers = question.answers.filter((_, i) => i !== answerIndex);
    const hasCorrect = newAnswers.some((a) => a.is_correct);
    if (!hasCorrect && newAnswers.length > 0) {
      newAnswers[0].is_correct = true;
    }
    onChange(index, { ...question, answers: newAnswers });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        type="text"
        value={question.question_text}
        onChange={(e) => onChange(index, { ...question, question_text: e.target.value })}
        placeholder="Enter your question..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
      />

      <input
        type="text"
        value={question.explanation || ''}
        onChange={(e) => onChange(index, { ...question, explanation: e.target.value || undefined })}
        placeholder="Explanation (optional)"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4 bg-gray-50"
      />

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500">Click the radio to mark the correct answer</p>
        {question.answers.map((answer, aIndex) => (
          <div key={aIndex} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrect(aIndex)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer ${
                answer.is_correct
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {answer.is_correct && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </button>
            <input
              type="text"
              value={answer.answer_text}
              onChange={(e) => updateAnswer(aIndex, e.target.value)}
              placeholder={`Answer ${aIndex + 1}`}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {question.answers.length > 2 && (
              <button
                type="button"
                onClick={() => removeAnswer(aIndex)}
                className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {question.answers.length < 6 && (
        <button
          type="button"
          onClick={addAnswer}
          className="flex items-center gap-1 mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add answer
        </button>
      )}
    </div>
  );
}
