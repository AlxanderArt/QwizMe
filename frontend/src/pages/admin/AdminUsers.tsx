import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ErrorMessage from '../../components/ErrorMessage';
import api from '../../lib/api';
import type { User } from '../../lib/types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setError('');
    try {
      await api.post('/admin/promote', { user_id: userId, role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const roleBadge = (role: string) => {
    if (role === 'founder') return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Founder</span>;
    if (role === 'admin') return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">Admin</span>;
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">User</span>;
  };

  const statusLabel = (step: number) => {
    if (step === 0) return 'Unclaimed';
    if (step >= 5) return 'Active';
    return 'Onboarding';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Users</h1>

      {error && <ErrorMessage message={error} />}

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {u.first_name || u.username || '—'} {u.last_name || ''}
              </p>
              {roleBadge(u.role)}
            </div>
            <p className="text-xs text-gray-500 truncate">{u.email || '—'}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{statusLabel(u.onboarding_step)}</span>
              {u.role !== 'founder' && u.onboarding_step >= 5 && (
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="px-2 py-1.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Role</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-3 text-gray-900 font-medium truncate max-w-[200px]">
                    {u.first_name || u.username || '—'} {u.last_name || ''}
                  </td>
                  <td className="px-6 py-3 text-gray-500 truncate max-w-[200px]">{u.email || '—'}</td>
                  <td className="px-6 py-3">{roleBadge(u.role)}</td>
                  <td className="px-6 py-3 text-gray-500">{statusLabel(u.onboarding_step)}</td>
                  <td className="px-6 py-3">
                    {u.role !== 'founder' && u.onboarding_step >= 5 && (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
