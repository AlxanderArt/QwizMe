import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Search, Loader2 } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import api from '../lib/api';

export default function ClaimAccount() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/onboarding/claim', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      sessionStorage.setItem('onboarding_token', res.data.onboarding_token);
      navigate('/claim-account/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No account found with that name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BrainCircuit className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Qwiz Me</h1>
          </div>
          <p className="text-gray-500">Claim your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          <div>
            <label htmlFor="claim-first" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input
              id="claim-first"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
              className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="First name"
            />
          </div>

          <div>
            <label htmlFor="claim-last" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
            <input
              id="claim-last"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
              className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Last name"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Searching...' : 'Find My Account'}
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
