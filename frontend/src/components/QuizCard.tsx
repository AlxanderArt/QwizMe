import { useNavigate } from 'react-router-dom';
import type { Quiz } from '../lib/types';
import { Play, Trash2, BrainCircuit, PenLine, Loader2 } from 'lucide-react';

interface Props {
  quiz: Quiz;
  onDelete: (id: number) => void;
  deleting?: boolean;
}

export default function QuizCard({ quiz, onDelete, deleting }: Props) {
  const navigate = useNavigate();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 md:p-5 hover:shadow-md transition-shadow ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {quiz.source_type === 'ai_generated' ? (
            <BrainCircuit className="w-4 h-4 text-purple-500" />
          ) : (
            <PenLine className="w-4 h-4 text-indigo-500" />
          )}
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {quiz.source_type === 'ai_generated' ? 'AI Generated' : 'Manual'}
          </span>
        </div>
        <button
          onClick={() => onDelete(quiz.id)}
          disabled={deleting}
          className="p-2 -m-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
          aria-label={`Delete ${quiz.title}`}
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{quiz.title}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {quiz.question_count} question{quiz.question_count !== 1 ? 's' : ''}
      </p>

      <button
        onClick={() => navigate(`/quiz/${quiz.id}`)}
        aria-label={`Take quiz: ${quiz.title}`}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
      >
        <Play className="w-4 h-4" />
        Take Quiz
      </button>
    </div>
  );
}
