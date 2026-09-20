import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layers, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PositionsPage: React.FC = () => {
  const { positions, closeDemoPosition } = useAuth();
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open');

  const filtered = positions.filter(p => {
    if (filter === 'open') return p.status === 'open';
    if (filter === 'closed') return p.status === 'closed';
    return true;
  });

  const openCount = positions.filter(p => p.status === 'open').length;
  const closedCount = positions.filter(p => p.status === 'closed').length;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-h-screen box-border">
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">Positions Management</h1>
          <p className="text-xs text-slate-400">Track active and settled positions, margin allocation, and unrealized P/L</p>
        </div>

        <div className="flex bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638] overflow-x-auto scrollbar-none shrink-0 max-w-full">
          <button
            onClick={() => setFilter('open')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${filter === 'open' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${filter === 'closed' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Closed ({closedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${filter === 'all' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
          >
            All ({positions.length})
          </button>
        </div>
      </div>

      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl w-full max-w-full min-w-0 box-border">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500 space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No positions found under "{filter}" filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full max-w-full min-w-0 scrollbar-none">
            <table className="w-full min-w-[750px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4">Asset</th>
                  <th className="py-4 px-4">Direction</th>
                  <th className="py-4 px-4">Entry Price</th>
                  <th className="py-4 px-4">Current Price</th>
                  <th className="py-4 px-4">Margin & Leverage</th>
                  <th className="py-4 px-4">P/L ($ / %)</th>
                  <th className="py-4 px-4">Opened At</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638] text-xs">
                {filtered.map(pos => {
                  const isProfit = pos.pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-[#182030]/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        <div>{pos.symbol}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{pos.assetName}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] ${
                          pos.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {pos.direction}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        ${pos.entryPrice.toFixed(pos.entryPrice < 10 ? 4 : 2)}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-white">
                        ${pos.currentPrice.toFixed(pos.currentPrice < 10 ? 4 : 2)}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        <div>${pos.margin.toFixed(2)}</div>
                        <div className="text-amber-400 font-bold">{pos.leverage}x Leverage</div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-sm">
                        <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(pos.openedAt).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {pos.status === 'open' ? (
                          <button
                            onClick={() => closeDemoPosition(pos.id)}
                            className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold rounded-lg border border-rose-500/20 transition-all text-xs"
                          >
                            Close Position
                          </button>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">Closed</span>
                        )}
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
  );
};
