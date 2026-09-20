import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigateTab?: (tab: string) => void;
  onNavigateAuth?: (page: 'login' | 'register' | 'forgot-password') => void;
  onNavigate?: (route: string) => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateTab, onNavigateAuth, onNavigate, onLoginSuccess }) => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNavigateTab = (tab: string) => {
    if (onNavigateTab) onNavigateTab(tab);
    else if (onNavigate) onNavigate(tab);
  };

  const handleNavigateAuth = (page: 'login' | 'register' | 'forgot-password') => {
    if (onNavigateAuth) onNavigateAuth(page);
    else if (onNavigate) onNavigate(page);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
      else handleNavigateTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
      else handleNavigateTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-black relative">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-block cursor-pointer" onClick={() => handleNavigateTab('landing')}>
            <Logo size="lg" showBadge={true} />
          </div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <p className="text-xs text-slate-400">Sign in to start trading crypto, forex and stocks.</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 bg-[#182030] hover:bg-[#202b40] text-slate-200 border border-[#2a364f] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-[#1e2638]"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase font-bold tracking-widest">OR</span>
            <div className="flex-grow border-t border-[#1e2638]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email or Username"
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => handleNavigateAuth('forgot-password')}
                className="text-amber-400 font-bold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-[#1e2638]">
            Don't have an account?{' '}
            <button
              onClick={() => handleNavigateAuth('register')}
              className="text-amber-400 font-bold hover:underline"
            >
              Register Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
