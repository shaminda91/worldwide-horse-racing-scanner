import React from 'react';
import { Camera, Languages } from 'lucide-react';
import { Language } from '../types/racing';
import { getTranslation } from '../locales/translations';

interface HeaderProps {
  currentLang: Language;
  onToggleLang: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onToggleLang,
  activeTab,
  setActiveTab,
}) => {
  const t = getTranslation(currentLang);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a1c14] border-b border-[#163829]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand Zone - Clean Nelson Sporting Star Wordmark */}
        <button
          onClick={() => setActiveTab('results')}
          className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer focus-visible:outline-none"
        >
          {/* Simple solid green & blue emblem */}
          <div className="w-8 h-8 rounded-lg bg-[#0e4835] border border-[#1b6b50] flex items-center justify-center font-black text-white text-sm">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              Nelson <span className="text-[#38bdf8]">Sporting</span> <span className="text-[#34d399]">Star</span>
            </span>
            <span className="text-[10px] text-slate-300 font-medium hidden sm:inline -mt-0.5">
              {currentLang === 'si' ? 'අශ්ව රේස් සජීවී ප්‍රතිඵල' : 'Horse Racing Results & Live Cards'}
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links (Simple, solid, no AI gradients) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('results')}
            className={`cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'results' ? 'text-white font-bold border-b-2 border-[#10b981] pb-1' : 'hover:text-white'
            }`}
          >
            {t.navResults}
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'scanner' ? 'text-white font-bold border-b-2 border-[#2563eb] pb-1' : 'hover:text-white'
            }`}
          >
            {t.navScanner}
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'tracks' ? 'text-white font-bold border-b-2 border-[#10b981] pb-1' : 'hover:text-white'
            }`}
          >
            {t.navTracks}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'saved' ? 'text-white font-bold border-b-2 border-[#2563eb] pb-1' : 'hover:text-white'
            }`}
          >
            {t.navSaved}
          </button>
        </nav>

        {/* Action Controls - Language & Scan Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Simple Language Toggle */}
          <button
            onClick={onToggleLang}
            aria-label="Toggle language between Sinhala and English"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d2a1f] hover:bg-[#12382a] border border-[#1d4d3a] text-xs font-semibold text-white transition-colors cursor-pointer min-h-[38px]"
          >
            <Languages className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="whitespace-nowrap">
              {currentLang === 'si' ? 'English' : 'සිංහල'}
            </span>
          </button>

          {/* Solid Green Camera Button (Native sports look) */}
          <button
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e6245] hover:bg-[#117553] text-white font-semibold text-xs border border-[#1b8863] transition-colors cursor-pointer min-h-[38px]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap hidden xs:inline">
              {currentLang === 'si' ? 'ස්කෑන්' : 'Scan'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
