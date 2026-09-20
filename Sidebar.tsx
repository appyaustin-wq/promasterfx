import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { 
  LayoutDashboard, 
  PieChart, 
  TrendingUp, 
  BarChart2, 
  Users, 
  Clock, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  Banknote, 
  Briefcase, 
  Rocket, 
  DollarSign, 
  Newspaper, 
  Sparkles, 
  Settings, 
  Share2, 
  Shield, 
  LogOut, 
  Menu, 
  X,
  BadgeAlert,
  ChevronDown,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { openSmartsuppChat } from '../../services/smartsupp';

interface SidebarProps {
  activeTab?: string;
  currentTab?: string;
  onSelectTab: (tab: string) => void;
  isOpen?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  currentTab,
  onSelectTab,
  isOpen,
  mobileOpen,
  onClose,
  setMobileOpen
}) => {
  const { userProfile, logout, currentUser } = useAuth();
  const selectedTab = activeTab || currentTab || 'dashboard';
  const isDrawerOpen = isOpen ?? mobileOpen ?? false;

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onClose) onClose();
    if (setMobileOpen) setMobileOpen(false);
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    hasDropdown?: boolean;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'portfolio', label: 'Portfolio', icon: PieChart }
      ]
    },
    {
      title: 'TRADING',
      items: [
        { id: 'trade', label: 'Open Trade', icon: TrendingUp },
        { id: 'markets', label: 'Markets', icon: BarChart2 },
        { id: 'copy-trading', label: 'Copy Trading', icon: Users },
        { id: 'trade-history', label: 'Trade History', icon: Clock }
      ]
    },
    {
      title: 'WALLET',
      items: [
        { id: 'deposits', label: 'Deposits', icon: ArrowDownCircle },
        { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpCircle },
        { id: 'transactions', label: 'Transactions', icon: History },
        { id: 'loans', label: 'Loans', icon: Banknote }
      ]
    },
    {
      title: 'INVESTMENTS',
      items: [
        { id: 'investment-plans', label: 'Investment Plans', icon: Briefcase },
        { id: 'pre-ipo', label: 'Pre-IPO', icon: Rocket },
        { id: 'stocks', label: 'Stock Shares', icon: DollarSign },
        { id: 'signals', label: 'Trading Signals', icon: Sparkles, hasDropdown: true },
        { id: 'nft-market', label: 'NFT Market', icon: Newspaper, hasDropdown: true }
      ]
    }
  ];

  // Check if current user is admin
  const isAdmin = userProfile?.role === 'admin';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a0d14] border-r border-[#1a1f2c] text-slate-300 w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1a1f2c] flex items-center justify-between bg-[#080a0f]">
        <Logo size="sm" showBadge={false} />
      </div>

      {/* User Profile Card Snippet */}
      <div className="p-3 mx-3 mt-3 bg-[#111522] border border-[#1a1f2c] rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
          {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'H'}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate">
            {userProfile?.fullName || 'Harry Rodrigo'}
          </div>
          <div className={`text-[10px] font-medium ${userProfile?.verified === true ? 'text-emerald-400' : 'text-amber-400'}`}>
            {userProfile?.verified === true ? 'Verified' : 'Unverified'}
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-none">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {group.title}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = selectedTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive 
                      ? 'bg-[#1a202c] text-white font-bold border-l-2 border-amber-400 pl-2.5' 
                      : 'text-slate-400 hover:text-white hover:bg-[#121622]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-amber-400 text-black font-bold' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Admin Section (If admin user) */}
        {isAdmin && (
          <div className="pt-2 border-t border-[#1e2638] space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-wider text-rose-400 uppercase flex items-center justify-between">
              <span>ADMINISTRATION</span>
              <Shield className="w-3 h-3" />
            </div>
            <button
              onClick={() => handleItemClick('admin')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedTab === 'admin' 
                  ? 'bg-rose-500 text-white shadow' 
                  : 'text-rose-400 hover:bg-rose-500/10 border border-rose-500/20'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Control Center</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer / Support & Logout */}
      <div className="p-3 border-t border-[#1e2638] bg-[#07090e] space-y-1">
        <button
          onClick={() => openSmartsuppChat()}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#121622] rounded-lg transition-colors group"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Live Support</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Support Online"></span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (onClose) onClose();
              if (setMobileOpen) setMobileOpen(false);
            }}
          ></div>
          <div className="relative z-10 w-64 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
