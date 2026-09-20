import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Filter, 
  ArrowUpRight, 
  Zap, 
  Globe, 
  DollarSign 
} from 'lucide-react';

interface MarketsPageProps {
  onSelectTab: (tab: string) => void;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ onSelectTab }) => {
  const { markets, watchlist, toggleWatchlist } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Crypto', 'Forex', 'Stocks', 'Commodities', 'Indices'];

  const filteredMarkets = markets.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const topGainer = [...markets].sort((a, b) => b.change24h - a.change24h)[0];
  const topLoser = [...markets].sort((a, b) => a.change24h - b.change24h)[0];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-h-screen box-border">
      {/* Header Banner */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Live Asset Feed</div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">Promaster FX Markets Catalog</h1>
          <p className="text-xs text-slate-400">Explore and analyze 130+ financial instruments across global exchanges</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSelectTab('watchlist')}
            className="px-4 py-2 bg-[#182030] hover:bg-[#202b40] text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Star className="w-4 h-4 fill-amber-400" /> My Watchlist ({watchlist.length})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-full min-w-0">
        <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-4 shadow-xl min-w-0">
          <div className="text-xs text-slate-400 font-semibold mb-1">Total Assets</div>
          <div className="text-2xl font-black font-mono text-white">{markets.length} Markets</div>
          <div className="text-[11px] text-slate-500 mt-1">Multi-asset catalog</div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-4 shadow-xl min-w-0">
          <div className="text-xs text-slate-400 font-semibold mb-1">Top Gainer</div>
          <div className="text-lg font-bold text-white truncate">{topGainer?.symbol}</div>
          <div className="text-xs font-bold text-emerald-400 font-mono">+{topGainer?.change24h}%</div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-4 shadow-xl min-w-0">
          <div className="text-xs text-slate-400 font-semibold mb-1">Top Loser</div>
          <div className="text-lg font-bold text-white truncate">{topLoser?.symbol}</div>
          <div className="text-xs font-bold text-rose-400 font-mono">{topLoser?.change24h}%</div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-4 shadow-xl min-w-0">
          <div className="text-xs text-slate-400 font-semibold mb-1">24H Trading Volume</div>
          <div className="text-2xl font-black font-mono text-amber-400">$184.2B</div>
          <div className="text-[11px] text-slate-500 mt-1">Across all instruments</div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#111622] border border-[#1e2638] p-3 rounded-2xl shadow-xl w-full max-w-full min-w-0 box-border">
        {/* Category Filter Tabs */}
        <div className="flex bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638] overflow-x-auto scrollbar-none max-w-full min-w-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat 
                  ? 'bg-amber-500 text-black shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search asset symbol..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl w-full max-w-full min-w-0 box-border">
        <div className="overflow-x-auto w-full max-w-full min-w-0 scrollbar-none">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 w-10"></th>
                <th className="py-4 px-4">Asset</th>
                <th className="py-4 px-4">Market Price</th>
                <th className="py-4 px-4">24H Change</th>
                <th className="py-4 px-4">24H High / Low</th>
                <th className="py-4 px-4">Class</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638] text-sm">
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-slate-500">
                    No matching assets found for "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredMarkets.map(m => {
                  const isUp = m.change24h >= 0;
                  const isSaved = watchlist.includes(m.id) || watchlist.includes(m.symbol);

                  return (
                    <tr key={m.id} className="hover:bg-[#182030]/60 transition-colors">
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleWatchlist(m.id)}
                          className="p-1 hover:bg-[#2b374e] rounded transition-colors"
                          title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          <Star className={`w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                        </button>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#1a2333] border border-[#2b374e] flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                            {m.symbol.slice(0, 3)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{m.symbol}</div>
                            <div className="text-xs text-slate-400 truncate">{m.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-white whitespace-nowrap">
                        ${m.price.toLocaleString(undefined, { minimumFractionDigits: m.price < 10 ? 4 : 2 })}
                      </td>
                      <td className="py-4 px-4 font-semibold whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                          {isUp ? '+' : ''}{m.change24h}%
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        <div>H: ${m.high24h.toLocaleString()}</div>
                        <div>L: ${m.low24h.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-4 text-xs whitespace-nowrap">
                        <span className="bg-[#1a2333] text-slate-300 px-2.5 py-1 rounded-md border border-[#2b374e] font-medium">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectTab('trade')}
                          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg transition-all shadow"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
