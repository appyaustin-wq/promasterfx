import React from 'react';
import { MessageSquare } from 'lucide-react';
import { openSmartsuppChat } from '../../services/smartsupp';

export const FloatingSupportButton: React.FC = () => {
  return (
    <button
      onClick={() => openSmartsuppChat()}
      type="button"
      aria-label="Live Support Chat"
      className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-[9999] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-amber-500/40 border border-amber-400/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        position: 'fixed',
        right: '16px',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        zIndex: 9999,
      }}
    >
      <MessageSquare className="w-5 h-5 text-black fill-black/20" />
      <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">Support</span>
    </button>
  );
};
