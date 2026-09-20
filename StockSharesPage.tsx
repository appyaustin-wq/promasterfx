import React from 'react';
import { STOCK_SHARES } from '../../services/marketDataService';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface StockSharesPageProps {
  onSelectTab: (tab: string) => void;
}

export const StockSharesPage: React.FC<StockSharesPageProps> = ({ onSelectTab }) => {
  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Fractional Stock Equities</h1>
            <p className="text-xs text-slate-400">Trade fractional shares of top global tech, aviation, and financial conglomerates</p>
          </div>
        </div>

        <span className="text-xs bg-blue-500/10 text-blue-400 font-bold px-3 py-1 rounded-lg border border-blue-500/20">
          12 Blue Chip Stocks
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STOCK_SHARES.map(stock => {
          const isUp = stock.change24h >= 0;
          return (
            <div key={stock.id} className="bg-[#111622] border border-[#1e2638] hover:border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{stock.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{stock.symbol}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{stock.name}</div>
                  </div>
                </div>

                <span className={`text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{stock.change24h}%
                </span>
              </div>

              <div className="text-xl font-bold font-mono text-white">
                ${stock.price.toFixed(2)}
              </div>

              <button
                onClick={() => onSelectTab('trade')}
                className="w-full py-2 bg-[#182030] hover:bg-amber-500 text-slate-300 hover:text-black font-bold text-xs rounded-xl border border-[#2b374e] transition-all"
              >
                Trade Fractional Shares
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
