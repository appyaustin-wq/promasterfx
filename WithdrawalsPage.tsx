import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { WithdrawalRequest } from '../../types';
import { verifyWithdrawalCodeSlot } from '../../services/adminService';
import { 
  Building2, 
  Coins, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  User,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart2,
  Briefcase,
  DollarSign,
  Layers,
  Settings,
  HelpCircle,
  Key,
  ShieldCheck,
  Check
} from 'lucide-react';

interface WithdrawalsPageProps {
  onSelectTab?: (tab: string) => void;
}

interface WithdrawalMethod {
  id: string;
  name: string;
  fee: string;
  min: string;
  minAmount: number;
  iconType: 'bank' | 'crypto';
}

const WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  { id: 'atom', name: 'Atom', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'bank' },
  { id: 'ada', name: 'ADA', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'bank' },
  { id: 'avalanche', name: 'Avalanche', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'bank' },
  { id: 'chainlink', name: 'Chainlink', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'bank' },
  { id: 'hype', name: 'Hype', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'bank' },
  { id: 'xrp', name: 'XRP', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'bank' },
  { id: 'solana', name: 'Solana', fee: '0%', min: '$100.00', minAmount: 100, iconType: 'bank' },
  { id: 'usdt', name: 'USDT', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'crypto' },
  { id: 'bank-transfer', name: 'Bank Transfer', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'bank' },
  { id: 'litecoin', name: 'Litecoin', fee: '$0.00', min: '$10.00', minAmount: 10, iconType: 'crypto' },
  { id: 'ethereum', name: 'Ethereum', fee: '0%', min: '$50.00', minAmount: 50, iconType: 'crypto' },
  { id: 'bitcoin', name: 'Bitcoin', fee: '0%', min: '$10.00', minAmount: 10, iconType: 'crypto' },
];

export const WithdrawalsPage: React.FC<WithdrawalsPageProps> = ({ onSelectTab }) => {
  const { withdrawDemoFunds, userProfile } = useAuth();
  
  const [step, setStep] = useState<number>(1);
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod>(WITHDRAWAL_METHODS[0]);
  
  // Destination Details
  const [accountHolderName, setAccountHolderName] = useState<string>(userProfile?.fullLegalName || '');
  const [financialInstitution, setFinancialInstitution] = useState<string>(userProfile?.financialInstitution || '');
  const [details, setDetails] = useState<string>('');

  const [amount, setAmount] = useState<string>('500');

  // Two-Step Code Verification States
  const [code1, setCode1] = useState<string>('');
  const [code1Verified, setCode1Verified] = useState<boolean>(false);
  const [code1Id, setCode1Id] = useState<string>('');
  const [code1Loading, setCode1Loading] = useState<boolean>(false);

  const [code2, setCode2] = useState<string>('');
  const [code2Verified, setCode2Verified] = useState<boolean>(false);
  const [code2Id, setCode2Id] = useState<string>('');
  const [code2Loading, setCode2Loading] = useState<boolean>(false);

  const [finalSubmitting, setFinalSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [myWithdrawals, setMyWithdrawals] = useState<WithdrawalRequest[]>([]);

  const availableProfit = userProfile?.profit ?? userProfile?.demoProfitLoss ?? 0;

  useEffect(() => {
    if (userProfile?.fullLegalName && !accountHolderName) {
      setAccountHolderName(userProfile.fullLegalName);
    }
    if (userProfile?.financialInstitution && !financialInstitution) {
      setFinancialInstitution(userProfile.financialInstitution);
    }
  }, [userProfile]);

  // Sync withdrawal requests from Firestore in real-time
  useEffect(() => {
    if (!userProfile?.uid) return;
    const q = query(
      collection(db, 'withdrawalRequests'),
      where('userId', '==', userProfile.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: WithdrawalRequest[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as WithdrawalRequest);
      });
      setMyWithdrawals(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (err) => {
      console.warn('Error syncing withdrawal requests:', err);
    });
    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleTabClick = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  const handleNextStep = () => {
    setErrorMsg('');

    if (step === 1 && !selectedMethod) {
      setErrorMsg('Please select a withdrawal method.');
      return;
    }

    if (step === 2) {
      if (!accountHolderName.trim()) {
        setErrorMsg('Account Holder Name is required.');
        return;
      }
      if (!financialInstitution.trim()) {
        setErrorMsg('Bank / Financial Institution is required.');
        return;
      }
      if (!details.trim()) {
        setErrorMsg(`Please enter valid destination account or wallet details for ${selectedMethod.name}.`);
        return;
      }
    }

    if (step === 3) {
      const val = parseFloat(amount);
      if (isNaN(val) || val <= 0) {
        setErrorMsg('Please enter a valid withdrawal amount.');
        return;
      }
      if (val < selectedMethod.minAmount) {
        setErrorMsg(`Minimum withdrawal for ${selectedMethod.name} is ${selectedMethod.min}.`);
        return;
      }
      if (val > availableProfit) {
        setErrorMsg(`Amount exceeds available profit balance ($${availableProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}).`);
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handleVerifyCode1 = async () => {
    setErrorMsg('');
    const clean = code1.trim();
    if (!clean || !/^\d{6}$/.test(clean)) {
      setErrorMsg('Incorrect Authorization Code 1. Please enter a valid 6-digit numeric code.');
      return;
    }

    if (!userProfile) return;
    setCode1Loading(true);

    try {
      const res = await verifyWithdrawalCodeSlot({
        userId: userProfile.uid,
        userEmail: userProfile.email,
        enteredCode: clean,
        slotNumber: 1
      });
      setCode1Verified(true);
      setCode1Id(res.codeDocId);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect Authorization Code 1. Please verify the code and try again.');
    } finally {
      setCode1Loading(false);
    }
  };

  const handleVerifyCode2 = async () => {
    setErrorMsg('');
    const clean = code2.trim();
    if (!clean || !/^\d{6}$/.test(clean)) {
      setErrorMsg('Incorrect Authorization Code 2. Please enter a valid 6-digit numeric code.');
      return;
    }

    if (!userProfile) return;
    setCode2Loading(true);

    try {
      const res = await verifyWithdrawalCodeSlot({
        userId: userProfile.uid,
        userEmail: userProfile.email,
        enteredCode: clean,
        slotNumber: 2
      });
      setCode2Verified(true);
      setCode2Id(res.codeDocId);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect Authorization Code 2. Please verify the code and try again.');
    } finally {
      setCode2Loading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (finalSubmitting) return;
    setErrorMsg('');

    if (!code1Verified || !code2Verified || !code1Id || !code2Id) {
      setErrorMsg('Both Authorization Code 1 and Authorization Code 2 must be verified before submitting.');
      return;
    }

    setFinalSubmitting(true);
    try {
      const val = parseFloat(amount);
      const destinationMethod = `${selectedMethod.name} (${details})`;
      await withdrawDemoFunds(
        val,
        destinationMethod,
        undefined,
        code1Id,
        code2Id,
        accountHolderName.trim(),
        financialInstitution.trim()
      );
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setFinalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 w-full max-w-full min-w-0">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Withdraw Your funds</h1>
      </div>

      {/* Live Market Ticker Ribbon */}
      <div className="bg-[#0b0e17] border border-[#1a2336] rounded-xl px-4 py-2.5 flex items-center gap-6 overflow-x-auto text-xs font-mono scrollbar-none">
        <div className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
          <span>8.20</span>
          <span className="text-[10px]">(+0.06%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400">EUR to USD</span>
          <span className="text-white font-bold">1.16315</span>
          <span className="text-emerald-400">+0.00070 (+0.06%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#f7931a] font-bold">Bitcoin</span>
          <span className="text-white font-bold">79,498</span>
          <span className="text-emerald-400">+1,049.00 (+1.34%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#627eea] font-bold">Ethereum</span>
          <span className="text-white font-bold">2,511.9</span>
          <span className="text-emerald-400">+27.00 (+1.09%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400">UK 100</span>
          <span className="text-white font-bold">10,766.4</span>
          <span className="text-emerald-400">+5.10 (+0.05%)</span>
        </div>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'settings', label: 'Account', icon: User },
          { id: 'deposits', label: 'Deposit', icon: ArrowDownCircle },
          { id: 'withdrawals', label: 'Withdraw', icon: ArrowUpCircle, active: true },
          { id: 'open-trade', label: 'Trade', icon: BarChart2 },
          { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
          { id: 'dashboard', label: 'Positions', icon: Layers },
          { id: 'markets', label: 'Markets', icon: DollarSign },
          { id: 'transactions', label: 'Transactions', icon: DollarSign },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'settings', label: 'Support', icon: HelpCircle }
        ].map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = tab.active;
          return (
            <button
              key={idx}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/10' 
                  : 'bg-[#101624] text-slate-300 hover:bg-[#161e31] hover:text-white border border-[#1d273c]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid Layout: Form Stepper on Left, History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Wizard / Form) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Form Title & Subtitle */}
          <div className="pt-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Request Withdrawal</h2>
            <p className="text-xs text-slate-400 mt-0.5">Withdraw funds from your account</p>
          </div>

          {/* Stepper Header (1 -> 2 -> 3 -> 4) */}
              <div className="relative flex items-center justify-between max-w-lg pt-2">
                <div className="absolute top-[22px] left-8 right-8 h-[2px] bg-[#1e273a] -z-0"></div>
                <div 
                  className="absolute top-[22px] left-8 h-[2px] bg-amber-400 transition-all duration-300 -z-0"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>

                {[
                  { num: 1, label: 'Method' },
                  { num: 2, label: 'Details' },
                  { num: 3, label: 'Amount' },
                  { num: 4, label: 'Verification' }
                ].map((s) => {
                  const isDoneOrActive = step >= s.num;
                  const isCurrent = step === s.num;

                  return (
                    <div key={s.num} className="flex flex-col items-center z-10">
                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                          isDoneOrActive 
                            ? 'bg-amber-400 text-black shadow-amber-400/20' 
                            : 'bg-[#121929] text-slate-500 border border-[#222e47]'
                        }`}
                      >
                        {s.num}
                      </div>
                      <span className={`text-[11px] font-bold mt-2 ${isCurrent ? 'text-amber-400' : 'text-slate-500'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Main Withdrawal Card Container */}
              <div className="bg-[#0b0e17] border border-[#1a2336] rounded-2xl p-6 shadow-2xl space-y-6">
                
                {/* Error Alert */}
                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-400 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">{errorMsg}</span>
                  </div>
                )}

                {/* STEP 1: METHOD SELECTION */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#141b2b] text-amber-400 rounded-xl border border-[#222e47]">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Select Withdrawal Method</h3>
                        <p className="text-xs text-slate-400">Choose how you'd like to receive your funds</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {WITHDRAWAL_METHODS.map((m) => {
                        const isSelected = selectedMethod.id === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMethod(m)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 select-none ${
                              isSelected
                                ? 'bg-[#121928] border-amber-400 text-white shadow-lg shadow-amber-400/5'
                                : 'bg-[#0e131f] border-[#1c2538] text-slate-300 hover:border-slate-600 hover:bg-[#131a2a]'
                            }`}
                          >
                            <div className={`p-2.5 rounded-lg border flex items-center justify-center shrink-0 ${
                              isSelected 
                                ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' 
                                : 'bg-[#141c2e] text-slate-400 border-[#222e47]'
                            }`}>
                              {m.iconType === 'bank' ? (
                                <Building2 className="w-5 h-5" />
                              ) : (
                                <Coins className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate">{m.name}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                Fee: {m.fee} · Min: {m.min}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#182033]">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: DESTINATION DETAILS */}
                {step === 2 && (
                  <div className="space-y-6 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#141b2b] text-amber-400 rounded-xl border border-[#222e47]">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Enter {selectedMethod.name} Payout Details</h3>
                        <p className="text-xs text-slate-400">Provide account holder name, institution, and payout address</p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#111726] border border-[#1d273d] rounded-xl text-xs space-y-1">
                      <div className="text-slate-400">Selected Method: <strong className="text-amber-400">{selectedMethod.name}</strong></div>
                      <div className="text-slate-400">Min Amount: <strong className="text-white">{selectedMethod.min}</strong> · Fee: <strong className="text-emerald-400">{selectedMethod.fee}</strong></div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                          Account Holder Name <span className="text-amber-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={accountHolderName}
                          onChange={e => setAccountHolderName(e.target.value)}
                          placeholder="Full legal name of account holder"
                          className="w-full bg-[#0e131f] border border-[#1c2538] focus:border-amber-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Enter the name exactly as it appears on the receiving account.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                          Bank / Financial Institution <span className="text-amber-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={financialInstitution}
                          onChange={e => setFinancialInstitution(e.target.value)}
                          placeholder="e.g. JPMorgan Chase, Barclays, Fidelity, Binance"
                          className="w-full bg-[#0e131f] border border-[#1c2538] focus:border-amber-400 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Specify the financial institution for payout processing.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                          {selectedMethod.iconType === 'crypto' ? `${selectedMethod.name} Wallet Address` : 'IBAN / Account Number / Wire Details'} <span className="text-amber-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={details}
                          onChange={e => setDetails(e.target.value)}
                          placeholder={selectedMethod.iconType === 'crypto' ? 'e.g. 0x71C... or T9xP82mK...' : 'e.g. GB82 WEST 1234 5678 9012'}
                          className="w-full bg-[#0e131f] border border-[#1c2538] focus:border-amber-400 rounded-xl py-2.5 px-3.5 text-xs font-mono text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#182033]">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-2 bg-[#121929] hover:bg-[#1a2338] text-slate-300 text-xs font-bold rounded-xl border border-[#202b42] flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: AMOUNT */}
                {step === 3 && (
                  <div className="space-y-6 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#141b2b] text-amber-400 rounded-xl border border-[#222e47]">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Enter Withdrawal Amount</h3>
                        <p className="text-xs text-slate-400">Specify funds to withdraw from your available profit balance</p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#111726] border border-[#1d273d] rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-400">Available Profit Balance:</span>
                      <span className="text-base font-black font-mono text-emerald-400">
                        ${availableProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <label className="font-bold text-slate-300">Amount (USD)</label>
                        <span>Minimum: {selectedMethod.min}</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                        <input
                          type="number"
                          step="any"
                          min={selectedMethod.minAmount}
                          max={availableProfit}
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          className="w-full bg-[#0e131f] border border-[#1c2538] focus:border-amber-400 rounded-xl py-3 pl-8 pr-4 text-sm font-mono text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#182033]">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-4 py-2 bg-[#121929] hover:bg-[#1a2338] text-slate-300 text-xs font-bold rounded-xl border border-[#202b42] flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: TWO-STEP CODE VERIFICATION & FINAL CONFIRMATION */}
                {step === 4 && (
                  <div className="space-y-6 max-w-xl">
                    {success ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-extrabold text-white">Withdrawal Request Submitted</h3>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                          Your request of <strong className="text-white">${parseFloat(amount).toLocaleString()}</strong> via <strong className="text-amber-400">{selectedMethod.name}</strong> has been authorized with dual-code security and submitted for administrative approval.
                        </p>
                        <button
                          onClick={() => {
                            setStep(1);
                            setSuccess(false);
                            setDetails('');
                            setCode1('');
                            setCode1Verified(false);
                            setCode1Id('');
                            setCode2('');
                            setCode2Verified(false);
                            setCode2Id('');
                          }}
                          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow transition-all"
                        >
                          Submit Another Request
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#141b2b] text-amber-400 rounded-xl border border-[#222e47]">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                            <div>
                            <h3 className="text-sm font-extrabold text-white">Two-Step Security Authorization Code Verification</h3>
                            <p className="text-xs text-slate-400">Verify two sequential administrative authorization codes</p>
                          </div>
                        </div>

                        {/* STEP 4A: VERIFY CODE 1 */}
                        {!code1Verified && (
                          <div className="p-5 bg-[#111726] border border-[#232f48] rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-amber-400" />
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                  Step 1: Enter Authorization Code 1
                                </h4>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-500/20">
                                Authorization Code 1 Required
                              </span>
                            </div>

                            <p className="text-xs text-slate-300">
                              Please enter your 6-digit <strong>Authorization Code 1</strong> issued by your account administrator.
                            </p>

                            <input
                              type="text"
                              maxLength={6}
                              value={code1}
                              onChange={(e) => setCode1(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="6-digit Authorization Code 1 (e.g. 123456)"
                              className="w-full bg-[#0b0e17] border border-[#24314c] focus:border-amber-400 px-4 py-3 rounded-xl text-center text-lg font-mono tracking-widest text-white font-black placeholder:text-slate-600 outline-none"
                            />

                            <button
                              type="button"
                              disabled={code1Loading || code1.length !== 6}
                              onClick={handleVerifyCode1}
                              className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              {code1Loading ? 'Verifying Authorization Code 1...' : 'Verify Authorization Code 1'}
                            </button>
                          </div>
                        )}

                        {/* STEP 4B: VERIFY CODE 2 */}
                        {code1Verified && !code2Verified && (
                          <div className="space-y-4">
                            {/* Code 1 Success Badge */}
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>Authorization Code 1 Verified</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">Slot 1 Complete</span>
                            </div>

                            <div className="p-5 bg-[#111726] border border-[#232f48] rounded-xl space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Key className="w-4 h-4 text-amber-400" />
                                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                    Step 2: Enter Authorization Code 2
                                  </h4>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-500/20">
                                  Authorization Code 2 Required
                                </span>
                              </div>

                              <p className="text-xs text-slate-300">
                                Enter your 6-digit <strong>Authorization Code 2</strong> to complete security verification.
                              </p>

                              <input
                                type="text"
                                maxLength={6}
                                value={code2}
                                onChange={(e) => setCode2(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="6-digit Authorization Code 2 (e.g. 654321)"
                                className="w-full bg-[#0b0e17] border border-[#24314c] focus:border-amber-400 px-4 py-3 rounded-xl text-center text-lg font-mono tracking-widest text-white font-black placeholder:text-slate-600 outline-none"
                              />

                              <button
                                type="button"
                                disabled={code2Loading || code2.length !== 6}
                                onClick={handleVerifyCode2}
                                className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                {code2Loading ? 'Verifying Authorization Code 2...' : 'Verify Authorization Code 2'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 4C: FINAL CONFIRMATION SUMMARY */}
                        {code1Verified && code2Verified && (
                          <div className="space-y-4">
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Dual Authorization Code Complete (Authorization Code 1 & Authorization Code 2 Verified)</span>
                              </div>
                            </div>

                            <div className="p-4 bg-[#111726] border border-[#1d273d] rounded-xl space-y-3 text-xs font-mono">
                              <div className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#1f2a42]">
                                Final Payout Confirmation Summary
                              </div>
                              <div className="flex justify-between border-b border-[#1f2a42] pb-2 text-slate-400">
                                <span>Requested Amount:</span>
                                <span className="text-white font-bold text-sm">${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between border-b border-[#1f2a42] pb-2 text-slate-400">
                                <span>Account Holder Name:</span>
                                <span className="text-amber-400 font-bold">{accountHolderName}</span>
                              </div>
                              <div className="flex justify-between border-b border-[#1f2a42] pb-2 text-slate-400">
                                <span>Bank / Institution:</span>
                                <span className="text-white font-bold">{financialInstitution}</span>
                              </div>
                              <div className="flex justify-between border-b border-[#1f2a42] pb-2 text-slate-400">
                                <span>Method:</span>
                                <span className="text-slate-300 font-bold">{selectedMethod.name}</span>
                              </div>
                              <div className="flex justify-between text-slate-400 pt-1">
                                <span>Destination Address / Details:</span>
                                <span className="text-emerald-400 font-bold max-w-[220px] truncate">{details}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[#182033]">
                              <button
                                type="button"
                                onClick={() => {
                                  setCode2Verified(false);
                                  setCode2('');
                                }}
                                className="px-4 py-2 bg-[#121929] hover:bg-[#1a2338] text-slate-300 text-xs font-bold rounded-xl border border-[#202b42] flex items-center gap-1.5"
                              >
                                <ArrowLeft className="w-4 h-4" /> Reset Authorization Code 2
                              </button>
                              <button
                                type="button"
                                disabled={finalSubmitting}
                                onClick={handleFinalSubmit}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
                              >
                                {finalSubmitting ? 'Processing...' : 'Confirm & Request Withdrawal'}
                              </button>
                            </div>
                          </div>
                        )}

                        {!code1Verified && (
                          <div className="flex items-center justify-start pt-4 border-t border-[#182033]">
                            <button
                              type="button"
                              onClick={() => setStep(3)}
                              className="px-4 py-2 bg-[#121929] hover:bg-[#1a2338] text-slate-300 text-xs font-bold rounded-xl border border-[#202b42] flex items-center gap-1.5"
                            >
                              <ArrowLeft className="w-4 h-4" /> Back to Amount
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

              </div>

        </div>

        {/* Right Column: Active and Past Withdrawal Requests */}
        <div className="bg-[#0b0e17] border border-[#1a2336] rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-amber-400" />
              Withdrawal History
            </h3>
            <p className="text-[10px] text-slate-400">Track and view the status of your payouts</p>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 divide-y divide-[#182030] scrollbar-thin">
            {myWithdrawals.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No withdrawals requested yet.
              </div>
            ) : (
              myWithdrawals.map((req) => {
                let statusColor = 'text-amber-400 bg-amber-400/10 border-amber-500/20';
                if (req.status === 'approved') {
                  statusColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
                } else if (req.status === 'rejected') {
                  statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                }

                return (
                  <div key={req.id} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white">
                        ${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {req.withdrawalCodeVerified && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/10 border border-amber-500/20 text-amber-300 flex items-center gap-1">
                            <Key className="w-2.5 h-2.5" /> Code Verified
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Method: <strong className="text-slate-300">{req.method.split(' (')[0]}</strong></span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    {(req.accountHolderName || req.financialInstitution) && (
                      <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                        {req.accountHolderName && <div>Holder: <strong className="text-slate-200">{req.accountHolderName}</strong></div>}
                        {req.financialInstitution && <div>Bank: <strong className="text-slate-200">{req.financialInstitution}</strong></div>}
                      </div>
                    )}
                    {req.notes && (
                      <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg text-[10px] text-rose-300">
                        <strong>Reason:</strong> {req.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
