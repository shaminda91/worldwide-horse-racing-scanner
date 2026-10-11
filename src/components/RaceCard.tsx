import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { RaceFixture, Language } from '../types/racing';
import { getTranslation } from '../locales/translations';

interface RaceCardProps {
  race: RaceFixture;
  currentLang: Language;
  onScanRaceShortcut: (race: RaceFixture) => void;
}

export const RaceCard: React.FC<RaceCardProps> = ({
  race,
  currentLang,
  onScanRaceShortcut,
}) => {
  const t = getTranslation(currentLang);
  const [expanded, setExpanded] = useState<boolean>(false);

  const isFinished = race.status === 'FINISHED';
  const isLive = race.status === 'LIVE';

  return (
    <div className="bg-[#0b1c14] border border-[#163828] rounded-2xl p-4 transition-colors hover:border-[#1e4d37]">
      {/* Top Header: Unboxed metadata (like SaddlePro / Racing Post) */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-300 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-base">{race.flag}</span>
          <span className="font-bold text-white">
            {currentLang === 'si' ? race.trackSi : race.track}
          </span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span>Race {race.raceNumber}</span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span>{race.distance}</span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span className="text-slate-300">{currentLang === 'si' ? race.goingSi : race.going}</span>
        </div>

        {/* Live / Finished status badge (Simple solid, no AI gradient) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isLive && (
            <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
          )}
          <span
            className={`text-xs font-bold tracking-tight uppercase ${
              isLive
                ? 'text-[#60a5fa]'
                : isFinished
                ? 'text-[#34d399]'
                : 'text-slate-300'
            }`}
          >
            {isLive ? t.statusLive : isFinished ? t.statusFinished : t.statusUpcoming}
          </span>
        </div>
      </div>

      {/* Primary Race Title & Time */}
      <div className="flex items-baseline justify-between gap-4 mb-2.5">
        <h3 className="text-base font-bold text-white tracking-tight">
          {currentLang === 'si' ? race.nameSi : race.name}
        </h3>
        <span className="text-xs font-mono font-bold text-[#38bdf8] shrink-0">
          {race.time}
        </span>
      </div>

      {/* Editorial Race Summary */}
      <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
        {currentLang === 'si' ? race.summarySi : race.summaryEn}
      </p>

      {/* Top Finishers / Runners Table (Clean native mobile rows) */}
      <div className="space-y-1.5 mb-3.5">
        {race.runners.slice(0, expanded ? race.runners.length : 3).map((runner) => {
          const isWinner = runner.finishPosition === 1;

          return (
            <div
              key={runner.number}
              className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                isWinner
                  ? 'bg-[#0f2c1f] border border-[#1c553c] text-white'
                  : 'bg-[#08150f] border border-[#133023] text-slate-200'
              }`}
            >
              {/* Runner Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-5 font-mono font-bold text-center shrink-0 ${
                    isWinner ? 'text-[#34d399]' : 'text-slate-400'
                  }`}
                >
                  {runner.finishPosition ? `${runner.finishPosition}.` : `#${runner.number}`}
                </span>

                {/* Silk Circle */}
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: runner.silkColor }}
                />

                <div className="truncate">
                  <span className="font-bold text-white">
                    {currentLang === 'si' ? runner.horseNameSi : runner.horseName}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                    {runner.jockey} · {runner.trainer}
                  </span>
                </div>
              </div>

              {/* Odds & Margin */}
              <div className="flex items-center gap-3 shrink-0 font-mono">
                <span className="text-slate-300 text-[11px] font-semibold">
                  {runner.odds}
                </span>
                {runner.margin && (
                  <span
                    className={`font-bold ${
                      isWinner ? 'text-[#34d399]' : 'text-slate-300'
                    }`}
                  >
                    {runner.margin}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#163828]">
        {race.runners.length > 3 ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-bold text-[#34d399] hover:text-[#6ee7b7] cursor-pointer min-h-[36px]"
          >
            <span>
              {expanded
                ? currentLang === 'si'
                  ? 'අඩු කරන්න'
                  : 'Show Less'
                : currentLang === 'si'
                ? `සියලුම අශ්වයින් (${race.runners.length})`
                : `All Runners (${race.runners.length})`}
            </span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => onScanRaceShortcut(race)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e2a1e] hover:bg-[#143929] border border-[#1d4d38] text-xs font-bold text-white transition-colors cursor-pointer min-h-[36px]"
        >
          <Camera className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>
            {currentLang === 'si' ? 'ටිකට්පත ස්කෑන්' : 'Scan Slip'}
          </span>
        </button>
      </div>
    </div>
  );
};
