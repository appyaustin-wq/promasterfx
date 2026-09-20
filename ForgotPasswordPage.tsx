import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateAuth?: (page: 'login' | 'register') => void;
  onNavigate?: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateAuth, onNavigate }) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNavigateAuth = (page: 'login' | 'register') => {
    if (onNavigateAuth) onNavigateAuth(page);
    else if (onNavigate) onNavigate(page);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-black relative">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Logo size="lg" showBadge={true} />
          <p className="text-xs text-slate-400">Reset your Promaster FX account password</p>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-2xl space-y-5">
          <button
            onClick={() => handleNavigateAuth('login')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Link Sent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, a password reset link has been dispatched.
              </p>
              <button
                onClick={() => handleNavigateAuth('login')}
                className="w-full py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl shadow"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="trader@promasterfx.com"
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending Instructions...' : 'Send Password Reset Link'}
                {!loading && <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
