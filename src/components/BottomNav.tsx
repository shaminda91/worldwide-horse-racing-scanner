import React from 'react';
import { Award, Camera, MapPin, Bookmark } from 'lucide-react';
import { Language } from '../types/racing';
import { getTranslation } from '../locales/translations';

interface BottomNavProps {
  currentLang: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentLang,
  activeTab,
  setActiveTab,
  savedCount,
}) => {
  const t = getTranslation(currentLang);

  const navItems = [
    {
      id: 'results',
      label: t.navResults,
      icon: Award,
    },
    {
      id: 'scanner',
      label: t.navScanner,
      icon: Camera,
      highlight: true,
    },
    {
      id: 'tracks',
      label: t.navTracks,
      icon: MapPin,
    },
    {
      id: 'saved',
      label: t.navSaved,
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#091811] border-t border-[#163628] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 cursor-pointer"
              >
                <div
                  className={`w-11 h-11 -mt-4 rounded-full flex items-center justify-center transition-colors shadow-md ${
                    isActive
                      ? 'bg-[#0e6245] text-white border-2 border-[#34d399]'
                      : 'bg-[#123626] hover:bg-[#1a4a34] text-white border border-[#235840]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-tight mt-0.5 whitespace-nowrap ${
                    isActive ? 'text-[#34d399]' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 cursor-pointer transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#34d399] stroke-[2.2]' : 'text-slate-400 hover:text-white'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-[#0e6245] text-white border border-[#1b8863] rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap ${
                  isActive ? 'text-[#34d399] font-bold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
