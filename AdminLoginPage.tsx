import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { Mail, Lock, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

interface AdminLoginPageProps {
  onNavigate?: (route: string) => void;
  onLoginSuccess?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      await login(email, password);

      // 2. Verify admin role in Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        let isAdmin = false;
        if (userSnap.exists()) {
          const profile = userSnap.data();
          if (profile.role === 'admin' || currentUser.email === 'admin@promasterfx.com') {
            isAdmin = true;
          }
        } else if (currentUser.email === 'admin@promasterfx.com') {
          isAdmin = true;
        }

        if (!isAdmin) {
          // Not an admin! Sign out and deny access
          await signOut(auth);
          setError('Unauthorized admin access. This account does not have administrator privileges.');
          setLoading(false);
          return;
        }
      }

      if (onLoginSuccess) onLoginSuccess();
      else if (onNavigate) onNavigate('admin');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-black relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-block cursor-pointer" onClick={() => onNavigate && onNavigate('landing')}>
            <Logo size="lg" showBadge={true} />
          </div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Admin Control Portal</h2>
              <p className="text-[11px] text-slate-400">Restricted access for verified administrators only.</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@promasterfx.com"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating Admin...' : 'Access Admin Control Center'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-[#1e2638]">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('login')}
              className="hover:text-slate-300 transition-colors"
            >
              Return to Regular User Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
