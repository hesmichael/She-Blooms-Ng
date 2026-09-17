import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, Check, AlertCircle, X, ShieldAlert, RefreshCw, Send } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile, token: string) => void;
  initialMode?: 'login' | 'register';
  onNavigateToPrivacy?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  initialMode = 'login',
  onNavigateToPrivacy,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<'credentials' | '2fa_verify'>('credentials');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Status & Feedback
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [emailCodeSuccess, setEmailCodeSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
    setTwoFactorCode('');
    setBackupCode('');
    setStep('credentials');
    setUseBackupCode(false);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed.');

        if (data.token && data.user) {
          localStorage.setItem('sheblooms_token', data.token);
          onSuccess(data.user, data.token);
          resetForm();
          onClose();
          return;
        } else {
          setError('Account registered successfully. Please sign in.');
          setMode('login');
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials.');

        if (data.requires2FA) {
          setTempToken(data.tempToken);
          setTwoFactorCode('');
          setStep('2fa_verify');
        } else if (data.token && data.user) {
          localStorage.setItem('sheblooms_token', data.token);
          onSuccess(data.user, data.token);
          resetForm();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          code: useBackupCode ? undefined : twoFactorCode.trim(),
          backupCode: useBackupCode ? backupCode.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Two-factor authentication failed.');

      localStorage.setItem('sheblooms_token', data.token);
      onSuccess(data.user, data.token);
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!tempToken) return;
    setError(null);
    setEmailCodeSuccess(null);
    setSendingEmailCode(true);

    try {
      const res = await fetch('/api/auth/send-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email code.');

      setEmailCodeSuccess(data.message || 'Verification code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Could not send verification code to email.');
    } finally {
      setSendingEmailCode(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-[#FFF9F2] text-[#332A28] max-w-md w-full rounded-sm shadow-2xl border border-[#E8A6B2]/40 p-6 md:p-8 space-y-6 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8A6B2]/30 pb-4">
          <div className="flex items-center space-x-2.5">
            <img 
              src="/logo.png" 
              alt="SheBlooms Africa Logo" 
              className="w-10 h-10 object-contain rounded-full shadow-xs shrink-0" 
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 id="auth-modal-title" className="font-editorial text-xl font-bold text-[#332A28]">
                {step === 'credentials'
                  ? mode === 'login' ? 'Admin Portal Sign In' : 'Admin Account Setup'
                  : 'Two-Factor Security Verification'}
              </h3>
              <p className="text-[11px] text-[#7F876B] font-medium">
                Admin Exclusive • 2FA & Cryptographic Protection
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-1 text-[#332A28]/60 hover:text-[#332A28] rounded-sm focus-visible:ring-2 focus-visible:ring-[#C97C79]"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Only in step 1) */}
        {step === 'credentials' && (
          <div className="flex border-b border-[#E8A6B2]/30">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-center transition-colors ${
                mode === 'login'
                  ? 'border-b-2 border-[#C97C79] text-[#332A28]'
                  : 'text-[#332A28]/50 hover:text-[#332A28]'
              }`}
            >
              Admin Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-center transition-colors ${
                mode === 'register'
                  ? 'border-b-2 border-[#C97C79] text-[#332A28]'
                  : 'text-[#332A28]/50 hover:text-[#332A28]'
              }`}
            >
              Admin Setup
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#F6D5C5] border border-[#C97C79] rounded-sm text-xs text-[#332A28] flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-[#C97C79] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Notice of Admin Restriction */}
        {step === 'credentials' && (
          <div className="p-2.5 bg-[#FFF5DE] border border-[#C89A61]/40 rounded-sm text-[11px] text-[#332A28] flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#7F876B] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Restricted Access:</span> Authorized administrative credentials required.
            </div>
          </div>
        )}

        {/* STEP 1: CREDENTIALS FORM */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-[#332A28] mb-1">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amina Bello"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-[#332A28] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                />
                <Mail className="w-4 h-4 text-[#332A28]/40 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-[#332A28] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                />
                <Lock className="w-4 h-4 text-[#332A28]/40 absolute left-3 top-2.5" />
              </div>
              {mode === 'register' && (
                <p className="text-[11px] text-[#332A28]/60 mt-1">
                  Your account will be registered and encrypted securely.
                </p>
              )}
            </div>

            <button
              id="auth-credentials-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold py-3 rounded-sm transition-colors duration-200 shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Continue to Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>
        )}

        {/* 2FA VERIFICATION (For Login) */}
        {step === '2fa_verify' && (
          <form onSubmit={handleVerify2FALogin} className="space-y-4 text-xs">
            <div className="text-center space-y-1">
              <Key className="w-8 h-8 text-[#C97C79] mx-auto" />
              <p className="font-semibold text-sm text-[#332A28]">
                Two-Factor Security Verification
              </p>
              <p className="text-[#332A28]/70 text-xs">
                Enter your 6-digit verification code.
              </p>
            </div>

            {/* Email OTP Dispatch Confirmation */}
            {emailCodeSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-sm flex items-center space-x-2 text-xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailCodeSuccess}</span>
              </div>
            )}

            {!useBackupCode ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="login-2fa-code" className="block text-center font-medium text-[#332A28] mb-2">
                    Verification Code
                  </label>
                  <input
                    id="login-2fa-code"
                    type="text"
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="w-full text-center tracking-wider font-mono text-lg py-3 bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                    autoFocus
                  />
                </div>

                {/* Send Email OTP Alternative */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    disabled={sendingEmailCode}
                    className="inline-flex items-center space-x-1.5 text-xs text-[#C97C79] hover:text-[#332A28] font-medium transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {sendingEmailCode ? 'Dispatching code...' : 'Email me a 6-digit code instead'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="login-backup-code" className="block text-center font-medium text-[#332A28] mb-1">
                  Security Passkey
                </label>
                <input
                  id="login-backup-code"
                  type="password"
                  required
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  placeholder="••••••••••••••••"
                  className="w-full text-center font-mono py-2.5 bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!useBackupCode ? twoFactorCode.trim().length < 4 : backupCode.trim().length < 4)}
              className="w-full bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold py-3 rounded-sm transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <div className="pt-2 flex items-center justify-between text-[11px] text-[#332A28]/70">
              <button
                type="button"
                onClick={() => setUseBackupCode(!useBackupCode)}
                className="p-1.5 text-[#332A28]/40 hover:text-[#332A28] transition-colors rounded-xs hover:bg-[#FFF5DE]"
                title={useBackupCode ? "Standard verification" : "Alternative verification"}
                aria-label="Security key options"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="hover:underline hover:text-[#332A28]"
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
