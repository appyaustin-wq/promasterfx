import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DepositRequest, DepositOption } from '../../types';
import { submitDepositRequest, fetchUserDepositRequests, fetchPaymentMethods } from '../../services/adminService';
import { 
  Building2, 
  Coins, 
  CreditCard, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  BarChart2, 
  Briefcase, 
  DollarSign, 
  Layers, 
  Settings, 
  HelpCircle,
  X,
  Upload,
  QrCode,
  ShieldCheck,
  Check
} from 'lucide-react';

interface DepositsPageProps {
  onSelectTab?: (tab: string) => void;
}

export const DepositsPage: React.FC<DepositsPageProps> = ({ onSelectTab }) => {
  const { userProfile, currentUser } = useAuth();

  const [activeModalMethod, setActiveModalMethod] = useState<DepositOption | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [proofText, setProofText] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [depositOptions, setDepositOptions] = useState<DepositOption[]>([]);
  const [loadingMethods, setLoadingMethods] = useState<boolean>(true);

  const [userRequests, setUserRequests] = useState<DepositRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);


  // Load Payment Methods from Firestore
  const loadPaymentMethods = async () => {
    setLoadingMethods(true);
    const methods = await fetchPaymentMethods();
    // Filter enabled methods if set
    setDepositOptions(methods.filter(m => m.enabled !== false));
    setLoadingMethods(false);
  };

  // Load User's Previous Deposit Requests
  const loadUserRequests = async () => {
    if (currentUser?.uid) {
      setLoadingRequests(true);
      const data = await fetchUserDepositRequests(currentUser.uid);
      setUserRequests(data);
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
    loadUserRequests();
  }, [currentUser]);

  const handleTabClick = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
  };

  const handleOpenDepositModal = (option: DepositOption) => {
    setActiveModalMethod(option);
    setDepositAmount('1000');
    setProofText('');
    setCopiedAddress(false);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleSubmitDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalMethod || !currentUser || !userProfile) return;

    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid deposit amount ($ USD).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await submitDepositRequest(
        currentUser.uid,
        userProfile.email,
        userProfile.fullName || userProfile.username,
        activeModalMethod.name,
        activeModalMethod.id,
        val,
        proofText.trim() || `Deposit via ${activeModalMethod.name}`
      );

      setSuccessMsg(`Your deposit request of $${val.toLocaleString()} via ${activeModalMethod.name} has been submitted to the administration team for approval.`);
      loadUserRequests();
      setTimeout(() => {
        setActiveModalMethod(null);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit deposit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 w-full max-w-full min-w-0">
      {/* Top Page Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Fund your account</h1>
      </div>

      {/* Live Market Ticker Ribbon */}
      <div className="bg-[#0b0e17] border border-[#1a2336] rounded-xl px-4 py-2.5 flex items-center gap-6 overflow-x-auto text-xs font-mono scrollbar-none">
        <div className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
          <span>(+0.21%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#f7931a] font-bold">Bitcoin</span>
          <span className="text-white font-bold">79,292</span>
          <span className="text-emerald-400">+843.00 (+1.07%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#627eea] font-bold">Ethereum</span>
          <span className="text-white font-bold">2,499.2</span>
          <span className="text-emerald-400">+14.20 (+0.57%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400">UK 100</span>
          <span className="text-white font-bold">10,678.7</span>
          <span className="text-rose-400">-82.70 (-0.77%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400">S&P 500 Index</span>
          <span className="text-white font-bold">7,646.3</span>
          <span className="text-rose-400">-26.40 (-0.34%)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400">US 100 Cash CFD</span>
          <span className="text-white font-bold">29,357.5</span>
          <span className="text-rose-400">-140.3 (-0.48%)</span>
        </div>
      </div>

      {/* Quick Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'settings', label: 'Account', icon: User },
          { id: 'deposits', label: 'Deposit', icon: ArrowDownCircle, active: true },
          { id: 'withdrawals', label: 'Withdraw', icon: ArrowUpCircle },
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

      {/* Main Section Heading */}
      <div className="pt-2">
        <h2 className="text-2xl font-black text-white tracking-tight">Deposit Funds</h2>
        <p className="text-xs text-slate-400 mt-0.5">Select a payment method to fund your account</p>
      </div>

      {/* Main Grid: Left Column (Deposit Methods) & Right Column (Other Options) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Deposit Methods List (approx 7 cols) */}
        <div className="lg:col-span-7 bg-[#0b0e17] border border-[#1a2336] rounded-2xl p-5 shadow-2xl space-y-4">
          <h3 className="text-sm font-extrabold text-white pb-1 border-b border-[#182033]">
            Deposit Methods
          </h3>

          <div className="space-y-2.5">
            {loadingMethods ? (
              <div className="text-xs text-slate-500 py-6 text-center">Loading payment methods...</div>
            ) : depositOptions.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No active deposit methods available.</div>
            ) : (
              depositOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="p-3 bg-[#0e131f] border border-[#1c2538] hover:border-amber-400/50 rounded-xl transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-black text-sm shrink-0 ${opt.iconBg || 'bg-amber-400/10 border-amber-400/20'} ${opt.iconColor || 'text-amber-400'}`}>
                      {opt.iconType === 'bank' ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <span>{opt.symbol.substring(0, 3)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{opt.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{opt.subtitle}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDepositModal(opt)}
                    className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-lg transition-all shadow-md shrink-0"
                  >
                    Deposit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Other Deposit Options (approx 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0b0e17] border border-[#1a2336] rounded-2xl p-5 shadow-2xl space-y-5">
            <h3 className="text-sm font-extrabold text-white pb-1 border-b border-[#182033]">
              Other Deposit Options
            </h3>

            {/* Sub-card info */}
            <div className="p-4 bg-[#0e131f] border border-[#1c2538] rounded-xl space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Flexible payment methods available
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Once payment is made, send your proof to <span className="text-white font-mono">support@tradexpromarket.com</span>. You will receive payment details via support email.
              </p>
            </div>

            {/* Big full-width button */}
            <button
              type="button"
              onClick={() => {
                if (depositOptions.length > 0) {
                  handleOpenDepositModal(depositOptions[0]);
                }
              }}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all text-center"
            >
              Request Deposit
            </button>
          </div>

          {/* User Pending / History Requests Box */}
          <div className="bg-[#0b0e17] border border-[#1a2336] rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#182033] pb-2">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Deposit Request Status
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{userRequests.length} Requests</span>
            </div>

            {loadingRequests ? (
              <div className="text-xs text-slate-500 py-4 text-center">Loading requests...</div>
            ) : userRequests.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No recent deposit requests</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none pr-1">
                {userRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-[#0e131f] border border-[#1c2538] rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{req.method}</span>
                      <span className="font-black font-mono text-amber-400">${req.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        req.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : req.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      }`}>
                        {req.status === 'pending' ? 'Pending Admin Approval' : req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* DEPOSIT MODAL / POPUP */}
      {activeModalMethod && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e17] border border-[#1a2336] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalMethod(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#182030] transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 border-b border-[#182033] pb-4">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm ${activeModalMethod.iconBg} ${activeModalMethod.iconColor}`}>
                {activeModalMethod.iconType === 'bank' ? (
                  <Building2 className="w-5 h-5" />
                ) : (
                  <span>{activeModalMethod.symbol.substring(0, 3)}</span>
                )}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Deposit via {activeModalMethod.name}</h3>
                <p className="text-xs text-slate-400">Transfer funds and submit proof for admin approval</p>
              </div>
            </div>

            {/* Status Messages */}
            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!successMsg && (
              <form onSubmit={handleSubmitDepositRequest} className="space-y-4">
                {/* Payment Address Box */}
                <div className="p-4 bg-[#0e131f] border border-[#1c2538] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-300">Official Payment Address / Details:</span>
                    <span className="text-[10px] text-amber-400">Instant Verification</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#121828] p-2.5 rounded-lg border border-[#202c44]">
                    <span className="font-mono text-xs text-white break-all flex-1 select-all">
                      {activeModalMethod.address}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(activeModalMethod.address)}
                      className="px-2.5 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-md text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAddress ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Deposit Amount ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="any"
                      min="10"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      className="w-full bg-[#0e131f] border border-[#1c2538] focus:border-amber-400 rounded-xl py-3 pl-8 pr-4 text-sm font-mono text-white outline-none"
                    />
                  </div>
                  {/* Preset Buttons */}
                  <div className="flex gap-2 mt-2">
                    {[500, 1000, 5000, 10000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt.toString())}
                        className="flex-1 py-1 bg-[#121828] hover:bg-[#182136] border border-[#1c2538] text-[11px] font-bold text-slate-300 hover:text-amber-400 rounded-lg transition-all"
                      >
                        +${amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Proof / Transaction Ref */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Payment Proof / Transaction Hash / Reference ID
                  </label>
                  <input
                    type="text"
                    value={proofText}
                    onChange={e => setProofText(e.target.value)}
                    placeholder="e.g. TxHash: 0x98f... or Reference #102938"
                    className="w-full bg-[#0e131f] border border-[#1c2538] focus:border-amber-400 rounded-xl py-2.5 px-3.5 text-xs font-mono text-white outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {loading ? 'Submitting Request...' : 'Submit Deposit Request for Approval'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
