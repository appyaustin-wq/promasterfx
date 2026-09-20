import React, { useState } from 'react';
import { PRE_IPO_SHARES } from '../../services/marketDataService';
import { useAuth } from '../../context/AuthContext';
import { Rocket, CheckCircle2, AlertCircle } from 'lucide-react';

export const PreIPOSharesPage: React.FC = () => {
  const { userProfile, depositDemoFunds } = useAuth();
  const [selectedShare, setSelectedShare] = useState<typeof PRE_IPO_SHARES[0] | null>(null);
  const [quantity, setQuantity] = useState<string>('10');
  const [purchased, setPurchased] = useState<boolean>(false);

  const handleBuyPreIPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShare) return;
    setPurchased(true);
    setTimeout(() => {
      setPurchased(false);
      setSelectedShare(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Pre-IPO Equity Shares</h1>
            <p className="text-xs text-slate-400">Private-market equity investments in high-growth technology ventures</p>
          </div>
        </div>

        <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-lg border border-amber-500/20">
          Institutional Access
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRE_IPO_SHARES.map(share => (
          <div key={share.id} className="bg-[#111622] border border-[#1e2638] hover:border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-[#182030] border border-[#2b374e] flex items-center justify-center font-black text-amber-400 text-sm">
                  {share.symbol.slice(0, 3)}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  share.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {share.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{share.name}</h3>
                <div className="text-xs text-slate-400 font-mono">{share.symbol}</div>
              </div>

              <div className="p-3 bg-[#0a0d14] rounded-xl border border-[#1e2638] space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Share Price:</span>
                  <span className="text-white font-bold">${share.sharePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Available:</span>
                  <span className="text-amber-400 font-bold">{share.availableShares.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedShare(share)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all mt-4"
            >
              Acquire Pre-IPO Shares
            </button>
          </div>
        ))}
      </div>

      {/* Buy Modal */}
      {selectedShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-lg font-bold text-white">Acquire {selectedShare.name} Pre-IPO Shares</h3>
              <button onClick={() => setSelectedShare(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {purchased ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="text-base font-bold text-white">Pre-IPO Shares Allocated!</div>
                <p className="text-xs text-slate-400">Acquired {quantity} shares of {selectedShare.name} in your client portfolio.</p>
              </div>
            ) : (
              <form onSubmit={handleBuyPreIPO} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Number of Shares
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white font-mono outline-none"
                  />
                </div>

                <div className="p-3 bg-[#0a0d14] rounded-xl border border-[#1e2638] space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Price Per Share:</span>
                    <span className="text-white">${selectedShare.sharePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Cost:</span>
                    <span className="text-amber-400 font-bold">${(selectedShare.sharePrice * (parseFloat(quantity) || 0)).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow"
                >
                  Confirm Pre-IPO Purchase
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
