import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Loader2, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import axios from 'axios';
import { API_BASE } from '../config';
import type { OnboardingStatus } from '../lib/types';

function createOnboardingApi() {
  const instance = axios.create({ baseURL: API_BASE });
  instance.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('onboarding_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
}

const steps = [
  { label: 'Welcome', icon: CheckCircle2 },
  { label: 'Verify', icon: Mail },
  { label: 'Password', icon: KeyRound },
];

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-8 flex-wrap">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;
        return (
          <div key={step.label} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isComplete
                  ? 'bg-indigo-600 text-white'
                  : isActive
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isComplete ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 sm:w-8 h-0.5 ${isComplete ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const onboardingApi = useRef(createOnboardingApi());
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1 state (email)
  const [email, setEmail] = useState('');

  // Step 2 state (verify code)
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3 state (password)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const res = await onboardingApi.current.get('/onboarding/status');
      setStatus(res.data);
    } catch {
      sessionStorage.removeItem('onboarding_token');
      navigate('/claim-account');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem('onboarding_token');
    if (!token) {
      navigate('/claim-account');
      return;
    }
    fetchStatus();
  }, [fetchStatus, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Map backend onboarding_step → visual progress step
  const mapStepToVisual = (step: number) => {
    if (step <= 1) return 1;  // Welcome + Email
    if (step === 2) return 2; // Verify code
    if (step === 3) return 3; // Set password
    return 1;
  };

  const handleSetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await onboardingApi.current.post('/onboarding/email', { email });
      await fetchStatus();
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting) return;
    const code = codeDigits.join('');
    if (code.length !== 6) return;
    setError('');
    setSubmitting(true);
    try {
      await onboardingApi.current.post('/onboarding/verify-code', { code });
      await fetchStatus();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    try {
      await onboardingApi.current.post('/onboarding/resend-code');
      setResendCooldown(60);
      setCodeDigits(['', '', '', '', '', '']);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend code');
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await onboardingApi.current.post('/onboarding/password', { password });
      localStorage.setItem('token', res.data.access_token);
      sessionStorage.removeItem('onboarding_token');
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to set password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...codeDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setCodeDigits(newDigits);
      const nextIndex = Math.min(index + digits.length, 5);
      digitRefs.current[nextIndex]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);

    if (value && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!status) return null;

  const visualStep = mapStepToVisual(status.onboarding_step);

  return (
    <div className="min-h-dvh bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BrainCircuit className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Qwiz Me</h1>
          </div>
        </div>

        <ProgressBar currentStep={visualStep} />

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

          {/* Step 1: Welcome + Email */}
          {status.onboarding_step === 1 && (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome, {status.first_name}!
              </h2>
              <p className="text-gray-500">
                Your account has been created. Let's get you set up in a few quick steps.
              </p>
              <form onSubmit={handleSetEmail} className="space-y-4 pt-2">
                <div className="text-left">
                  <label htmlFor="onboard-email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    id="onboard-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputMode="email"
                    className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {submitting ? 'Sending...' : 'Continue'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Verify Code */}
          {status.onboarding_step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Verify your email</h2>
                <p className="text-gray-500 text-sm mt-1 break-all">
                  We sent a 6-digit code to <span className="font-medium text-gray-700">{status.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {codeDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { digitRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting || codeDigits.join('').length !== 6}
                  className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {submitting ? 'Verifying...' : 'Verify'}
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Set Password */}
          {status.onboarding_step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Set your password</h2>
                <p className="text-gray-500 text-sm mt-1">Choose a password to secure your account.</p>
              </div>

              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label htmlFor="onboard-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    id="onboard-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label htmlFor="onboard-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                  <input
                    id="onboard-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 w-full py-3 min-h-[44px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {submitting ? 'Setting up...' : 'Set Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
