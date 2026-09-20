import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TradingChart } from '../../components/ui/TradingChart';
import { MarketAsset, OrderDirection, OrderType, AssetCategory } from '../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Layers, 
  RefreshCw 
} from 'lucide-react';

export const TradeCenterPage: React.FC = () => {
  const { markets, userProfile, executeDemoOrder, positions, closeDemoPosition } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState<string>(markets[0]?.symbol || 'BTC/USD');
  const [direction, setDirection] = useState<OrderDirection>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [amountUSD, setAmountUSD] = useState<string>('500');
  const [leverage, setLeverage] = useState<number>(10);
  const [duration, setDuration] = useState<string>('5m');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const selectedAsset: MarketAsset = markets.find(m => m.symbol === selectedSymbol || m.id === selectedSymbol) || markets[0];

  const parsedAmount = parseFloat(amountUSD) || 0;
  const marginRequired = parsedAmount / leverage;
  const availableBalance = userProfile?.demoBalance || 10000;

  const handleExecuteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    if (parsedAmount <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid order amount.' });
      setSubmitting(false);
      return;
    }

    const res = await executeDemoOrder({
      symbol: selectedAsset.symbol,
      assetName: selectedAsset.name,
      category: selectedAsset.category,
      direction,
      orderType,
      quantity: parsedAmount / selectedAsset.price,
      leverage,
      duration,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }

    setSubmitting(false);
  };

  const setPercentageAmount = (pct: number) => {
    const margin = availableBalance * (pct / 100);
    const totalPosValue = margin * leverage;
    setAmountUSD(Math.round(totalPosValue).toString());
  };

  const openPositions = positions.filter(p => p.status === 'open');

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-h-screen box-border">
      {/* Top Banner & Asset Picker */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl w-full max-w-full min-w-0 box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-extrabold text-white truncate">Trade Center (ECN Execution)</h1>
            <p className="text-xs text-slate-400 truncate">High-Speed Electronic Market Execution Terminal</p>
          </div>
        </div>

        {/* Asset Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0 shrink-0">
          <label className="text-xs font-bold text-slate-400 uppercase shrink-0">Select Asset:</label>
          <select
            value={selectedSymbol}
            onChange={e => setSelectedSymbol(e.target.value)}
            className="w-full sm:w-auto bg-[#0a0d14] border border-[#1e2638] text-amber-400 font-bold text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 outline-none focus:border-amber-500 max-w-full truncate"
          >
            {markets.map(m => (
              <option key={m.id} value={m.symbol}>
                {m.symbol} — {m.name} (${m.price.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-full min-w-0">
        {/* Left 2 Cols: Live Chart */}
        <div className="lg:col-span-2 space-y-6 w-full max-w-full min-w-0">
          <TradingChart asset={selectedAsset} />

          {/* Active Positions Table Below Chart */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 w-full max-w-full min-w-0 box-border">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3 w-full max-w-full min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 truncate">
                <Layers className="w-4 h-4 text-amber-400 shrink-0" /> 
                <span>Active Trading Positions</span>
              </h3>
              <span className="text-xs font-bold text-slate-400 shrink-0">{openPositions.length} Open</span>
            </div>

            {openPositions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No active positions. Execute an order on the right panel to initiate live market tracking.
              </div>
            ) : (
              <div className="overflow-x-auto w-full max-w-full min-w-0 scrollbar-none">
                <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2638] text-[10px] font-bold uppercase text-slate-400 bg-[#0d111a]">
                      <th className="p-2.5">Asset</th>
                      <th className="p-2.5">Direction</th>
                      <th className="p-2.5">Entry / Current</th>
                      <th className="p-2.5">Margin (Leverage)</th>
                      <th className="p-2.5">Unrealized P/L</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2638]">
                    {openPositions.map(pos => {
                      const isProfit = pos.pnl >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-[#182030]/50">
                          <td className="p-2.5 font-bold text-white whitespace-nowrap">{pos.symbol}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${pos.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {pos.direction}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono whitespace-nowrap">
                            <div>${pos.entryPrice.toFixed(pos.entryPrice < 10 ? 4 : 2)}</div>
                            <div className="text-white font-bold">${pos.currentPrice.toFixed(pos.currentPrice < 10 ? 4 : 2)}</div>
                          </td>
                          <td className="p-2.5 font-mono whitespace-nowrap">
                            ${pos.margin.toFixed(2)} <span className="text-amber-400 font-bold">({pos.leverage}x)</span>
                          </td>
                          <td className="p-2.5 font-mono font-bold whitespace-nowrap">
                            <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                              {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => closeDemoPosition(pos.id)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold rounded-lg border border-rose-500/20 text-[11px] transition-all"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Order Panel */}
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-xl space-y-5 w-full max-w-full min-w-0 box-border">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-3 w-full max-w-full min-w-0">
            <h2 className="text-base font-extrabold text-white truncate">Order Execution Panel</h2>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
              ECN
            </span>
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 w-full max-w-full min-w-0 ${
              feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className="break-words min-w-0">{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleExecuteOrder} className="space-y-4 w-full max-w-full min-w-0">
            {/* Direction Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#0a0d14] p-1.5 rounded-xl border border-[#1e2638] w-full min-w-0">
              <button
                type="button"
                onClick={() => setDirection('buy')}
                className={`py-2.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 truncate ${
                  direction === 'buy' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" /> 
                <span className="truncate">BUY / LONG</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection('sell')}
                className={`py-2.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 truncate ${
                  direction === 'sell' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4 shrink-0" /> 
                <span className="truncate">SELL / SHORT</span>
              </button>
            </div>

            {/* Order Type */}
            <div className="w-full min-w-0">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Order Type
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638] w-full min-w-0">
                {(['market', 'limit', 'stop'] as OrderType[]).map(ot => (
                  <button
                    key={ot}
                    type="button"
                    onClick={() => setOrderType(ot)}
                    className={`py-1.5 text-xs font-bold rounded-lg uppercase transition-all truncate ${
                      orderType === ot ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ot}
                  </button>
                ))}
              </div>
            </div>

            {/* Leverage Selector */}
            <div className="w-full min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Leverage
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">{leverage}x Margin</span>
              </div>
              <div className="flex bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638] overflow-x-auto scrollbar-none w-full max-w-full min-w-0">
                {[2, 5, 10, 25, 50, 100].map(lev => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setLeverage(lev)}
                    className={`flex-1 min-w-[40px] py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                      leverage === lev ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Duration / Expiry */}
            <div className="w-full min-w-0">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Expiry / Duration
              </label>
              <div className="flex bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638] overflow-x-auto scrollbar-none w-full max-w-full min-w-0">
                {['1m', '5m', '15m', '30m', '1h', '4h', '1d'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`flex-1 min-w-[36px] py-1 text-xs font-bold rounded-lg transition-all shrink-0 ${
                      duration === d ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount USD Input */}
            <div className="w-full min-w-0">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Position Size (USD)
                </label>
                <span className="text-xs text-slate-400">Available: <strong className="text-white">${availableBalance.toFixed(2)}</strong></span>
              </div>
              <div className="relative w-full min-w-0">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={amountUSD}
                  onChange={e => setAmountUSD(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 pl-8 pr-4 text-sm font-mono text-white outline-none min-w-0"
                />
              </div>

              {/* Quick % buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-2 w-full min-w-0">
                {[25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentageAmount(pct)}
                    className="py-1 bg-[#0a0d14] hover:bg-[#182030] border border-[#1e2638] text-[10px] font-bold text-slate-400 hover:text-amber-400 rounded-lg transition-all truncate"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Loss & Take Profit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stop Loss ($)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-rose-500 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none min-w-0"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Take Profit ($)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={takeProfit}
                  onChange={e => setTakeProfit(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-emerald-500 rounded-xl py-2 px-3 text-xs font-mono text-white outline-none min-w-0"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-1.5 text-xs font-mono w-full min-w-0 box-border">
              <div className="flex justify-between text-slate-400 gap-2">
                <span>Execution Price:</span>
                <span className="text-white font-bold truncate">${selectedAsset.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 gap-2">
                <span>Margin Required:</span>
                <span className="text-amber-400 font-bold truncate">${marginRequired.toFixed(2)}</span>
              </div>
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                direction === 'buy' 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20' 
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
              }`}
            >
              {submitting ? 'Executing Order...' : `PLACE ${direction.toUpperCase()} MARKET ORDER`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
