import React, { useState } from 'react';
import { useAuth } from '../../lib/firebase/authContext';
import { ArrowLeft, Cpu, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onNavigateToLanding: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onNavigateToLanding,
  onLoginSuccess,
}) => {
  const { login, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setForgotNotice(null);
    clearError();

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      // Error handled via AuthContext error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setFormError('Please enter your email address first to reset your password.');
      return;
    }
    setForgotNotice(`Password reset instructions sent to ${email.trim()} (simulated).`);
  };

  const displayError = formError || authError;

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-[#423F4F] flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-[#423F4F]/10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-2 text-xs font-mono-tech font-bold uppercase text-[#565E75] hover:text-[#292733] transition-colors focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 rounded-[4px] px-2 py-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#A99BC9]" />
          <span>BACK TO LANDING PAGE</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#423F4F] flex items-center justify-center rounded-[3px]">
            <div className="w-2.5 h-2.5 border border-white rotate-45"></div>
          </div>
          <span className="font-extrabold text-base tracking-tighter text-[#292733]">LATTICE</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#423F4F]/10 rounded-[8px] p-6 sm:p-8 shadow-lg">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1 bg-[#F3F3F3] text-[#565E75] font-mono-tech text-[10px] font-bold tracking-widest uppercase rounded border border-[#423F4F]/10">
              <ShieldCheck className="w-3 h-3 text-[#7AE04C]" />
              <span>AUTHENTICATION PROTOCOL</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#292733] tracking-tight">Welcome back</h1>
            <p className="text-xs text-[#565E75] mt-1 font-mono-tech">
              Enter your credentials to access Command Center
            </p>
          </div>

          {displayError && (
            <div className="mb-6 p-3 bg-[#E26161]/10 border border-[#E26161]/30 rounded-[6px] flex items-start gap-2 text-xs text-[#E26161] font-mono-tech font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {forgotNotice && (
            <div className="mb-6 p-3 bg-[#6B9FD4]/10 border border-[#6B9FD4]/30 rounded-[6px] flex items-start gap-2 text-xs text-[#6B9FD4] font-mono-tech font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{forgotNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75] mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="operator@building.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-mono-tech text-[10px] text-[#565E75] hover:text-[#292733] underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 rounded px-1"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
                required
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-lattice-primary w-full py-3 text-xs font-mono-tech uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#A99BC9]" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <span>LOGIN TO COMMAND CENTER</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#423F4F]/10 text-center font-mono-tech text-xs text-[#565E75]">
            <span>Don't have an account? </span>
            <button
              onClick={onNavigateToSignup}
              className="font-bold text-[#423F4F] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 rounded px-1"
            >
              Create account →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
