import React, { useState } from 'react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, TrendingDown, User, LogIn, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { LanguageSelector } from '../ui/LanguageSelector';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onNavigateAuth?: (page: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab = 'home', 
  setActiveTab,
  onNavigateAuth 
}) => {
  const { currentUser, userProfile, markets, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const topTickers = markets.slice(0, 6);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'markets', label: 'Markets' },
    { id: 'platform', label: 'Platform' },
    { id: 'about', label: 'About' },
    { id: 'faq', label: 'FAQ' }
  ];

  const handleNavClick = (id: string) => {
    if (setActiveTab) setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-[#0a0d14] border-b border-[#1e2638] sticky top-0 z-50">
      {/* Top Ticker Bar */}
      <div className="w-full bg-[#07090e] border-b border-[#1e2638]/60 text-xs py-1.5 px-4 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center justify-between gap-6 text-slate-300">
        <div className="flex items-center gap-6 animate-pulse-slow">
          {topTickers.map(m => {
            const isUp = m.change24h >= 0;
            return (
              <div key={m.id} className="inline-flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-400">{m.symbol}</span>
                <span className="text-white font-semibold">${m.price.toLocaleString(undefined, { minimumFractionDigits: m.price < 10 ? 4 : 2 })}</span>
                <span className={`flex items-center text-[10px] ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isUp ? '+' : ''}{m.change24h}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400 font-sans">
          <span>Server Time: <strong className="text-slate-200">UTC 04:15</strong></span>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="cursor-pointer shrink-0" onClick={() => handleNavClick('home')}>
          <Logo size="md" showBadge={true} />
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'text-amber-400 bg-amber-500/10 font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-[#111622]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Section: Language Selector + User Auth CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Native Inline Language Selector & Translator Wrapper */}
          <LanguageSelector className="max-h-10 max-w-[120px] sm:max-w-none" />

          {/* Desktop User Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab && setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all shadow-md shadow-amber-500/20"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateAuth ? onNavigateAuth('login') : (setActiveTab && setActiveTab('login'))}
                  className="px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-[#111622] rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-amber-400" /> Login
                </button>
                <button
                  onClick={() => onNavigateAuth ? onNavigateAuth('register') : (setActiveTab && setActiveTab('register'))}
                  className="px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all shadow-md shadow-amber-500/20"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-[#111622] border border-[#1e2638]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d111a] border-b border-[#1e2638] px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-3 py-2 text-base font-medium rounded-lg ${
                  activeTab === item.id 
                    ? 'text-amber-400 bg-amber-500/10 font-bold' 
                    : 'text-slate-300 hover:bg-[#111622]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1e2638] flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => {
                  if (setActiveTab) setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center font-bold bg-amber-500 text-black rounded-lg"
              >
                Open Trading Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (onNavigateAuth) onNavigateAuth('login');
                    else if (setActiveTab) setActiveTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center font-medium bg-[#111622] text-slate-200 border border-[#1e2638] rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    if (onNavigateAuth) onNavigateAuth('register');
                    else if (setActiveTab) setActiveTab('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center font-bold bg-amber-500 text-black rounded-lg"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

