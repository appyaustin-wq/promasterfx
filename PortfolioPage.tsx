import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrencyAmount } from '../../services/currencyService';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  BarChart2, 
  PieChart, 
  Layers, 
  TrendingUp, 
  FileText, 
  Settings, 
  HelpCircle, 
  Bell, 
  ShieldCheck, 
  ChevronDown, 
  Bot, 
  Sparkles, 
  Globe, 
  DollarSign, 
  AlertCircle, 
  MessageSquare,
  Briefcase,
  Award,
  CreditCard
} from 'lucide-react';

interface PortfolioPageProps {
  onSelectTab?: (tab: string) => void;
}

type SubModuleTab = 
  | 'overview' 
  | 'trading' 
  | 'investments' 
  | 'copy_trading' 
  | 'bot_trading' 
  | 'pre_ipo' 
  | 'stocks' 
  | 'nfts' 
  | 'loans';

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onSelectTab }) => {
  const { userProfile, positions } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SubModuleTab>('overview');
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  const userName = userProfile?.fullName || 'Harry Rodrigo';
  const isVerified = userProfile?.verified || false;

  // Real calculations
  const openPositions = positions.filter(p => p.status === 'open');
  const totalPnL = openPositions.reduce((acc, curr) => acc + curr.pnl, 0);
  const totalInvested = openPositions.reduce((acc, curr) => acc + curr.margin, 0);
  const demoBalance = userProfile?.demoBalance || 10000;
  const netWorth = demoBalance + totalInvested + totalPnL;

  const handleNavClick = (tabKey: string) => {
    if (onSelectTab) {
      onSelectTab(tabKey);
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto select-none pb-12 w-full max-w-full overflow-x-hidden min-h-screen box-border">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d111a] border-b border-[#1b2234] pb-3 w-full max-w-full min-w-0 box-border">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white tracking-tight truncate">Portfolio</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Notification Bell */}
          <div 
            onClick={() => handleNavClick('activity')}
            className="relative cursor-pointer p-2 bg-[#141b29] hover:bg-[#1a2336] rounded-lg border border-[#222d42] transition-colors shrink-0"
            title="View Notifications & Activity"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center rounded-full border border-[#0d111a]">
              1
            </span>
          </div>

          {/* Verify KYC Button */}
          <button
            onClick={() => handleNavClick('verify-kyc')}
            className="px-3 py-1.5 bg-[#141b29] hover:bg-amber-500/10 border border-amber-500/50 text-amber-400 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {isVerified ? 'KYC Verified' : 'Verify KYC'}
          </button>

          {/* User Profile Pill */}
          <div 
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-2 bg-[#141b29] border border-[#222d42] rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-[#1a2336] transition-colors shrink-0"
            title="Account Settings"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center shrink-0">
              {userName.charAt(0)}
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[120px]">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Market Ticker Strip */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-2.5 overflow-x-auto scrollbar-none flex items-center gap-6 text-xs font-mono">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-amber-400 font-bold">Ξ</span>
          <span className="text-slate-200 font-bold">Ethereum</span>
          <span className="text-white font-semibold">2,514.2</span>
          <span className="text-emerald-400 font-bold">+29.30 (+1.18%)</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-1 rounded">100</span>
          <span className="text-slate-200 font-bold">UK 100</span>
          <span className="text-white font-semibold">10,715.7</span>
          <span className="text-rose-400 font-bold">-45.70 (-0.42%)</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-1 rounded">500</span>
          <span className="text-slate-200 font-bold">S&P 500 Index</span>
          <span className="text-white font-semibold">7,656.7</span>
          <span className="text-rose-400 font-bold">-16.00 (-0.21%)</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black px-1 rounded">100</span>
          <span className="text-slate-200 font-bold">US 100 Cash CFD</span>
          <span className="text-white font-semibold">29,419.9</span>
          <span className="text-rose-400 font-bold">-77.90 (-0.26%)</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sky-400">🇪🇺</span>
          <span className="text-slate-200 font-bold">EUR to USD</span>
          <span className="text-white font-semibold">1.16474</span>
          <span className="text-emerald-400 font-bold">+0.00 (+0.20%)</span>
        </div>
      </div>

      {/* Sub-Navigation Pill Buttons Bar (10 items) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <Wallet className="w-3.5 h-3.5 text-slate-400" /> Account
        </button>

        <button
          onClick={() => handleNavClick('deposits')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-slate-400" /> Deposit
        </button>

        <button
          onClick={() => handleNavClick('withdrawals')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" /> Withdraw
        </button>

        <button
          onClick={() => handleNavClick('trade')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <BarChart2 className="w-3.5 h-3.5 text-slate-400" /> Trade
        </button>

        {/* ACTIVE PORTFOLIO PILL */}
        <button
          onClick={() => handleNavClick('portfolio')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d9ac36] text-black font-extrabold text-xs rounded-lg shadow-md transition-all whitespace-nowrap"
        >
          <PieChart className="w-3.5 h-3.5 text-black" /> Portfolio
        </button>

        <button
          onClick={() => handleNavClick('positions')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" /> Positions
        </button>

        <button
          onClick={() => handleNavClick('markets')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Markets
        </button>

        <button
          onClick={() => handleNavClick('activity')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" /> Transactions
        </button>

        <button
          onClick={() => handleNavClick('settings')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
        </button>

        <button
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Support
        </button>
      </div>

      {/* Main Title Section */}
      <div className="pt-2">
        <h2 className="text-2xl font-extrabold text-white">Portfolio</h2>
        <p className="text-xs text-slate-400 mt-0.5">Consolidated view of all your assets and positions</p>
      </div>

      {/* Top 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: NET WORTH */}
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NET WORTH</div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatCurrencyAmount(netWorth, userProfile?.preferredCurrency)}
          </div>
          <div className="text-[11px] text-slate-500">All assets combined</div>
        </div>

        {/* Card 2: TOTAL INVESTED */}
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL INVESTED</div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatCurrencyAmount(totalInvested, userProfile?.preferredCurrency)}
          </div>
          <div className="text-[11px] text-slate-500">Across all modules</div>
        </div>

        {/* Card 3: TOTAL P/L */}
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL P/L</div>
          <div className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrencyAmount(totalPnL, userProfile?.preferredCurrency)}
          </div>
          <div className="text-[11px] text-slate-500">Realized + unrealized</div>
        </div>

        {/* Card 4: ACCOUNT BALANCE */}
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ACCOUNT BALANCE</div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatCurrencyAmount(demoBalance, userProfile?.preferredCurrency)}
          </div>
          <div className="text-[11px] text-slate-500">Available cash</div>
        </div>
      </div>

      {/* Module Filter Row (9 Pill Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 pb-1">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" /> Overview
        </button>

        <button
          onClick={() => setActiveSubTab('trading')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'trading'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" /> Trading
        </button>

        <button
          onClick={() => setActiveSubTab('investments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'investments'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> Investments
        </button>

        <button
          onClick={() => setActiveSubTab('copy_trading')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'copy_trading'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Copy Trading
        </button>

        <button
          onClick={() => setActiveSubTab('bot_trading')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'bot_trading'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <Bot className="w-3.5 h-3.5" /> Bot Trading
        </button>

        <button
          onClick={() => setActiveSubTab('pre_ipo')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'pre_ipo'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Pre-IPO
        </button>

        <button
          onClick={() => setActiveSubTab('stocks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'stocks'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Stocks
        </button>

        <button
          onClick={() => setActiveSubTab('nfts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'nfts'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> NFTs
        </button>

        <button
          onClick={() => handleNavClick('loans')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'loans'
              ? 'bg-[#d9ac36] text-black font-extrabold shadow-md'
              : 'bg-[#141b29] hover:bg-[#1c263b] text-slate-300 border border-[#222d42]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Loans
        </button>
      </div>

      {/* Main Content Grid: Left 8 cols, Right 4 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column Container: Portfolio Allocation */}
        <div className="lg:col-span-8 bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Portfolio Allocation</h3>
          </div>

          <div className="flex-1 flex items-center justify-center my-12 text-center">
            {openPositions.length === 0 || activeSubTab !== 'overview' ? (
              <div className="space-y-3">
                <span className="text-xs text-slate-400 font-medium block">
                  No active {activeSubTab === 'overview' ? 'investments' : activeSubTab.replace('_', ' ')} recorded yet.
                </span>
                {activeSubTab === 'investments' && (
                  <button 
                    onClick={() => handleNavClick('investment-plans')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Explore Investment Plans
                  </button>
                )}
                {activeSubTab === 'nfts' && (
                  <button 
                    onClick={() => handleNavClick('nft-market')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Open NFT Market
                  </button>
                )}
                {activeSubTab === 'pre_ipo' && (
                  <button 
                    onClick={() => handleNavClick('pre-ipo')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Explore Pre-IPO Shares
                  </button>
                )}
                {activeSubTab === 'stocks' && (
                  <button 
                    onClick={() => handleNavClick('stocks')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" /> Explore Stock Shares
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="text-xs text-slate-300 font-bold mb-2">Live Category Breakdown</div>
                {openPositions.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] text-xs">
                    <span className="font-bold text-white">{p.symbol} ({(p.category || 'Trading').toUpperCase()})</span>
                    <span className="font-mono text-amber-400 font-bold">${p.margin.toFixed(2)} Margin</span>
                    <span className={`font-mono font-bold ${p.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-600 border-t border-[#1e2638] pt-3">
            Real-time portfolio evaluation • Promaster FX Engine
          </div>
        </div>

        {/* Right Column Containers: Stack of Cards */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: ACCOUNT BALANCE */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ACCOUNT BALANCE</div>
            <div className="text-xl font-bold text-white font-mono">
              ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Card 2: ACTIVE POSITIONS */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ACTIVE POSITIONS</div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#1b2234]">
                <span className="text-slate-400">Open Trades</span>
                <span className="font-bold text-white font-mono">{openPositions.length}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#1b2234]">
                <span className="text-slate-400">Active Plans</span>
                <span className="font-bold text-white font-mono">0</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#1b2234]">
                <span className="text-slate-400">Copy Positions</span>
                <span className="font-bold text-white font-mono">0</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#1b2234]">
                <span className="text-slate-400">Pre-IPO Holdings</span>
                <span className="font-bold text-white font-mono">0</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#1b2234]">
                <span className="text-slate-400">NFTs Owned</span>
                <span className="font-bold text-white font-mono">0</span>
              </div>
            </div>
          </div>

          {/* Card 3: Trading Capital Banner */}
          <div className="bg-[#181d29] border border-amber-500/40 rounded-xl p-3.5 flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-amber-400">
              Trading Capital: ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="pt-8 text-center text-xs text-slate-500 border-t border-[#1e2638]/60 mt-12">
        © 2026 <span className="text-amber-400 font-bold">Promaster FX</span>. All rights reserved.
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-blue-400/30"
        >
          <span className="font-bold">Chat</span>
          <MessageSquare className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
};
