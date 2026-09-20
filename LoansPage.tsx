import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, setDoc, doc } from 'firebase/firestore';
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
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ArrowLeft,
  Briefcase,
  Zap,
  Sparkles,
  Shield
} from 'lucide-react';

interface LoansPageProps {
  onSelectTab?: (tab: string) => void;
}

interface LoanPlan {
  id: string;
  name: string;
  rate: string;
  rateType: 'Simple' | 'Compound';
  description: string;
  minAmount: number;
  maxAmount: number;
  minMonths: number;
  maxMonths: number;
  feePercent: number;
  minBalance: number;
  collateralPercent?: number;
}

interface LoanApplication {
  id: string;
  planName: string;
  amount: number;
  durationMonths: number;
  monthlyPayment: number;
  totalRepayment: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
}

const LOAN_PLANS: LoanPlan[] = [
  {
    id: 'trading_margin',
    name: 'Trading Margin Loan',
    rate: '3.50%',
    rateType: 'Simple',
    description: 'Short-term leverage for active traders. Higher amounts, lower rates, designed for quick market opportunities.',
    minAmount: 5000,
    maxAmount: 500000,
    minMonths: 1,
    maxMonths: 12,
    feePercent: 0.50,
    minBalance: 1000
  },
  {
    id: 'personal',
    name: 'Personal Loan',
    rate: '8.00%',
    rateType: 'Compound',
    description: 'General-purpose loan for personal needs. Medium amounts with flexible terms.',
    minAmount: 1000,
    maxAmount: 100000,
    minMonths: 3,
    maxMonths: 36,
    feePercent: 1.00,
    minBalance: 500
  },
  {
    id: 'business_expansion',
    name: 'Business Expansion Loan',
    rate: '6.00%',
    rateType: 'Compound',
    description: 'Long-term financing for business growth and investment expansion.',
    minAmount: 10000,
    maxAmount: 1000000,
    minMonths: 6,
    maxMonths: 60,
    feePercent: 1.50,
    minBalance: 5000,
    collateralPercent: 10.00
  },
  {
    id: 'quick_cash',
    name: 'Quick Cash Loan',
    rate: '12.00%',
    rateType: 'Simple',
    description: 'Small, short-term loan for immediate needs. Fast approval, higher rate.',
    minAmount: 100,
    maxAmount: 10000,
    minMonths: 1,
    maxMonths: 6,
    feePercent: 2.00,
    minBalance: 0
  },
  {
    id: 'portfolio_leverage',
    name: 'Portfolio Leverage Loan',
    rate: '4.50%',
    rateType: 'Compound',
    description: 'Leverage your trading portfolio with competitive rates. Designed for experienced investors.',
    minAmount: 25000,
    maxAmount: 2000000,
    minMonths: 3,
    maxMonths: 24,
    feePercent: 0.75,
    minBalance: 10000,
    collateralPercent: 15.00
  }
];

export const LoansPage: React.FC<LoansPageProps> = ({ onSelectTab }) => {
  const { userProfile, notifications } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [loanDuration, setLoanDuration] = useState<number>(12);
  const [viewMyLoans, setViewMyLoans] = useState<boolean>(false);
  const [myLoans, setMyLoans] = useState<LoanApplication[]>([]);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submittingLoan, setSubmittingLoan] = useState<boolean>(false);

  const userName = userProfile?.fullName || 'Harry Rodrigo';
  const isVerified = userProfile?.verified || false;
  const demoBalance = userProfile?.demoBalance || 0;
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Sync loans from Firestore in real-time
  useEffect(() => {
    if (!userProfile?.uid) return;
    const q = query(collection(db, 'loanRequests'), where('userId', '==', userProfile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: LoanApplication[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          id: data.id,
          planName: data.planName,
          amount: data.amount,
          durationMonths: data.durationMonths,
          monthlyPayment: data.monthlyPayment,
          totalRepayment: data.totalRepayment,
          status: data.status,
          appliedAt: data.appliedAt ? new Date(data.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
        } as LoanApplication);
      });
      // Sort newest first by parsing dates or using raw timestamps if available
      setMyLoans(list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()));
    }, (err) => {
      console.warn('Error syncing loans from Firestore:', err);
    });
    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleNavClick = (tabKey: string) => {
    if (onSelectTab) {
      onSelectTab(tabKey);
    }
  };

  const handleSelectPlan = (plan: LoanPlan) => {
    setSelectedPlan(plan);
    setLoanAmount(plan.minAmount);
    setLoanDuration(plan.minMonths);
    setErrorMsg('');
  };

  // Repayment Calculations
  const calcRateNumber = selectedPlan ? parseFloat(selectedPlan.rate) / 100 : 0.05;
  const totalInterest = selectedPlan ? loanAmount * calcRateNumber * (loanDuration / 12) : 0;
  const processingFee = selectedPlan ? loanAmount * (selectedPlan.feePercent / 100) : 0;
  const totalRepayment = loanAmount + totalInterest + processingFee;
  const monthlyPayment = loanDuration > 0 ? totalRepayment / loanDuration : 0;

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !userProfile) return;

    if (demoBalance < selectedPlan.minBalance) {
      setErrorMsg(`Minimum required account balance for ${selectedPlan.name} is $${selectedPlan.minBalance.toLocaleString()}`);
      return;
    }

    setSubmittingLoan(true);
    const id = 'LN-' + Math.floor(100000 + Math.random() * 900000);
    const newApp = {
      id,
      userId: userProfile.uid,
      userEmail: userProfile.email,
      userName: userProfile.fullName,
      planName: selectedPlan.name,
      amount: loanAmount,
      durationMonths: loanDuration,
      monthlyPayment,
      totalRepayment,
      status: 'Pending',
      appliedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'loanRequests', id), newApp);
      setSuccessMsg(`Loan application for $${loanAmount.toLocaleString()} submitted successfully! Status: Pending Approval.`);
      setSelectedPlan(null);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.warn('Error submitting loan application:', err);
      setErrorMsg('Failed to submit loan application. Please try again.');
    } finally {
      setSubmittingLoan(false);
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto select-none pb-12 w-full max-w-full min-w-0">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d111a] border-b border-[#1b2234] pb-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Apply for Loan</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div 
            onClick={() => handleNavClick('activity')}
            className="relative cursor-pointer p-2 bg-[#141b29] hover:bg-[#1a2336] rounded-lg border border-[#222d42] transition-colors"
            title="View Notifications & Activity"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center px-1 rounded-full border border-[#0d111a]">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Verify KYC Button */}
          <button
            onClick={() => handleNavClick('verify-kyc')}
            className="px-3 py-1.5 bg-[#141b29] hover:bg-amber-500/10 border border-amber-500/50 text-amber-400 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {isVerified ? 'KYC Verified' : 'Verify KYC'}
          </button>

          {/* User Profile Pill */}
          <div 
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-2 bg-[#141b29] border border-[#222d42] rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-[#1a2336] transition-colors"
            title="Account Settings"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center">
              {userName.charAt(0)}
            </div>
            <span className="text-xs font-bold text-white">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Ticker Strip */}
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

      {/* Sub-Navigation Pill Bar (10 Buttons) */}
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

        <button
          onClick={() => handleNavClick('portfolio')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b29] hover:bg-[#1c263b] text-slate-300 font-bold text-xs rounded-lg border border-[#222d42] transition-colors whitespace-nowrap"
        >
          <PieChart className="w-3.5 h-3.5 text-slate-400" /> Portfolio
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

      {/* Main Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Apply for a Loan</h2>
          <p className="text-xs text-slate-400 mt-0.5">Choose a plan, enter your details, and preview your repayment</p>
        </div>

        <button
          onClick={() => setViewMyLoans(!viewMyLoans)}
          className="px-4 py-2 bg-[#141b29] hover:bg-[#1d273a] text-slate-200 font-bold text-xs rounded-xl border border-[#222d42] transition-all shadow-md"
        >
          {viewMyLoans ? '← Back to Loan Plans' : 'My Loans'}
        </button>
      </div>

      {/* Global Toast Alerts */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* VIEW MY LOANS TABLE */}
      {viewMyLoans ? (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" /> My Loan Applications
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total Requests: {myLoans.length}</span>
          </div>

          {myLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-500 border border-dashed border-[#1e2638] rounded-xl space-y-2">
              <DollarSign className="w-10 h-10 mx-auto stroke-1 text-slate-600" />
              <p className="text-xs font-bold text-slate-400">No active loan applications found</p>
              <p className="text-[11px] text-slate-500">Apply for a trading leverage or personal loan to see status updates here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e2638] text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                    <th className="pb-3">Loan ID</th>
                    <th className="pb-3">Plan Name</th>
                    <th className="pb-3">Principal Amount</th>
                    <th className="pb-3">Term</th>
                    <th className="pb-3">Monthly Repayment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2638]/50">
                  {myLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-[#141b29] transition-colors font-mono">
                      <td className="py-3.5 text-white font-bold">{loan.id}</td>
                      <td className="py-3.5 text-slate-200 font-sans font-bold">{loan.planName}</td>
                      <td className="py-3.5 text-emerald-400 font-bold">${loan.amount.toLocaleString()}</td>
                      <td className="py-3.5 text-slate-300">{loan.durationMonths} months</td>
                      <td className="py-3.5 text-white font-bold">${loan.monthlyPayment.toFixed(2)}/mo</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          loan.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          loan.status === 'Pending' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 text-[11px] font-sans">{loan.appliedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* MAIN LOAN APPLICATION LAYOUT (8 COLS LEFT, 4 COLS RIGHT) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: AVAILABLE PLANS */}
          <div className="lg:col-span-8 space-y-4">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              AVAILABLE PLANS
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LOAN_PLANS.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`bg-[#111622] border rounded-2xl p-5 shadow-xl cursor-pointer transition-all space-y-3 relative ${
                      isSelected 
                        ? 'border-amber-400 shadow-amber-500/10 ring-2 ring-amber-400/20 bg-[#161c2b]' 
                        : 'border-[#1e2638] hover:border-slate-600 hover:bg-[#141b29]'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-white">{plan.name}</h3>
                      <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap">
                        {plan.rate} {plan.rateType}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {plan.description}
                    </p>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs font-mono pt-1">
                      <div>
                        <span className="text-slate-500 text-[11px]">Amount: </span>
                        <span className="text-slate-200 font-bold">${plan.minAmount.toLocaleString()} – {plan.maxAmount >= 1000000 ? `${(plan.maxAmount/1000000).toFixed(0)}M` : `${plan.maxAmount.toLocaleString()}`}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Duration: </span>
                        <span className="text-slate-200 font-bold">{plan.minMonths} – {plan.maxMonths} mo</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Fee: </span>
                        <span className="text-slate-200 font-bold">{plan.feePercent.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">Min Balance: </span>
                        <span className="text-slate-200 font-bold">${plan.minBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Collateral Note if present */}
                    {plan.collateralPercent && (
                      <div className="text-[11px] font-bold text-amber-500 pt-1">
                        Requires {plan.collateralPercent.toFixed(2)}% collateral
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: REPAYMENT PREVIEW & YOUR ACCOUNT */}
          <div className="lg:col-span-4 space-y-4">
            {/* Box 1: REPAYMENT PREVIEW */}
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                REPAYMENT PREVIEW
              </div>

              {!selectedPlan ? (
                <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-12 text-center shadow-xl flex items-center justify-center min-h-[220px]">
                  <span className="text-xs text-slate-500 font-medium">
                    Select a loan plan to see the preview.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleApplyLoan} className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
                    <div className="text-xs font-black text-white">{selectedPlan.name}</div>
                    <span className="text-[10px] bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded-full">
                      {selectedPlan.rate}
                    </span>
                  </div>

                  {/* Loan Amount Control */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-slate-300">Loan Amount ($)</label>
                      <span className="font-mono text-emerald-400 font-extrabold">${loanAmount.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={selectedPlan.minAmount}
                      max={selectedPlan.maxAmount}
                      step={selectedPlan.minAmount < 1000 ? 100 : 1000}
                      value={loanAmount}
                      onChange={e => setLoanAmount(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#1e2638] rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>${selectedPlan.minAmount.toLocaleString()}</span>
                      <span>${selectedPlan.maxAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Duration Control */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-slate-300">Term (Months)</label>
                      <span className="font-mono text-amber-400 font-extrabold">{loanDuration} Months</span>
                    </div>
                    <input
                      type="range"
                      min={selectedPlan.minMonths}
                      max={selectedPlan.maxMonths}
                      step={1}
                      value={loanDuration}
                      onChange={e => setLoanDuration(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#1e2638] rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{selectedPlan.minMonths} mo</span>
                      <span>{selectedPlan.maxMonths} mo</span>
                    </div>
                  </div>

                  {/* Breakdown List */}
                  <div className="space-y-2 pt-2 border-t border-[#1e2638] text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Monthly Repayment:</span>
                      <span className="text-white font-bold">${monthlyPayment.toFixed(2)}/mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Interest:</span>
                      <span className="text-amber-400 font-bold">${totalInterest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Processing Fee ({selectedPlan.feePercent}%):</span>
                      <span className="text-slate-300">${processingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#1e2638]">
                      <span className="text-slate-200 font-bold">Total Repayment:</span>
                      <span className="text-emerald-400 font-black text-sm">${totalRepayment.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Submit Loan Application
                  </button>
                </form>
              )}
            </div>

            {/* Box 2: YOUR ACCOUNT */}
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                YOUR ACCOUNT
              </div>

              <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl flex items-center justify-between">
                <span className="text-xs text-slate-400">Balance</span>
                <span className="text-lg font-bold text-white font-mono">
                  ${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
