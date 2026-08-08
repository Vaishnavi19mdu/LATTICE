import React, { useState } from 'react';
import { useAuth } from '../../lib/firebase/authContext';
import { BUILDINGS_LIST } from '../../types/building.types';
import { UserRole } from '../../types/user.types';
import { ArrowLeft, Cpu, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
  onSignupSuccess: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateToLogin,
  onNavigateToLanding,
  onSignupSuccess,
}) => {
  const { signup, error: authError, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Validation
    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!buildingId) {
      setFormError('Please select a building / block.');
      return;
    }
    if (!password) {
      setFormError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        role,
        buildingId,
        phone: phone.trim(),
        password,
      });
      onSignupSuccess();
    } catch (err: any) {
      // Error handled via AuthContext error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = formError || authError;

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-[#423F4F] flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-[#423F4F]/10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-2 text-xs font-mono-tech font-bold uppercase text-[#565E75] hover:text-[#292733] transition-colors focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 rounded-[4px] px-2 py-1"
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
              <ShieldCheck className="w-3 h-3 text-[#A99BC9]" />
              <span>REGISTRATION PROTOCOL</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#292733] tracking-tight">Create LATTICE Account</h1>
            <p className="text-xs text-[#565E75] mt-1 font-mono-tech">
              Join the building emergency agent network
            </p>
          </div>

          {displayError && (
            <div className="mb-6 p-3 bg-[#E26161]/10 border border-[#E26161]/30 rounded-[6px] flex items-start gap-2 text-xs text-[#E26161] font-mono-tech font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75] mb-1">
                Full Name <span className="text-[#E26161]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Vaishnavi Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75] mb-1">
                Email Address <span className="text-[#E26161]">*</span>
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

            {/* Building Selection */}
            <div>
              <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75] mb-1">
                Building / Block <span className="text-[#E26161]">*</span>
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
                required
              >
                <option value="">[ Select Building / Block ▼ ]</option>
                {BUILDINGS_LIST.map((b) => (
                  <option key={b.id} value={b.buildingId}>
                    {b.name} ({b.floors} Floors)
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75] mb-1">
                Role <span className="text-[#E26161]">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
                required
              >
                <option value="operator">Operator (Monitoring & Plan Approvals)</option>
                <option value="administrator">Administrator (System Configuration)</option>
              </select>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75] mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75] mb-1">
                Password <span className="text-[#E26161]">*</span>
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F3F3F3] border border-[#423F4F]/20 rounded-[6px] text-xs font-sans text-[#292733] focus:bg-white focus:border-[#423F4F] focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 transition-all"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-mono-tech font-bold uppercase text-[#565E75] mb-1">
                Confirm Password <span className="text-[#E26161]">*</span>
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <span>REGISTER OPERATOR ACCOUNT</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#423F4F]/10 text-center font-mono-tech text-xs text-[#565E75]">
            <span>Already have an account? </span>
            <button
              onClick={onNavigateToLogin}
              className="font-bold text-[#423F4F] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#A99BC9] focus-visible:outline-offset-2 rounded px-1"
            >
              Sign In →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
