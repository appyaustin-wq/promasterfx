import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Search, 
  Filter, 
  TrendingUp, 
  Eye, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Layers,
  ArrowUpRight,
  Flame,
  Award,
  DollarSign
} from 'lucide-react';

interface NFTMarketPageProps {
  onSelectTab?: (tab: string) => void;
}

interface NFTItem {
  id: string;
  name: string;
  collection: string;
  tokenId: string;
  category: 'Yield Passes' | 'Quant Keys' | 'Meta Estates' | 'Derivatives' | 'Genesis';
  priceEth: number;
  priceUsd: number;
  change24h: number;
  highestBidEth: number;
  rarity: 'Institutional' | 'Legendary' | 'Epic' | 'Rare';
  imageGradient: string;
  iconSymbol: string;
  description: string;
  benefits: string[];
}

const NFT_ITEMS: NFTItem[] = [
  {
    id: 'nft-1',
    name: 'Promaster Alpha Pass #088',
    collection: 'Promaster Genesis Key',
    tokenId: '#0088',
    category: 'Genesis',
    priceEth: 2.45,
    priceUsd: 6150.00,
    change24h: 8.4,
    highestBidEth: 2.30,
    rarity: 'Institutional',
    imageGradient: 'from-amber-500 via-amber-600 to-yellow-700',
    iconSymbol: '👑',
    description: 'Tier-1 Institutional Pass unlocking VIP low-spread execution, automated alpha trading bots, and zero-fee withdrawal routing.',
    benefits: ['0.00% maker trading fees', 'Direct access to institutional liquidity pools', 'Priority OTC order routing']
  },
  {
    id: 'nft-2',
    name: 'Quant Momentum Algorithm #104',
    collection: 'High-Frequency Nodes',
    tokenId: '#0104',
    category: 'Quant Keys',
    priceEth: 1.15,
    priceUsd: 2888.00,
    change24h: 14.2,
    highestBidEth: 1.05,
    rarity: 'Legendary',
    imageGradient: 'from-cyan-500 via-blue-600 to-indigo-800',
    iconSymbol: '⚡',
    description: 'On-chain algorithmic execution node that scans multi-exchange arbitrage gaps with sub-millisecond automated order placement.',
    benefits: ['Dynamic volatility hedging', 'Sub-millisecond API access', 'Real-time arbitrage signal feed']
  },
  {
    id: 'nft-3',
    name: 'Perpetual Yield Vault Key #012',
    collection: 'Treasury Yield Pass',
    tokenId: '#0012',
    category: 'Yield Passes',
    priceEth: 3.80,
    priceUsd: 9540.00,
    change24h: 3.1,
    highestBidEth: 3.65,
    rarity: 'Institutional',
    imageGradient: 'from-emerald-500 via-teal-600 to-slate-900',
    iconSymbol: '💎',
    description: 'Autonomous treasury yield token paying daily compounded staking rewards across sovereign bond and DeFi liquidity pools.',
    benefits: ['18.5% Base APY distribution', 'Daily compounding to trading equity', 'Instant collateral liquidation rights']
  },
  {
    id: 'nft-4',
    name: 'Zurich Financial Hub District #4',
    collection: 'Promaster Virtual Districts',
    tokenId: '#0402',
    category: 'Meta Estates',
    priceEth: 0.95,
    priceUsd: 2386.00,
    change24h: -1.8,
    highestBidEth: 0.88,
    rarity: 'Epic',
    imageGradient: 'from-purple-600 via-pink-600 to-rose-900',
    iconSymbol: '🏛️',
    description: 'Virtual financial exchange district generating passive revenue share from trading terminal transaction volumes.',
    benefits: ['0.05% platform trading fee dividend', 'Private VIP meeting lounge access', 'Exclusive market maker rights']
  },
  {
    id: 'nft-5',
    name: 'Synthetic Gold Derivative #55',
    collection: 'Commodity Synthetics',
    tokenId: '#0055',
    category: 'Derivatives',
    priceEth: 1.40,
    priceUsd: 3516.00,
    change24h: 4.6,
    highestBidEth: 1.35,
    rarity: 'Rare',
    imageGradient: 'from-yellow-500 via-amber-700 to-stone-900',
    iconSymbol: '🪙',
    description: 'Fully audited asset-backed fractional synthetic contract representing 1.5 troy ounces of LBMA-certified London bullion.',
    benefits: ['100% physical gold vault audit verification', 'Fractional transferability', 'Instant collateral margin utility']
  },
  {
    id: 'nft-6',
    name: 'Deep Neural Sentiment Model #7',
    collection: 'High-Frequency Nodes',
    tokenId: '#0007',
    category: 'Quant Keys',
    priceEth: 2.10,
    priceUsd: 5275.00,
    change24h: 18.9,
    highestBidEth: 1.95,
    rarity: 'Legendary',
    imageGradient: 'from-rose-500 via-purple-700 to-indigo-950',
    iconSymbol: '🧠',
    description: 'AI sentiment model trained on global macroeconomic news feeds, order books, and institutional options flow.',
    benefits: ['Pre-market breakout probability scoring', 'Real-time whale wallet flow radar', 'High-confidence trade trigger alerts']
  }
];

export const NFTMarketPage: React.FC<NFTMarketPageProps> = ({ onSelectTab }) => {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNft, setSelectedNft] = useState<NFTItem | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

  const categories = ['All', 'Genesis', 'Quant Keys', 'Yield Passes', 'Meta Estates', 'Derivatives'];

  const filteredNfts = NFT_ITEMS.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tokenId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAcquire = (nft: NFTItem) => {
    setSelectedNft(nft);
    setPurchaseSuccess(false);
  };

  const handleConfirmPurchase = () => {
    setPurchaseSuccess(true);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none pb-12 w-full max-w-full min-w-0">
      {/* Header Banner */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Digital Asset Derivatives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NFT & Digital Asset Market
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Acquire and trade institutional utility tokens, automated yield passes, algorithmic quant keys, and fractional digital asset contracts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSelectTab && onSelectTab('portfolio')}
            className="px-4 py-2.5 bg-[#182030] hover:bg-[#202b40] text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <span>My Portfolio</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-4 shadow-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>24H Volume</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">$3,840,500</div>
          <div className="text-[11px] text-emerald-400 font-bold">+12.4% vs last week</div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-4 shadow-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Floor Index</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">1.85 ETH</div>
          <div className="text-[11px] text-slate-400 font-medium">~$4,640.00 USD</div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-4 shadow-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Curated Assets</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">48 Verified</div>
          <div className="text-[11px] text-slate-400 font-medium">Smart contract audited</div>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-4 shadow-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>Active Traders</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">1,290</div>
          <div className="text-[11px] text-emerald-400 font-bold">+94 new today</div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl">
        {/* Category Filter Tabs */}
        <div className="flex bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638] overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
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
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets or contracts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* NFT Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNfts.map((nft) => {
          const isPositive = nft.change24h >= 0;
          return (
            <div
              key={nft.id}
              className="bg-[#111622] border border-[#1e2638] hover:border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Visual Header / Avatar Banner */}
                <div className={`w-full h-44 rounded-xl bg-gradient-to-tr ${nft.imageGradient} p-4 flex flex-col justify-between shadow-inner relative overflow-hidden group`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-2xl drop-shadow-md">{nft.iconSymbol}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-sm ${
                      nft.rarity === 'Institutional' ? 'bg-amber-500 text-black border-amber-300' :
                      nft.rarity === 'Legendary' ? 'bg-purple-600 text-white border-purple-400' :
                      nft.rarity === 'Epic' ? 'bg-blue-600 text-white border-blue-400' :
                      'bg-slate-800 text-slate-200 border-slate-600'
                    }`}>
                      {nft.rarity}
                    </span>
                  </div>

                  <div className="z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-white tracking-wide">{nft.tokenId}</span>
                    <span className="text-[10px] font-bold text-amber-300 uppercase">{nft.category}</span>
                  </div>
                </div>

                {/* NFT Details */}
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide truncate">
                    {nft.collection}
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {nft.name}
                  </h3>
                </div>

                {/* Price Information */}
                <div className="p-3 bg-[#0a0d14] rounded-xl border border-[#1e2638] flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Floor Price</span>
                    <div className="text-sm font-black text-white">{nft.priceEth} ETH</div>
                    <span className="text-[10px] text-slate-400 font-sans">${nft.priceUsd.toLocaleString()} USD</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">24h Shift</span>
                    <div className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{nft.change24h}%
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans">Bid: {nft.highestBidEth} ETH</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleAcquire(nft)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Acquire Asset</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Acquisition Modal */}
      {selectedNft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 sm:p-7 w-full max-w-lg space-y-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
                  {selectedNft.iconSymbol}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {selectedNft.name}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedNft.collection} • {selectedNft.tokenId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNft(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#182030] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {purchaseSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Order Executed Successfully!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    You have successfully acquired <strong className="text-white">{selectedNft.name}</strong>. The asset ownership has been assigned to your institutional client wallet.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedNft(null);
                      if (onSelectTab) onSelectTab('portfolio');
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all"
                  >
                    View in Portfolio
                  </button>
                  <button
                    onClick={() => setSelectedNft(null)}
                    className="px-4 py-2.5 bg-[#182030] hover:bg-[#202b40] text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedNft.description}
                </p>

                <div className="p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Floor Valuation:</span>
                    <strong className="text-white">{selectedNft.priceEth} ETH (${selectedNft.priceUsd.toLocaleString()} USD)</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Smart Contract Category:</span>
                    <strong className="text-amber-400">{selectedNft.category}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Rarity Grade:</span>
                    <strong className="text-emerald-400">{selectedNft.rarity}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300">Contract Utility Benefits:</div>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    {selectedNft.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    Acquisition is routed via Promaster FX Institutional Custody. Your assets are stored in cold storage multisig vaults.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2638]">
                  <button
                    type="button"
                    onClick={() => setSelectedNft(null)}
                    className="px-4 py-2.5 bg-[#182030] hover:bg-[#202b40] text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Confirm Acquisition ({selectedNft.priceEth} ETH)
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
