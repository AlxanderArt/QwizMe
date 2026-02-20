import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import type { Quiz, QuizListResponse, StatsResponse } from '../lib/types';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { PlusCircle, ImageUp, Trophy, Target, BookOpen, TrendingUp, AlertTriangle, ChevronDown, Loader2 } from 'lucide-react';

const PAGE_SIZE = 20;

export default function Dashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<QuizListResponse>('/quizzes', { params: { skip: 0, limit: PAGE_SIZE } }),
      api.get('/stats'),
    ])
      .then(([quizRes, statsRes]) => {
        setQuizzes(quizRes.data.quizzes);
        setHasMore(quizRes.data.has_more);
        setStats(statsRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await api.get<QuizListResponse>('/quizzes', {
        params: { skip: quizzes.length, limit: PAGE_SIZE },
      });
      setQuizzes((prev) => [...prev, ...res.data.quizzes]);
      setHasMore(res.data.has_more);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load more quizzes');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this quiz? This cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete quiz');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {user && !user.is_verified && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Your email is not verified. Check your inbox for a verification link.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen} label="Quizzes Created" value={stats.total_quizzes_created} color="indigo" />
          <StatCard icon={Target} label="Quizzes Taken" value={stats.total_quizzes_taken} color="blue" />
          <StatCard icon={TrendingUp} label="Avg Score" value={`${stats.average_score}%`} color="green" />
          <StatCard icon={Trophy} label="Best Score" value={`${stats.best_score}%`} color="yellow" />
        </div>
      )}

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No quizzes yet</h2>
          <p className="text-gray-500 mb-6">Create your first quiz to get started</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/create"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              Create Quiz
            </Link>
            <Link
              to="/upload"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              <ImageUp className="w-4 h-4" />
              AI Generate
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} deleting={deletingId === quiz.id} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-3 min-h-[44px] bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loadingMore ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
