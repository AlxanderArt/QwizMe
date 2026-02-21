import { useEffect, useState, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { UserSettings, ProfileData } from '../lib/types';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  CheckCircle2,
  Key,
  User,
  Camera,
  Mail,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function Settings() {
  // AI Config state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [aiSaving, setAiSaving] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState('');

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);

  // Email change state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      api.get('/settings'),
      api.get('/settings/profile'),
    ])
      .then(([settingsRes, profileRes]) => {
        setSettings(settingsRes.data);
        setProvider(settingsRes.data.ai_provider || '');
        setProfile(profileRes.data);
        setFirstName(profileRes.data.first_name || '');
        setLastName(profileRes.data.last_name || '');
        setUsername(profileRes.data.username || '');
      })
      .catch(() => toast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  // ── Profile Save ──────────────────────────────────────────────────

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileSaving) return;
    setProfileError('');
    setProfileSaving(true);
    try {
      const body: Record<string, string> = {};
      if (firstName !== (profile?.first_name || '')) body.first_name = firstName;
      if (lastName !== (profile?.last_name || '')) body.last_name = lastName;
      if (username !== (profile?.username || '')) body.username = username;

      if (Object.keys(body).length === 0) {
        setProfileSaving(false);
        return;
      }

      const res = await api.put('/settings/profile', body);
      setProfile(res.data);
      await refreshUser();
      toast('Profile updated');
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Profile Picture ───────────────────────────────────────────────

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('File too large (max 5MB)', 'error');
      return;
    }

    setUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/settings/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      await refreshUser();
      toast('Profile picture updated');
    } catch (err: any) {
      toast(err.response?.data?.detail || 'Failed to upload picture', 'error');
    } finally {
      setUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Email Change ──────────────────────────────────────────────────

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSaving) return;
    setEmailError('');
    setEmailSaving(true);
    try {
      await api.post('/settings/change-email', { email: newEmail });
      // Refresh profile to show pending_email
      const res = await api.get('/settings/profile');
      setProfile(res.data);
      setShowEmailForm(false);
      setNewEmail('');
      toast('Verification email sent');
    } catch (err: any) {
      setEmailError(err.response?.data?.detail || 'Failed to send verification');
    } finally {
      setEmailSaving(false);
    }
  };

  const handleCancelEmailChange = async () => {
    try {
      await api.delete('/settings/change-email');
      const res = await api.get('/settings/profile');
      setProfile(res.data);
      await refreshUser();
      toast('Email change cancelled');
    } catch {
      toast('Failed to cancel email change', 'error');
    }
  };

  // ── AI Config Save ────────────────────────────────────────────────

  const handleAiSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiSaving) return;
    setAiError('');
    setAiSuccess('');
    setAiSaving(true);
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
      setAiSuccess('Settings saved');
      setTimeout(() => setAiSuccess(''), 3000);
    } catch (err: any) {
      setAiError(err.response?.data?.detail || 'Failed to save settings');
    } finally {
      setAiSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading settings..." />;

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="max-w-xl space-y-6">
        {/* ── Card 1: Profile ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-500">Manage your identity and account</p>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPic}
              className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer"
            >
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-indigo-700">
                    {(profile?.first_name || profile?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingPic ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              {/* Uploading overlay */}
              {uploadingPic && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPic}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              {uploadingPic ? 'Uploading...' : 'Change photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePictureUpload}
              className="hidden"
            />
          </div>

          {/* Profile form */}
          <form onSubmit={handleProfileSave} className="space-y-4">
            {profileError && <ErrorMessage message={profileError} />}

            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={50}
                className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">This is how others see you</p>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          {/* ── Email Section ──────────────────────────────────────── */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Email</h3>

            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{profile?.email}</span>
              {profile?.is_verified && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            {/* Pending email banner */}
            {profile?.pending_email && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-800">
                    Pending change to <span className="font-medium">{profile.pending_email}</span>
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">Check your inbox for the verification link</p>
                </div>
                <button
                  onClick={handleCancelEmailChange}
                  className="text-amber-600 hover:text-amber-800 cursor-pointer"
                  title="Cancel email change"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Email change form */}
            {showEmailForm ? (
              <form onSubmit={handleEmailChange} className="space-y-3">
                {emailError && <ErrorMessage message={emailError} />}
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  required
                  className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={emailSaving}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {emailSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEmailForm(false); setNewEmail(''); setEmailError(''); }}
                    className="px-4 py-2.5 min-h-[44px] text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              !profile?.pending_email && (
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                >
                  Change Email
                </button>
              )
            )}
          </div>

          {/* ── Account Info ───────────────────────────────────────── */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Member since</span>
              <span className="text-gray-700">{memberSince}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Role</span>
              <span className="text-gray-700 capitalize">{profile?.is_verified ? 'Verified User' : 'User'}</span>
            </div>
          </div>
        </div>

        {/* ── Card 2: AI Configuration (existing) ───────────────────── */}
        <form onSubmit={handleAiSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Configuration</h2>
              <p className="text-sm text-gray-500">Connect your own API key to generate real AI quizzes</p>
            </div>
          </div>

          {aiError && <ErrorMessage message={aiError} />}
          {aiSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">{aiSuccess}</p>
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
            disabled={aiSaving}
            className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {aiSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {aiSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
