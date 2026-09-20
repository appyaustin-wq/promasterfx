import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrencyAmount } from '../../services/currencyService';
import { openSmartsuppChat } from '../../services/smartsupp';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  Users, 
  BarChart2, 
  Folder, 
  Bell, 
  ChevronDown, 
  ShieldCheck, 
  X, 
  Plus,
  Zap,
  ArrowRight,
  Sparkles,
  DollarSign,
  Check,
  Trash2,
  Settings,
  LogOut,
  MessageSquare,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
  Megaphone
} from 'lucide-react';

interface DashboardPageProps {
  onSelectTab: (tab: string) => void;
}

interface NotificationItem {
  id: number;
  type: 'WITHDRAWAL PROCESSED' | 'DEPOSIT CONFIRMED' | 'TRADE EXECUTED';
  nameOrCity: string;
  amount: number;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, type: 'WITHDRAWAL PROCESSED', nameOrCity: 'Trader from Amsterdam', amount: 100017 },
  { id: 2, type: 'WITHDRAWAL PROCESSED', nameOrCity: 'Trader from London', amount: 45200 },
  { id: 3, type: 'DEPOSIT CONFIRMED', nameOrCity: 'Trader from Zurich', amount: 120500 },
  { id: 4, type: 'WITHDRAWAL PROCESSED', nameOrCity: 'Trader from Tokyo', amount: 89400 },
  { id: 5, type: 'TRADE EXECUTED', nameOrCity: 'Trader from New York', amount: 62400 },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectTab }) => {
  const { 
    userProfile, 
    currentUser, 
    markets,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    signOut
  } = useAuth();

  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatNotificationTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      triggerRandomNotification();
    }, 4000);

    const interval = setInterval(() => {
      triggerRandomNotification();
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const triggerRandomNotification = () => {
    const randomIdx = Math.floor(Math.random() * SAMPLE_NOTIFICATIONS.length);
    const item = SAMPLE_NOTIFICATIONS[randomIdx];
    const variedAmount = item.amount + Math.floor(Math.random() * 3000);
    setCurrentNotification({ ...item, amount: variedAmount });
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, 6000);
  };

  const userId = currentUser?.uid || userProfile?.uid || 'guest_user';
  const userName = userProfile?.fullName || 'Harry Rodrigo';
  const userEmail = currentUser?.email || userProfile?.email || 'trader@promasterfx.com';
  const demoBalance = userProfile?.demoBalance || 0;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto select-none relative w-full max-w-full min-w-0">
      {/* LIVE POPUP NOTIFICATION (Bottom Left) */}
      {showNotification && currentNotification && (
        <div className="fixed bottom-6 left-4 sm:left-6 z-50 animate-bounce duration-300 max-w-[calc(100vw-2rem)]">
          <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 w-full sm:w-80 relative flex items-start gap-3">
            <span className="absolute top-3 right-8 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            
            <button 
              onClick={() => setShowNotification(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
              <ArrowRight className="w-5 h-5 -rotate-45" />
            </div>

            <div className="space-y-0.5 pr-4">
              <div className="text-[10px] font-black tracking-wider text-amber-600 uppercase">
                {currentNotification.type}
              </div>
              <div className="text-xs font-bold text-slate-900">
                {currentNotification.nameOrCity} withdrew ${currentNotification.amount.toLocaleString()} successfully
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {new Date().getUTCHours().toString().padStart(2, '0')}:{new Date().getUTCMinutes().toString().padStart(2, '0')} UTC
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0d14] p-2.5 rounded-xl border border-[#181f2e] w-full">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white tracking-tight">Account Dashboard</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end relative">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              className="p-2 bg-[#121622] hover:bg-[#1a202c] text-slate-300 hover:text-white rounded-lg border border-[#1e2638] transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center px-1 rounded-full border border-[#0a0d14]">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-[#111622] border border-[#1e2638] rounded-xl shadow-2xl py-3 z-50 flex flex-col max-h-[460px]">
                {/* Header */}
                <div className="px-4 pb-2 border-b border-[#1e2638] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Notifications</h4>
                    <p className="text-[10px] text-slate-400">
                      {unreadCount} unread request updates
                    </p>
                  </div>
                  {notifications && notifications.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
                      >
                        Mark all read
                      </button>
                      <span className="text-[#1e2638]">|</span>
                      <button
                        onClick={() => clearAllNotifications()}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto divide-y divide-[#1e2638] scrollbar-thin">
                  {!notifications || notifications.length === 0 ? (
                    <div className="py-12 text-center px-4 space-y-2">
                      <div className="w-10 h-10 bg-[#182030] rounded-full flex items-center justify-center mx-auto text-slate-500">
                        <Bell className="w-5 h-5" />
                      </div>
                      <h5 className="text-xs font-extrabold text-slate-300">No Notifications</h5>
                      <p className="text-[10px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                        We'll let you know when your deposits, withdrawals, or loan applications are updated.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      let Icon = Bell;
                      let iconColor = 'text-blue-400';
                      let iconBg = 'bg-blue-400/10';

                      if (notif.type === 'deposit') {
                        Icon = ArrowDownCircle;
                        if (notif.status === 'approved') {
                          iconColor = 'text-emerald-400';
                          iconBg = 'bg-emerald-400/10';
                        } else {
                          iconColor = 'text-rose-400';
                          iconBg = 'bg-rose-400/10';
                        }
                      } else if (notif.type === 'withdrawal') {
                        Icon = ArrowUpCircle;
                        if (notif.status === 'approved') {
                          iconColor = 'text-emerald-400';
                          iconBg = 'bg-emerald-400/10';
                        } else {
                          iconColor = 'text-rose-400';
                          iconBg = 'bg-rose-400/10';
                        }
                      } else if (notif.type === 'loan') {
                        Icon = Layers;
                        if (notif.status === 'approved') {
                          iconColor = 'text-amber-400';
                          iconBg = 'bg-amber-400/10 border-amber-500/20 border';
                        } else {
                          iconColor = 'text-rose-400';
                          iconBg = 'bg-rose-400/10';
                        }
                      } else if (notif.type === 'announcement') {
                        Icon = Megaphone;
                        iconColor = 'text-amber-400';
                        iconBg = 'bg-amber-400/10 border border-amber-500/20';
                      } else if (notif.type === 'system') {
                        Icon = ShieldCheck;
                        iconColor = 'text-sky-400';
                        iconBg = 'bg-sky-400/10 border border-sky-500/20';
                      }

                      return (
                        <div
                          key={notif.id}
                          className={`p-3.5 flex gap-3 hover:bg-[#161d2d] transition-colors relative group ${!notif.read ? 'bg-[#182030]/40' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[11px] font-bold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                                {notif.title}
                              </span>
                              <span className="text-[9px] text-slate-500 font-medium shrink-0">
                                {formatNotificationTime(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed pr-12">
                              {notif.message}
                            </p>
                          </div>

                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-[#111622]/90 backdrop-blur rounded px-1">
                            {!notif.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(notif.id);
                                }}
                                className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="p-1 text-rose-400 hover:bg-rose-500/20 rounded transition-colors cursor-pointer"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dropdown Footer: Full activity page shortcut */}
                <div className="px-4 pt-2 border-t border-[#1e2638] text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      onSelectTab('activity');
                    }}
                    className="w-full py-1.5 bg-[#141c2c] hover:bg-[#1a253a] text-amber-400 hover:text-amber-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    View All in Activity Center →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* KYC Status Badge / Button */}
          {userProfile?.verified === true ? (
            <button 
              onClick={() => onSelectTab('verify-account')}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="KYC Verified - Click to review verification"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
            </button>
          ) : (
            <button 
              onClick={() => onSelectTab('verify-account')}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Verify Identity KYC"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Verify KYC
            </button>
          )}

          {/* User Profile Pill & Quick Menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 bg-[#121622] hover:bg-[#182030] border border-[#1e2638] rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              title="Account Menu"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-bold flex items-center justify-center">
                {userName.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-white max-w-[110px] truncate">{userName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111622] border border-[#1e2638] rounded-xl shadow-2xl py-2 z-50 divide-y divide-[#1e2638]">
                <div className="px-4 py-2 space-y-0.5">
                  <div className="text-xs font-bold text-white truncate">{userName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userEmail}</div>
                  <div className="text-[10px] text-amber-400 font-semibold mt-1">
                    Balance: ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => { onSelectTab('settings'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-[#182030] hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" /> Profile & Settings
                  </button>
                  <button
                    onClick={() => { onSelectTab('deposits'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-[#182030] hover:text-emerald-400 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" /> Deposit Funds
                  </button>
                  <button
                    onClick={() => { onSelectTab('withdrawals'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-[#182030] hover:text-rose-400 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5 text-rose-400" /> Withdraw Funds
                  </button>
                  <button
                    onClick={() => { onSelectTab('verify-account'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-[#182030] hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Verify Account (KYC)
                  </button>
                  <button
                    onClick={() => { openSmartsuppChat(); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:bg-[#182030] hover:text-cyan-400 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Live Support Chat
                  </button>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => { signOut(); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Market Ticker Ribbon */}
      <div className="bg-[#0c0f17] border border-[#181f2e] rounded-xl px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-6 text-xs font-mono w-full max-w-full min-w-0">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded">ex</span>
          <span className="text-slate-300 font-sans font-bold">S&P 500 Index</span>
          <span className="text-white font-bold">7,642.9</span>
          <span className="text-rose-400 font-semibold">-29.80 (-0.39%)</span>
        </div>

        <div className="h-3 w-px bg-[#181f2e]"></div>

        <div className="flex items-center gap-2">
          <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded">100</span>
          <span className="text-slate-300 font-sans font-bold">US 100 Cash CFD</span>
          <span className="text-white font-bold">29,349.4</span>
          <span className="text-rose-400 font-semibold">-148.40 (-0.50%)</span>
        </div>

        <div className="h-3 w-px bg-[#181f2e]"></div>

        <div className="flex items-center gap-2">
          <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded">EU</span>
          <span className="text-slate-300 font-sans font-bold">EUR to USD</span>
          <span className="text-white font-bold">1.16318</span>
          <span className="text-emerald-400 font-semibold">+0.00 (+0.06%)</span>
        </div>

        <div className="h-3 w-px bg-[#181f2e]"></div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">₿</span>
          <span className="text-slate-300 font-sans font-bold">Bitcoin</span>
          <span className="text-white font-bold">78,876</span>
          <span className="text-emerald-400 font-semibold">+427 (+0.54%)</span>
        </div>

        <div className="h-3 w-px bg-[#181f2e]"></div>

        <div className="flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Ξ</span>
          <span className="text-slate-300 font-sans font-bold">Ethereum</span>
          <span className="text-white font-bold">2,483.8</span>
          <span className="text-rose-400 font-semibold">-1.2 (-0.05%)</span>
        </div>

        <div className="h-3 w-px bg-[#181f2e]"></div>

        <div className="flex items-center gap-2">
          <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded">100</span>
          <span className="text-slate-300 font-sans font-bold">UK 100</span>
          <span className="text-white font-bold">17,211.5</span>
          <span className="text-emerald-400 font-semibold">+12.4 (+0.07%)</span>
        </div>
      </div>

      {/* Main Dashboard Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN (Width ~ 5 cols out of 12) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Welcome & Portfolio Summary Card */}
          <div className="bg-[#121622] border border-[#1a202c] rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Welcome back,</p>
                <h2 className="text-base font-extrabold text-white mt-0.5">{userName}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onSelectTab('deposits')}
                  className="px-3 py-1 bg-[#181f2e] hover:bg-[#222c42] text-amber-400 border border-amber-400/30 font-bold text-xs rounded-lg transition-all"
                >
                  Connect Wallet
                </button>
                {userProfile?.verified === true ? (
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] rounded-lg">
                    Verified
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-[11px] rounded-lg">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Deposit Balance & Profit/Loss Inner Boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  <div className="w-5 h-5 rounded bg-amber-400/10 text-amber-400 flex items-center justify-center">
                    <Wallet className="w-3 h-3" />
                  </div>
                  DEPOSIT BALANCE
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {formatCurrencyAmount(demoBalance, userProfile?.preferredCurrency)}
                </div>
              </div>

              <div className="bg-[#0b0e17] border border-[#181f2e] p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  <div className="w-5 h-5 rounded bg-emerald-400/10 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  PROFIT / LOSS
                </div>
                <div className="text-xl font-black text-white font-mono">
                  {formatCurrencyAmount(userProfile?.profit ?? userProfile?.demoProfitLoss ?? 0, userProfile?.preferredCurrency)}
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button 
                onClick={() => onSelectTab('deposits')}
                className="py-2.5 bg-[#d9ac36] hover:bg-[#e5b738] text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
              </button>

              <button 
                onClick={() => onSelectTab('withdrawals')}
                className="py-2.5 bg-[#0b0e17] hover:bg-[#181f2e] text-slate-200 border border-[#1a202c] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
              </button>

              <button 
                onClick={() => onSelectTab('trade')}
                className="py-2.5 bg-[#0b0e17] hover:bg-[#181f2e] text-slate-200 border border-[#1a202c] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <BarChart2 className="w-3.5 h-3.5" /> Trade
              </button>
            </div>
          </div>

          {/* 4 Stat Cards Grid (2x2) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Total Profit */}
            <div className="bg-[#121622] border border-[#1a202c] p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL PROFIT</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {formatCurrencyAmount(userProfile?.profit ?? userProfile?.demoProfitLoss ?? 0, userProfile?.preferredCurrency)}
                </div>
              </div>
            </div>

            {/* Card 2: Bonus */}
            <div className="bg-[#121622] border border-[#1a202c] p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BONUS</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {formatCurrencyAmount(userProfile?.bonus ?? userProfile?.signupBonusConverted ?? 0, userProfile?.preferredCurrency)}
                </div>
              </div>
            </div>

            {/* Card 3: Referral Bonus */}
            <div className="bg-[#121622] border border-[#1a202c] p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">REFERRAL BONUS</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {formatCurrencyAmount(userProfile?.referralBonus ?? 0, userProfile?.preferredCurrency)}
                </div>
              </div>
            </div>

            {/* Card 4: Withdrawals */}
            <div className="bg-[#121622] border border-[#1a202c] p-4 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WITHDRAWALS</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {formatCurrencyAmount(0, userProfile?.preferredCurrency)}
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Full-Width Gold Button */}
          <button 
            onClick={() => onSelectTab('trade')}
            className="w-full py-3 bg-[#d9ac36] hover:bg-[#e5b738] text-black font-extrabold text-sm rounded-xl shadow-xl transition-all text-center tracking-wide"
          >
            Trade Now
          </button>

          {/* Connect Wallet Banner */}
          <div className="bg-[#121622] border border-[#1a202c] p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">Connect Wallet</div>
                <div className="text-[11px] text-slate-400">Earn $3,000.00 daily</div>
              </div>
            </div>

            <button 
              onClick={() => onSelectTab('deposits')}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active &gt;
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN (Width ~ 7 cols out of 12) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Market Overview Card */}
          <div className="bg-[#121622] border border-[#1a202c] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span className="text-amber-400">📊</span> Market Overview
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 overflow-x-auto w-full max-w-full min-w-0">
              {/* SPCX Active Gold Card */}
              <div className="bg-[#d9ac36] text-black p-3 rounded-xl flex flex-col justify-between shadow-lg h-20">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">SPCX</span>
                  <span className="text-[10px] font-bold">↑ 2.6%</span>
                </div>
                <div className="text-sm font-black font-mono">$139.98</div>
              </div>

              {/* BTC */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[9px] flex items-center justify-center font-bold">₿</span> BTC
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">↑ 7.2%</span>
                </div>
                <div className="text-xs font-black text-white font-mono">$69,255.00</div>
              </div>

              {/* ETH */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 text-[9px] flex items-center justify-center font-bold">Ξ</span> ETH
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">↑ 17.6%</span>
                </div>
                <div className="text-xs font-black text-white font-mono">$2,250.43</div>
              </div>

              {/* USDT */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] flex items-center justify-center font-bold">₮</span> USDT
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">↑ 0%</span>
                </div>
                <div className="text-xs font-black text-white font-mono">$0.999486</div>
              </div>

              {/* BNB */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-400 text-[9px] flex items-center justify-center font-bold">B</span> BNB
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">↑ 4.2%</span>
                </div>
                <div className="text-xs font-black text-white font-mono">$626.37</div>
              </div>
            </div>
          </div>

          {/* Featured Stocks Card */}
          <div className="bg-[#121622] border border-[#1a202c] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Featured Stocks
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Apple */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#181f2e] text-white flex items-center justify-center font-bold text-xs">
                    
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">Apple Inc.</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">AAPL</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">$260.81</div>
                  <div className="text-[10px] font-bold text-rose-400 font-mono">-0.01%</div>
                </div>
              </div>

              {/* Microsoft */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#181f2e] text-cyan-400 flex items-center justify-center font-bold text-xs">
                    ❖
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">Microsoft Corp.</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">MSFT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">$404.88</div>
                  <div className="text-[10px] font-bold text-rose-400 font-mono">-0.22%</div>
                </div>
              </div>

              {/* Alphabet */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#181f2e] text-emerald-400 flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">Alphabet Inc.</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">GOOGL</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">$308.70</div>
                  <div className="text-[10px] font-bold text-emerald-400 font-mono">+0.54%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Forex Card */}
          <div className="bg-[#121622] border border-[#1a202c] rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Featured Forex
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* EUR/USD */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    EU
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">Euro / US Dollar</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">EUR/USD</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">$1.15418</div>
                  <div className="text-[10px] font-bold text-rose-400 font-mono">-0.27%</div>
                </div>
              </div>

              {/* GBP/USD */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                    UK
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">British Pound / US Dollar</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">GBP/USD</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">$1.33793</div>
                  <div className="text-[10px] font-bold text-rose-400 font-mono">-0.29%</div>
                </div>
              </div>

              {/* USD/JPY */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-[10px]">
                    US
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">US Dollar / Japanese Yen</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">USD/JPY</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">$159.109</div>
                  <div className="text-[10px] font-bold text-emerald-400 font-mono">+0.1%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Plans Card */}
          <div className="bg-[#121622] border border-[#1a202c] rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Investment Portfolios
              </h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                Guaranteed Yield
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Alpha Growth Fund */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3.5 rounded-xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Alpha Arbitrage Fund</h4>
                    <p className="text-[9px] text-slate-400">Targeting market inefficiencies</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-extrabold font-mono">+12.4% APY</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Min. Deposit: <strong className="text-white">$5,000</strong></span>
                  <span className="text-slate-400">Term: <strong className="text-white">90 Days</strong></span>
                </div>
                <button 
                  onClick={() => onSelectTab('deposits')}
                  className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-lg border border-emerald-500/30 transition-all text-center"
                >
                  Allocate Capital
                </button>
              </div>

              {/* Prime Real Estate High-Yield */}
              <div className="bg-[#0b0e17] border border-[#181f2e] p-3.5 rounded-xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Fixed-Yield Treasury</h4>
                    <p className="text-[9px] text-slate-400">Secured government backing</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-extrabold font-mono">+8.7% APY</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Min. Deposit: <strong className="text-white">$1,000</strong></span>
                  <span className="text-slate-400">Term: <strong className="text-white">30 Days</strong></span>
                </div>
                <button 
                  onClick={() => onSelectTab('deposits')}
                  className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-lg border border-emerald-500/30 transition-all text-center"
                >
                  Allocate Capital
                </button>
              </div>
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="bg-[#121622] border border-[#1a202c] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Recent Transactions
              </h3>
              <button 
                onClick={() => onSelectTab('transactions')}
                className="text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
              >
                View All &rarr;
              </button>
            </div>

            <div className="py-8 text-center space-y-2">
              <Folder className="w-10 h-10 text-slate-600 mx-auto stroke-[1.5]" />
              <div className="text-xs font-bold text-slate-400">No Transactions</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
