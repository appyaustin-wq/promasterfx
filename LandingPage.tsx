import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { FloatingSupportButton } from '../../components/ui/FloatingSupportButton';
import heroImage from '../../assets/images/forex_trading_hero_1788992021815.jpg';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ArrowRight, 
  BarChart2, 
  Zap, 
  Lock, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Layers, 
  Sliders,
  DollarSign,
  Globe,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Shield,
  Percent,
  Check,
  X
} from 'lucide-react';

interface LandingPageProps {
  onNavigateTab?: (tab: string) => void;
  onNavigateAuth?: (page: 'login' | 'register' | 'forgot-password') => void;
  onNavigate?: (route: string) => void;
}

interface NotificationItem {
  id: number;
  type: 'WITHDRAWAL PROCESSED' | 'DEPOSIT CONFIRMED' | 'TRADE EXECUTED';
  nameOrCity: string;
  amount: number;
  time: string;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, type: 'WITHDRAWAL PROCESSED', nameOrCity: 'Trader from Amsterdam', amount: 100017, time: '21:20 UTC' },
  { id: 2, type: 'WITHDRAWAL PROCESSED', nameOrCity: 'Trader from London', amount: 45200, time: '14:05 UTC' },
  { id: 3, type: 'WITHDRAWAL PROCESSED', nameOrCity: 'Trader from New York', amount: 89500, time: '09:42 UTC' },
  { id: 4, type: 'DEPOSIT CONFIRMED', nameOrCity: 'Trader from Tokyo', amount: 25000, time: '18:12 UTC' },
  { id: 5, type: 'WITHDRAWAL PROCESSED', nameOrCity: 'Trader from Zurich', amount: 215000, time: '11:30 UTC' },
  { id: 6, type: 'TRADE EXECUTED', nameOrCity: 'Trader from Singapore', amount: 62400, time: '03:15 UTC' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateTab, onNavigateAuth, onNavigate }) => {
  const { markets } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show first notification after 3 seconds
    const initialTimer = setTimeout(() => {
      triggerRandomNotification();
    }, 3000);

    // Then every 30 seconds
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
    // randomize slightly
    const variedAmount = item.amount + Math.floor(Math.random() * 5000);
    setCurrentNotification({ ...item, amount: variedAmount });
    setShowNotification(true);

    // Hide after 6 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 6000);
  };

  const handleNavigateTab = (tab: string) => {
    if (onNavigateTab) onNavigateTab(tab);
    else if (onNavigate) onNavigate(tab);
  };

  const handleNavigateAuth = (page: 'login' | 'register' | 'forgot-password') => {
    if (onNavigateAuth) onNavigateAuth(page);
    else if (onNavigate) onNavigate(page);
  };

  const categories = ['All', 'Crypto', 'Forex', 'Stocks', 'Commodities', 'Indices'];

  const filteredMarkets = selectedCategory === 'All' 
    ? markets.slice(0, 8) 
    : markets.filter(m => m.category.toLowerCase() === selectedCategory.toLowerCase()).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative w-full max-w-full min-w-0 overflow-x-hidden">
      {/* LIVE POPUP NOTIFICATION (Bottom Left) */}
      {showNotification && currentNotification && (
        <div className="fixed bottom-6 left-4 sm:left-6 z-50 animate-bounce duration-300 max-w-[calc(100vw-2rem)]">
          <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 w-full sm:w-80 relative flex items-start gap-3">
            {/* Green active dot */}
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

      {/* 1. HEADER */}
      <Header setActiveTab={handleNavigateTab} onNavigateAuth={handleNavigateAuth} />

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-[#07090e] border-b border-[#1e2638]">
        {/* Background photo overlay */}
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${heroImage})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/90 to-[#07090e] z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Build your portfolio with <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                confidence
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Choose from multiple asset classes including stocks, commodities and digital currencies.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handleNavigateAuth('register')}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-base rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:scale-[1.02] flex items-center gap-2"
              >
                Open Account <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleNavigateTab('markets')}
                className="px-6 py-4 bg-[#111622] hover:bg-[#182030] text-slate-200 border border-[#2b374e] font-bold text-base rounded-xl transition-all hover:border-amber-500/50"
              >
                Learn about our platform &gt;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SUB-BANNER (A platform designed for clarity...) */}
      <section className="bg-amber-500 text-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-black/20 pb-4 md:pb-0 md:pr-6">
            <h3 className="font-extrabold text-base tracking-tight text-black">A platform designed for clarity</h3>
            <p className="text-xs text-black/80 mt-1">Straightforward pricing, reliable execution and the tools you need.</p>
          </div>

          <div className="grid grid-cols-3 md:col-span-3 gap-4 text-center">
            <div className="px-2">
              <div className="text-xs uppercase tracking-wider font-bold text-black/70">Fast</div>
              <div className="text-sm font-extrabold text-black mt-0.5">Order Execution</div>
            </div>
            <div className="px-2 border-x border-black/20">
              <div className="text-xs uppercase tracking-wider font-bold text-black/70">Flexible</div>
              <div className="text-sm font-extrabold text-black mt-0.5">Leverage Options</div>
            </div>
            <div className="px-2">
              <div className="text-xs uppercase tracking-wider font-bold text-black/70">Multi-Asset</div>
              <div className="text-sm font-extrabold text-black mt-0.5">Trading Platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY TRADERS CHOOSE PROMASTER FX & 4 FEATURE CARDS */}
      <section className="py-20 bg-[#07090e] border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Why traders choose Promaster FX</h2>
            <p className="text-slate-400 text-sm">We focus on what matters: transparent conditions, reliable technology and responsive support.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#111622] border border-[#1e2638] hover:border-amber-500/40 rounded-2xl p-6 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Competitive Spreads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We aim to provide tight spreads across major currency pairs and popular instruments so you can focus on your trading strategy.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#111622] border border-[#1e2638] hover:border-amber-500/40 rounded-2xl p-6 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Account Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client funds are held in segregated accounts, and our platform uses SSL encryption and two-factor authentication for added protection.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#111622] border border-[#1e2638] hover:border-amber-500/40 rounded-2xl p-6 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Responsive Platform</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our web-based trading interface provides real-time charts, order management tools and market data in a clean, accessible layout.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#111622] border border-[#1e2638] hover:border-amber-500/40 rounded-2xl p-6 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Transparent Fees</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No hidden charges. Our fee structure is published on our website so you can calculate trading costs before placing an order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MARKET OVERVIEW */}
      <section className="py-16 bg-[#0a0d14] border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">Market overview</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Track prices in real time</h2>
            <p className="text-xs text-slate-400">Monitor live market data, spot trends and identify opportunities across forex, crypto and commodities.</p>
          </div>

          <div className="flex bg-[#111622] p-1 rounded-xl border border-[#1e2638] overflow-x-auto w-fit">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Markets Table Preview */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Asset</th>
                    <th className="py-4 px-4">Market Price</th>
                    <th className="py-4 px-4">24H Change</th>
                    <th className="py-4 px-4">24H High / Low</th>
                    <th className="py-4 px-4">Asset Class</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2638] text-sm">
                  {filteredMarkets.map(m => {
                    const isUp = m.change24h >= 0;
                    return (
                      <tr key={m.id} className="hover:bg-[#182030]/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1a2333] border border-[#2b374e] flex items-center justify-center font-bold text-amber-400 text-xs">
                              {m.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <div className="font-bold text-white">{m.symbol}</div>
                              <div className="text-xs text-slate-400">{m.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-white">
                          ${m.price.toLocaleString(undefined, { minimumFractionDigits: m.price < 10 ? 4 : 2 })}
                        </td>
                        <td className="py-4 px-4 font-semibold">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                            {isUp ? '+' : ''}{m.change24h}%
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-slate-400">
                          <div>H: ${m.high24h.toLocaleString()}</div>
                          <div>L: ${m.low24h.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className="bg-[#1a2333] text-slate-300 px-2.5 py-1 rounded-md border border-[#2b374e] font-medium">
                            {m.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleNavigateAuth('register')}
                            className="px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black font-bold text-xs rounded-lg border border-amber-500/30 transition-all"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GET STARTED IN THREE STEPS & PARTNERS */}
      <section className="py-20 bg-[#07090e] border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Get started in three steps</h2>
            <p className="text-xs text-slate-400">Opening an account is straightforward. Here's what to expect.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-black flex items-center justify-center mx-auto text-sm shadow-lg shadow-amber-500/20">
                1
              </div>
              <h3 className="text-base font-bold text-white">Register your account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete the registration form with your details. We will ask you to verify your identity as part of our compliance process.
              </p>
            </div>

            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-black flex items-center justify-center mx-auto text-sm shadow-lg shadow-amber-500/20">
                2
              </div>
              <h3 className="text-base font-bold text-white">Fund your account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deposit funds using one of our supported payment methods. Your balance will be available once the transaction is confirmed.
              </p>
            </div>

            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-black flex items-center justify-center mx-auto text-sm shadow-lg shadow-amber-500/20">
                3
              </div>
              <h3 className="text-base font-bold text-white">Start trading</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse available markets, analyse charts and place your first trade. Use stop-loss orders to manage your risk.
              </p>
            </div>
          </div>

          {/* Partner Support */}
          <div className="pt-8 text-center space-y-6">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Partner Support</div>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-75 font-bold text-slate-400 text-sm tracking-widest">
              <span className="font-mono text-base tracking-tighter">jumio.</span>
              <span className="tracking-normal font-sans">amazon web services</span>
              <span className="tracking-wider">CLOUDFLARE</span>
              <span className="tracking-tight font-serif">Ledger</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRADE ON THE GO */}
      <section className="py-20 bg-[#0a0d14] border-b border-[#1e2638] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative flex justify-center">
              <div className="w-[300px] h-[360px] bg-gradient-to-tr from-amber-500/20 to-blue-500/20 rounded-3xl absolute blur-2xl"></div>
              <div className="bg-[#121724] border border-[#212c44] rounded-3xl p-4 shadow-2xl relative z-10 w-full max-w-sm space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#212c44] pb-2">
                  <span>EURUSD</span>
                  <span className="text-emerald-400 font-bold">+1.24%</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638]">
                  <span>SELL: 1.17579</span>
                  <span className="text-emerald-400">BUY: 1.17582</span>
                </div>
                <div className="p-3 bg-[#0a0d14] rounded-xl border border-[#1e2638] text-[11px] space-y-1 text-slate-400">
                  <div className="flex justify-between"><span>Watchlists</span><span>Positions</span><span>Orders</span></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white">Trade on the go</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Monitor your positions, place orders and manage your account from your mobile device. Available for iOS and Android.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="px-5 py-3 bg-[#111622] hover:bg-[#1a2233] border border-[#2b374e] rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-3 shadow">
                  <span className="text-lg"></span>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Download on the</div>
                    <div>App Store</div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-[#111622] hover:bg-[#1a2233] border border-[#2b374e] rounded-xl text-xs font-bold text-white cursor-pointer flex items-center gap-3 shadow">
                  <span className="text-lg">▶</span>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Get it on</div>
                    <div>Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ACCOUNT PLANS */}
      <section className="py-20 bg-[#07090e] border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Account <span className="text-amber-400">Plans</span></h2>
            <p className="text-xs text-slate-400">Select a plan that fits your trading goals. You can upgrade at any time as your needs change.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded">Starter</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Starter Plan</h3>
                  <div className="text-sm font-mono font-bold text-amber-400 mt-1">$50 - $500</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-[#1e2638]">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 7% return</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Multi-asset trading</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Referral bonus: $0</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Email & live chat support</li>
                </ul>
              </div>
              <button
                onClick={() => handleNavigateAuth('register')}
                className="w-full py-3 bg-[#182030] hover:bg-amber-500 text-slate-200 hover:text-black font-extrabold text-xs rounded-xl border border-[#2b374e] transition-all"
              >
                Choose Starter
              </button>
            </div>

            {/* Basic Plan (Highlighted) */}
            <div className="bg-[#121826] border-2 border-amber-500/60 rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded">Basic</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Basic Plan</h3>
                  <div className="text-sm font-mono font-bold text-amber-400 mt-1">$500 - $2,000</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-[#1e2638]">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 13% return</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Multi-asset trading</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Referral bonus: $0</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Email & live chat support</li>
                </ul>
              </div>
              <button
                onClick={() => handleNavigateAuth('register')}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                Choose Basic
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded">Premium</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Premium Plan</h3>
                  <div className="text-sm font-mono font-bold text-amber-400 mt-1">$5,000 - $10,000</div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-[#1e2638]">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 35% return</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Multi-asset trading</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Referral bonus: $0</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Email & live chat support</li>
                </ul>
              </div>
              <button
                onClick={() => handleNavigateAuth('register')}
                className="w-full py-3 bg-[#182030] hover:bg-amber-500 text-slate-200 hover:text-black font-extrabold text-xs rounded-xl border border-[#2b374e] transition-all"
              >
                Choose Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <Footer onNavigateTab={handleNavigateTab} />
      <FloatingSupportButton />
    </div>
  );
};
