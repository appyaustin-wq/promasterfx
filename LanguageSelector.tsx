import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
];

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  compact = false,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read existing Google Translate cookie if set
  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return decodeURIComponent(match[2]);
      return null;
    };

    const currentTrans = getCookie('googtrans');
    if (currentTrans) {
      const parts = currentTrans.split('/');
      const targetLang = parts[parts.length - 1];
      const found = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase() === targetLang.toLowerCase());
      if (found) {
        setSelectedLang(found);
      }
    }
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLang(lang);
    setIsOpen(false);

    // 1. Set Google Translate cookies
    const hostname = window.location.hostname;
    const cookieVal = `/en/${lang.code}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (hostname && hostname !== 'localhost') {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
    }

    // 2. Trigger Google Translate native combo if present
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = lang.code;
      combo.dispatchEvent(new Event('change'));
    } else {
      // Reload page if translation combo is not yet loaded into DOM to apply cookie
      window.location.reload();
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className={`relative inline-flex items-center text-xs max-h-10 max-w-[120px] sm:max-w-none shrink-0 ${className}`}
    >
      {/* Sleek Native Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 sm:h-9 px-2 sm:px-2.5 bg-[#121722] hover:bg-[#182030] text-slate-200 border border-[#1e2638] hover:border-amber-500/40 rounded-lg sm:rounded-xl flex items-center gap-1.5 transition-all shadow-sm max-w-full truncate"
        title="Select Language / Translation"
        aria-label="Select Language"
      >
        <span className="text-sm leading-none shrink-0" role="img" aria-label={selectedLang.name}>
          {selectedLang.flag}
        </span>
        <span className="hidden sm:inline font-semibold text-[11px] text-slate-300 truncate max-w-[50px] md:max-w-[70px]">
          {selectedLang.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 sm:w-56 bg-[#111622] border border-[#1e2638] rounded-xl shadow-2xl py-1.5 z-50 max-h-64 overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-[#1e2638] flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Select Language
          </div>

          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-amber-500/10 text-amber-400 font-bold' 
                      : 'text-slate-300 hover:bg-[#182030] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                    <span className="text-[10px] text-slate-500 truncate">({lang.nativeName})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
