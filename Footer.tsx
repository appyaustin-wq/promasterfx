import React from 'react';
import { Logo } from '../ui/Logo';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="w-full bg-[#07090e] border-t border-[#1e2638] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" showBadge={true} />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Promaster FX is a premier institutional financial trading platform built for professional execution, strategic portfolio management, and real-time multi-asset technical analysis across Forex, Crypto, Stocks, and Commodities.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 max-w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Institutional Grade Trading Infrastructure</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigateTab && onNavigateTab('markets')} className="hover:text-amber-400 transition-colors">Markets</button></li>
              <li><button onClick={() => onNavigateTab && onNavigateTab('platform')} className="hover:text-amber-400 transition-colors">Trade Terminal</button></li>
              <li><button onClick={() => onNavigateTab && onNavigateTab('about')} className="hover:text-amber-400 transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigateTab && onNavigateTab('faq')} className="hover:text-amber-400 transition-colors">Trading FAQ</button></li>
            </ul>
          </div>

          {/* Asset Classes */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Asset Classes</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Forex Pairs</span></li>
              <li><span className="text-slate-400">Cryptocurrency</span></li>
              <li><span className="text-slate-400">Pre-IPO Shares</span></li>
              <li><span className="text-slate-400">Commodities & Gold</span></li>
              <li><span className="text-slate-400">Global Indices</span></li>
            </ul>
          </div>

          {/* Trading Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Trading Account</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigateTab && onNavigateTab('register')} className="text-amber-400 font-bold hover:underline">Open Trading Account</button></li>
              <li><button onClick={() => onNavigateTab && onNavigateTab('login')} className="hover:text-amber-400 transition-colors">Account Login</button></li>
              <li><span className="text-slate-500">Fast Verification</span></li>
              <li><span className="text-slate-500">Tier-1 Liquidity Access</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-6 border-t border-[#1e2638] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Promaster FX. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Risk Disclosure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
