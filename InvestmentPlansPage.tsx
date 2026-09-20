import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  X,
  Zap,
  HelpCircle
} from 'lucide-react';
import { openSmartsuppChat } from '../../services/smartsupp';

interface InvestmentPlansPageProps {
  onSelectTab?: (tab: string) => void;
}

interface PlanItem {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  priceRange: string;
  returnPercent: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  colorScheme: {
    badgeBg: string;
    badgeText: string;
    border: string;
    btnClass: string;
  };
}

const INVESTMENT_PLANS: PlanItem[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    minPrice: 50,
    maxPrice: 500,
    priceRange: '$50 - $500',
    returnPercent: 'Up to 7% return',
    features: [
      'Up to 7% return',
      'Multi-asset trading',
      'Referral bonus: $0',
      'Email & live chat support'
    ],
    buttonText: 'Choose Starter',
    isPopular: false,
    colorScheme: {
      badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
      badgeText: 'text-slate-300',
      border: 'border-[#1e2638] hover:border-slate-500/40',
      btnClass: 'bg-[#182030] hover:bg-slate-700 text-white border border-[#2e3b52]'
    }
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    minPrice: 500,
    maxPrice: 2000,
    priceRange: '$500 - $2,000',
    returnPercent: 'Up to 13% return',
    features: [
      'Up to 13% return',
      'Multi-asset trading',
      'Referral bonus: $0',
      'Email & live chat support'
    ],
    buttonText: 'Choose Basic',
    isPopular: true,
    colorScheme: {
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeText: 'text-amber-400',
      border: 'border-amber-500/50 shadow-amber-500/5',
      btnClass: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold shadow-lg shadow-amber-500/20'
    }
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    minPrice: 5000,
    maxPrice: 10000,
    priceRange: '$5,000 - $10,000',
    returnPercent: 'Up to 35% return',
    features: [
      'Up to 35% return',
      'Multi-asset trading',
      'Referral bonus: $0',
      'Email & live chat support'
    ],
    buttonText: 'Choose Premium',
    isPopular: false,
    colorScheme: {
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeText: 'text-emerald-400',
      border: 'border-[#1e2638] hover:border-emerald-500/40',
      btnClass: 'bg-[#182030] hover:bg-emerald-500 hover:text-black text-emerald-400 font-bold border border-emerald-500/30'
    }
  }
];

export const InvestmentPlansPage: React.FC<InvestmentPlansPageProps> = ({ onSelectTab }) => {
  const { userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [planSuccess, setPlanSuccess] = useState<boolean>(false);

  const handleChoosePlan = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setPlanSuccess(false);
  };

  const handleConfirmPlan = () => {
    setPlanSuccess(true);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto select-none pb-12 w-full max-w-full min-w-0">
      {/* Header Banner */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Curated Portfolio Strategies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Investment Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Select an institutional portfolio tier to accelerate your capital growth with multi-asset diversification and guaranteed strategy allocation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSelectTab && onSelectTab('deposits')}
            className="px-4 py-2.5 bg-[#182030] hover:bg-[#202b40] text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <span>Deposit Capital</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => openSmartsuppChat()}
            className="px-4 py-2.5 bg-[#141b29] hover:bg-[#1a2336] text-slate-300 border border-[#222d42] text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Consult Advisor</span>
          </button>
        </div>
      </div>

      {/* Active User Plan Pill if configured */}
      {userProfile?.investmentPlan && userProfile.investmentPlan !== 'No Active Plan' && (
        <div className="bg-[#111622] border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Assigned Portfolio</span>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                {userProfile.investmentPlan}
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            Yield calculated and settled automatically per platform schedule.
          </span>
        </div>
      )}

      {/* 3-Column Plan Cards Layout (Desktop 3-col, Mobile Stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {INVESTMENT_PLANS.map((plan) => {
          return (
            <div
              key={plan.id}
              className={`relative bg-[#111622] border ${plan.colorScheme.border} rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                plan.isPopular ? 'ring-2 ring-amber-500/40 bg-gradient-to-b from-[#161c2c] to-[#111622]' : ''
              }`}
            >
              {/* Most Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-lg border border-amber-300/50 flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Most Popular</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Header */}
                <div className="space-y-2 border-b border-[#1e2638] pb-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      {plan.name}
                    </h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${plan.colorScheme.badgeBg}`}>
                      Tier {plan.id === 'starter' ? 'I' : plan.id === 'basic' ? 'II' : 'III'}
                    </span>
                  </div>

                  {/* Price Range */}
                  <div className="pt-2">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {plan.priceRange}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      Investment Capital Requirement
                    </div>
                  </div>
                </div>

                {/* Return Highlight Box */}
                <div className="p-3.5 bg-[#0a0d14] border border-[#1e2638] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Projected Yield:</span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-400 font-mono">
                    {plan.returnPercent}
                  </span>
                </div>

                {/* Feature List */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Plan Specifications
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  type="button"
                  onClick={() => handleChoosePlan(plan)}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${plan.colorScheme.btnClass}`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Details & Confirmation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 sm:p-7 w-full max-w-lg space-y-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {selectedPlan.name} Selection
                  </h3>
                  <p className="text-xs text-slate-400">Review plan parameters and confirm strategy</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#182030] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {planSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Strategy Preference Registered!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    You have selected the <strong className="text-white">{selectedPlan.name}</strong> ({selectedPlan.priceRange}). To fund and activate this portfolio, ensure sufficient deposit capital in your balance.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedPlan(null);
                      if (onSelectTab) onSelectTab('deposits');
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all"
                  >
                    Go to Deposits
                  </button>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="px-4 py-2.5 bg-[#182030] hover:bg-[#202b40] text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Plan Tier:</span>
                    <strong className="text-white">{selectedPlan.name}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Deposit Range:</span>
                    <strong className="text-amber-400">{selectedPlan.priceRange}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Targeted Returns:</span>
                    <strong className="text-emerald-400">{selectedPlan.returnPercent}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Market Coverage:</span>
                    <strong className="text-white">Forex, Crypto, Stocks & Commodities</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300">Included Features:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                    {selectedPlan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    No automated balance deductions occur upon selection. Allocate your chosen deposit balance to begin automated strategy yields.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2638]">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="px-4 py-2.5 bg-[#182030] hover:bg-[#202b40] text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPlan}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Confirm {selectedPlan.name}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
