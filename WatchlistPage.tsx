import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Star, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

interface WatchlistPageProps {
  onSelectTab: (tab: string) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({ onSelectTab }) => {
  const { markets, watchlist, toggleWatchlist } = useAuth();

  const watchlistMarkets = markets.filter(m => watchlist.includes(m.id) || watchlist.includes(m.symbol));

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Saved Market Watchlist</h1>
          <p className="text-xs text-slate-400">Quick-access view for your favorite trading pairs and market feeds</p>
        </div>

        <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-lg border border-amber-500/20">
          {watchlistMarkets.length} Items Saved
        </span>
      </div>

      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
        {watchlistMarkets.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500 space-y-3">
            <Star className="w-8 h-8 text-slate-600 mx-auto" />
            <p>Your watchlist is currently empty.</p>
            <button
              onClick={() => onSelectTab('markets')}
              className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl shadow"
            >
              Browse Markets Catalog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4 w-10"></th>
                  <th className="py-4 px-4">Asset</th>
                  <th className="py-4 px-4">Market Price</th>
                  <th className="py-4 px-4">24H Change</th>
                  <th className="py-4 px-4">24H High / Low</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638] text-sm">
                {watchlistMarkets.map(m => {
                  const isUp = m.change24h >= 0;
                  return (
                    <tr key={m.id} className="hover:bg-[#182030]/60 transition-colors">
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleWatchlist(m.id)}
                          className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
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
                      <td className="py-4 px-4 text-xs font-medium text-slate-300">
                        {m.category}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onSelectTab('trade')}
                          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg shadow transition-all"
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
        )}
      </div>
    </div>
  );
};
