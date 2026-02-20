import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { StatsResponse } from '../lib/types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Trophy, Target, TrendingUp, BookOpen, Calendar } from 'lucide-react';

export default function Stats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/stats')
      .then((res) => setStats(res.data))
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load stats');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading stats..." />;

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Stats</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Stats</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_quizzes_created}</p>
          <p className="text-xs text-gray-500">Quizzes Created</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_quizzes_taken}</p>
          <p className="text-xs text-gray-500">Quizzes Taken</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.average_score}%</p>
          <p className="text-xs text-gray-500">Average Score</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-3">
            <Trophy className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.best_score}%</p>
          <p className="text-xs text-gray-500">Best Score</p>
        </div>
      </div>

      {/* Score Distribution (CSS bar chart) */}
      {stats.recent_attempts.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h2>
          <div className="flex items-end gap-1 md:gap-2 h-36 md:h-40 overflow-x-auto">
            {stats.recent_attempts
              .slice()
              .reverse()
              .map((attempt) => (
                <div key={attempt.id} className="flex-1 min-w-[40px] flex flex-col items-center gap-1">
                  <span className="text-[10px] md:text-xs font-medium text-gray-600">{Math.round(attempt.percentage)}%</span>
                  <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '100px' }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${
                        attempt.percentage >= 80
                          ? 'bg-green-400'
                          : attempt.percentage >= 60
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                      }`}
                      style={{ height: `${attempt.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 text-center">
          <TrendingUp className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Take some quizzes to see your performance chart</p>
        </div>
      )}

      {/* Recent Attempts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 md:px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Attempts</h2>
        </div>

        {stats.recent_attempts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p>No attempts yet. Take a quiz to see your progress!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recent_attempts.map((attempt) => (
              <div key={attempt.id} className="px-4 md:px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 md:truncate">{attempt.quiz_title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500">
                      {new Date(attempt.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {attempt.score}/{attempt.total_questions}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      attempt.percentage >= 80
                        ? 'text-green-600'
                        : attempt.percentage >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {Math.round(attempt.percentage)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
