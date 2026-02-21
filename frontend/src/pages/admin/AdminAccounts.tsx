import { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Upload, Trash2 } from 'lucide-react';
import ErrorMessage from '../../components/ErrorMessage';
import api from '../../lib/api';
import type { AdminAccount } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';

function statusBadge(step: number) {
  if (step === 0) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Unclaimed</span>;
  if (step >= 5) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Complete</span>;
  return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">In Progress</span>;
}

export default function AdminAccounts() {
  const { user } = useAuth();
  const isFounder = user?.role === 'founder';
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [creating, setCreating] = useState(false);

  // Bulk upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Delete loading
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/admin/accounts');
      setAccounts(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    setError('');
    setCreating(true);
    try {
      await api.post('/admin/accounts', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      setFirstName('');
      setLastName('');
      await fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const accounts = lines
        .map((line) => {
          const parts = line.split(',').map((s) => s.trim());
          if (parts.length >= 2) {
            return { first_name: parts[0], last_name: parts[1] };
          }
          return null;
        })
        .filter((a): a is { first_name: string; last_name: string } => a !== null && a.first_name.length > 0);

      if (accounts.length === 0) {
        setError('No valid entries found. Expected format: first_name,last_name');
        return;
      }

      await api.post('/admin/accounts/bulk', { accounts });
      await fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Bulk upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/accounts/${id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete account');
    } finally {
      setDeletingId(null);
    }
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
      <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>

      {error && <ErrorMessage message={error} />}

      {/* Create Account */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Account</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="First name"
            className="flex-1 px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Last name"
            className="flex-1 px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </form>
      </div>

      {/* Bulk Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Bulk Upload</h2>
        <p className="text-sm text-gray-500 mb-4">Upload a CSV file with <code className="bg-gray-100 px-1 rounded">first_name,last_name</code> per line.</p>
        <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Choose CSV'}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleBulkUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Created Accounts <span className="text-gray-400 font-normal">({accounts.length})</span>
          </h2>
        </div>

        {accounts.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">No accounts created yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between px-4 sm:px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {account.first_name} {account.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(account.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {statusBadge(account.onboarding_step)}
                  {isFounder && (
                    <button
                      onClick={() => handleDelete(account.id)}
                      disabled={deletingId === account.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors cursor-pointer"
                      title="Delete account"
                    >
                      {deletingId === account.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
