import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { UserSettings } from '../lib/types';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { Settings as SettingsIcon, Save, Loader2, CheckCircle2, Key } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        setSettings(res.data);
        setProvider(res.data.ai_provider || '');
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const body: Record<string, string | null> = {
        ai_provider: provider || null,
      };
      if (apiKey) body.ai_api_key = apiKey;
      if (!provider) body.ai_api_key = null;

      const res = await api.put('/settings', body);
      setSettings(res.data);
      setProvider(res.data.ai_provider || '');
      setApiKey('');
      setSuccess('Settings saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading settings..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Configuration</h2>
            <p className="text-sm text-gray-500">Connect your own API key to generate real AI quizzes</p>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div>
          <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-700 mb-1">
            AI Provider
          </label>
          <select
            id="ai-provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">None (Mock AI)</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">OpenAI (GPT-4o)</option>
          </select>
        </div>

        {provider && (
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={settings?.has_api_key ? 'Key saved — enter new key to update' : 'Enter your API key'}
                className="w-full pl-10 pr-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Your key is encrypted and stored securely</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
