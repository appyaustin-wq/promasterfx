import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { 
  TrendingUp, 
  Settings, 
  Menu, 
  User, 
  LogOut, 
  ShieldCheck, 
  Search, 
  ChevronDown,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { openSmartsuppChat } from '../../services/smartsupp';
import { LanguageSelector } from '../ui/LanguageSelector';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (route: string) => void;
}

export const DashboardNavbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate }) => {
  const { 
    userProfile, 
    signOut, 
    resetDemoBalance
  } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d111a]/95 backdrop-blur-md border-b border-[#1e2638]">
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-[#121722] hover:bg-[#182030] text-slate-300 hover:text-white rounded-lg border border-[#1e2638] transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>

          <div onClick={() => onNavigate('dashboard')} className="cursor-pointer">
            <Logo size="sm" />
          </div>
        </div>

        {/* Center: Search & Quick Navigation */}
        <div className="hidden md:flex items-center gap-2 bg-[#0a0d14] border border-[#1e2638] rounded-xl px-3 py-1.5 w-72">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search markets or navigation..."
            onFocus={() => onNavigate('markets')}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        {/* Right: Language Selector, Balance Pill & User Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Native Inline Language Selector & Translator Wrapper */}
          <LanguageSelector className="max-h-10 max-w-[120px] sm:max-w-none" />

          {/* Balance Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-[#121722] border border-[#1e2638] rounded-xl px-3 py-1.5">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Balance:</div>
            <div className="text-xs font-mono font-bold text-amber-400">
              ${userProfile?.demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <button
              onClick={resetDemoBalance}
              className="p-1 hover:bg-[#182030] text-slate-400 hover:text-amber-400 rounded transition-colors"
              title="Reset Balance to $10,000"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Trade CTA */}
          <button
            onClick={() => onNavigate('trade')}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Trade Terminal
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleUserDropdown}
              className="flex items-center gap-2 bg-[#121722] hover:bg-[#182030] border border-[#1e2638] rounded-xl px-2.5 py-1.5 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-black font-black text-xs flex items-center justify-center">
                {userProfile?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-white max-w-[100px] truncate">
                {userProfile?.fullName || 'Trader'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111622] border border-[#1e2638] rounded-xl shadow-2xl py-2 z-50 divide-y divide-[#1e2638]">
                <div className="px-4 py-2 space-y-0.5">
                  <div className="text-xs font-bold text-white truncate">{userProfile?.fullName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userProfile?.email}</div>
                  <div className="text-[10px] text-amber-400 font-semibold mt-1">
                    Account ({userProfile?.preferredCurrency || 'USD'})
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => { onNavigate('settings'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-[#182030] hover:text-amber-400 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5" /> Profile & Settings
                  </button>
                  <button
                    onClick={() => { onNavigate('verify-kyc'); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-[#182030] hover:text-amber-400 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verify Account (KYC)
                  </button>
                  <button
                    onClick={() => { openSmartsuppChat(); setUserDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-[#182030] hover:text-cyan-400 flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Live Support Chat
                  </button>
                  {userProfile?.role === 'admin' && (
                    <button
                      onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-rose-400 hover:bg-[#182030] flex items-center gap-2 font-bold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Control Center
                    </button>
                  )}
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={async () => {
                      await signOut();
                      onNavigate('landing');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
