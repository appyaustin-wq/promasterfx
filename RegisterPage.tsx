import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { AlertCircle, ArrowRight, Gift } from 'lucide-react';
import { COUNTRIES_AND_CURRENCIES, ALL_CURRENCIES } from '../../data/countries';
import { calculateSignupBonus } from '../../services/currencyService';

interface RegisterPageProps {
  onNavigateTab?: (tab: string) => void;
  onNavigateAuth?: (page: 'login' | 'register') => void;
  onNavigate?: (route: string) => void;
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateTab, onNavigateAuth, onNavigate, onRegisterSuccess }) => {
  const { register, loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD ($) — US Dollar');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secAnswer, setSecAnswer] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Forex']);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNavigateTab = (tab: string) => {
    if (onNavigateTab) onNavigateTab(tab);
    else if (onNavigate) onNavigate(tab);
  };

  const handleNavigateAuth = (page: 'login' | 'register') => {
    if (onNavigateAuth) onNavigateAuth(page);
    else if (onNavigate) onNavigate(page);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    const found = COUNTRIES_AND_CURRENCIES.find(c => c.country === selectedCountry);
    if (found) {
      setCurrency(found.currency);
    }
  };

  const toggleAccountType = (type: string) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const liveBonus = calculateSignupBonus(currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (secAnswer !== '7') {
      setError('Incorrect security check answer (1 + 6 = 7)');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(email, password, fullName, username, {
        preferredCurrency: currency,
        country,
        phoneNumber: phone,
        gender
      });
      if (onRegisterSuccess) onRegisterSuccess();
      else handleNavigateTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onRegisterSuccess) onRegisterSuccess();
      else handleNavigateTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center py-12 px-4 selection:bg-amber-500 selection:text-black relative">
      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-block cursor-pointer" onClick={() => handleNavigateTab('landing')}>
            <Logo size="lg" showBadge={true} />
          </div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Sign Up for Free</h2>
            <p className="text-xs text-slate-400">It's free to sign up and only takes a minute.</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Auth Option */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your Name"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter Preferred Username"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Country</label>
                <select
                  value={country}
                  onChange={handleCountryChange}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none transition-colors"
                >
                  {COUNTRIES_AND_CURRENCIES.map(c => (
                    <option key={c.country} value={c.country}>{c.country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Preferred Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none transition-colors"
              >
                {ALL_CURRENCIES.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
              <div className="mt-2 bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-amber-300 font-medium">
                  <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Instant Welcome Sign-up Bonus:</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-amber-400">
                    {liveBonus.formattedAmount}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                    (Standard $10.00 USD value)
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">All trading balances, withdrawals, and metrics will operate in this currency</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Security Check</label>
              <div className="flex items-center gap-3">
                <span className="bg-[#182030] border border-[#2a364f] text-xs font-mono font-bold px-3 py-2.5 rounded-xl text-amber-400">
                  1 + 6 =
                </span>
                <input
                  type="text"
                  required
                  value={secAnswer}
                  onChange={e => setSecAnswer(e.target.value)}
                  placeholder="Answer"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Account Type</label>
              <div className="flex flex-wrap gap-2">
                {['Binary Options', 'Forex', 'Stocks', 'Crypto', 'NFTs'].map(type => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleAccountType(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                          : 'bg-[#0a0d14] text-slate-400 border-[#1e2638] hover:border-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Select one or more</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-[#1e2638]">
            Already have an account?{' '}
            <button
              onClick={() => handleNavigateAuth('login')}
              className="text-amber-400 font-bold hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

