import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { authService } from '../services/auth';

interface LoginPageProps {
  onOpenApplyModal: () => void;
  onOpenAIAdvisor: () => void;
  onNavigate?: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onOpenApplyModal,
  onNavigate,
}) => {
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Forgot password modal/inline state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetCustomerId, setResetCustomerId] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{ success?: boolean; text: string } | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (authService.isAuthenticated()) {
      if (onNavigate) {
        onNavigate('/customer/dashboard');
      } else {
        window.history.pushState({}, '', '/customer/dashboard');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  }, [onNavigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanId = customerId.trim();
    const cleanPassword = password.trim();

    if (!cleanId || !cleanPassword) {
      setErrorMessage('Please enter both your Customer ID and Password.');
      return;
    }

    setIsLoading(true);

    const res = await authService.login({
      customerId: cleanId,
      password: cleanPassword,
    });

    setIsLoading(false);

    if (!res.success) {
      // Strictly report backend error, never mock success
      setErrorMessage(
        res.error || 'Customer authentication service is not connected yet. Please try again later.'
      );
      return;
    }

    // Real authentication succeeded
    if (onNavigate) {
      onNavigate('/customer/dashboard');
    } else {
      window.history.pushState({}, '', '/customer/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = resetCustomerId.trim();
    if (!cleanId) {
      setResetResult({
        success: false,
        text: 'Please enter your assigned Customer ID to check password recovery status.',
      });
      return;
    }

    setIsResetting(true);
    setResetResult(null);

    const res = await authService.requestPasswordReset(cleanId);
    setIsResetting(false);

    if (res.error) {
      setResetResult({
        success: false,
        text: res.error,
      });
    } else {
      setResetResult({
        success: true,
        text: res.message || 'Password recovery instructions have been initiated by your loan associate.',
      });
    }
  };

  return (
    <div className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 space-y-12">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Main Login Card */}
        <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-9 border border-[#E5DFD3] shadow-lg space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-1">
              <Logo layout="stacked" size="md" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#2D332E]">Customer Portal Login</h1>
            <p className="text-xs text-[#68716A] max-w-sm mx-auto leading-relaxed">
              Sign in to monitor your loan file status, view 12-stage milestone progress, and manage documents securely.
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Authentication Notice</span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 rounded-2xl bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E] text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#5D6D5F] flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{infoMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2D332E] mb-1.5">
                Customer ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter your assigned Customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#2D332E]">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(!showForgotPassword);
                    setResetResult(null);
                  }}
                  className="text-[11px] font-bold text-[#C68B59] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating with Portal...</span>
                </>
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Section (Non-mocked, truthful) */}
          {showForgotPassword && (
            <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-3 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D332E]">
                <HelpCircle className="w-4 h-4 text-[#C68B59]" />
                <span>Password Recovery Assistance</span>
              </div>
              <p className="text-[11px] text-[#68716A] leading-relaxed">
                Enter your Customer ID below to check recovery status with the loan processing desk.
              </p>

              {resetResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                    resetResult.success
                      ? 'bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E]'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {resetResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5D6D5F] flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{resetResult.text}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter Customer ID"
                  value={resetCustomerId}
                  onChange={(e) => setResetCustomerId(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#2D332E] hover:bg-[#3D453E] transition-colors whitespace-nowrap"
                >
                  {isResetting ? 'Checking...' : 'Recover Password'}
                </button>
              </form>
            </div>
          )}

          {/* Security & Access Information */}
          <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-2 text-xs text-[#2D332E]">
            <div className="flex items-center gap-1.5 font-bold text-[#5D6D5F]">
              <Lock className="w-3.5 h-3.5" />
              <span>Direct Credential Issuance</span>
            </div>
            <p className="text-[11px] text-[#68716A] leading-relaxed">
              Customer login credentials are created and issued directly by your authorized Capitabee Loan Associate upon application verification. Public self-registration is restricted to safeguard borrower financial privacy.
            </p>
          </div>

          {/* New Application Link */}
          <div className="pt-2 text-center border-t border-[#E5DFD3] text-xs text-[#68716A]">
            Haven't registered your loan requirement yet?{' '}
            <button
              type="button"
              onClick={onOpenApplyModal}
              className="font-bold text-[#C68B59] hover:underline"
            >
              Submit New Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
