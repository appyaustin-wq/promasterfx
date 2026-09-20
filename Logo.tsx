import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showBadge = false }) => {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  };

  return (
    <div className="flex items-center gap-2 select-none">
      {/* TradexPro Gold Shield Emblem */}
      <div className={`relative ${iconSizes[size]} bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 rounded-lg p-0.5 shadow-md flex items-center justify-center shrink-0`}>
        <div className="w-full h-full bg-[#0a0d14] rounded-[6px] flex items-center justify-center relative overflow-hidden">
          <div className="flex items-end gap-0.5 z-10">
            <div className="w-1 h-2.5 bg-amber-400 rounded-xs"></div>
            <div className="w-1 h-4 bg-yellow-300 rounded-xs"></div>
            <div className="w-1 h-2 bg-amber-500 rounded-xs"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className={`font-black tracking-wider ${sizeClasses[size]} flex items-center text-white font-sans`}>
          PROMASTER <span className="text-amber-400 ml-1.5 font-extrabold tracking-tight">FX</span>
        </div>
        {showBadge && (
          <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400/90 -mt-0.5">
            PLATFORM
          </span>
        )}
      </div>
    </div>
  );
};
